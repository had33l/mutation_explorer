import asyncio
from typing import Dict, Any

from app.models.variant_model import (
    VariantResponse,
    ClinicalData,
    PopulationData,
    ProteinData,
    LiteratureArticle,
)
from app.services.variant_parser import VariantParser
from app.services.resolver_service import ResolverService
from app.services.clinvar_service import ClinVarService
from app.services.population_service import PopulationService
from app.services.ensembl_service import EnsemblService
from app.services.pubmed_service import PubmedService
from app.services.acmg_engine import ACMGEngine
from app.services.ai_service import AIService


class VariantPipeline:
    """
    Orchestrates the single-responsibility services below into one
    variant interpretation. Mirrors this data flow:

        Variant Parser
              |
              v
        MyVariant Resolver
              |
        +-----+-----+
        |           |
        v           v
     ClinVar    Population       (run concurrently - both only need
        |           |             the resolver's output, not each other)
        +-----+-----+
              |
              v
          Ensembl                (protein annotation)
              |
              v
           PubMed                (literature)
              |
              v
         AI Summary              (explains, never classifies)
              |
              v
        JSON Response
    """

    @staticmethod
    async def run_pipeline(raw_input: str) -> VariantResponse:
        # 1. Parse - pure, local, no network
        parsed = VariantParser.parse(raw_input)
        gene = parsed.get("gene") or "UNKNOWN"
        hgvs_str = parsed.get("hgvs") or raw_input

        # 2. Resolve canonical identity via MyVariant
        resolved = await ResolverService.resolve(parsed)

        # If the resolver found a more specific gene (e.g. input was an rsID),
        # prefer it downstream.
        if resolved.get("myvariant_hit"):
            hit = resolved["myvariant_hit"]
            dbnsfp = hit.get("dbnsfp", {})
            if isinstance(dbnsfp, dict) and dbnsfp.get("genename") and gene == "UNKNOWN":
                gene = dbnsfp["genename"] if isinstance(dbnsfp["genename"], str) else dbnsfp["genename"][0]

        # 3. ClinVar and Population run concurrently - both only depend on
        #    the resolver's output, not on each other.
        clinvar_info, population_info = await asyncio.gather(
            ClinVarService.get_clinical_data(resolved, gene, hgvs_str),
            PopulationService.get_frequency(resolved),
        )

        # 4. Ensembl - protein-level annotation
        ensembl_info = await EnsemblService.get_annotation(resolved, parsed)

        # If Ensembl found a more authoritative gene symbol, prefer it
        if ensembl_info.get("gene"):
            gene = ensembl_info["gene"]

        # 5. PubMed - literature
        db_snp = clinvar_info.get("db_snp") or resolved.get("rsid")
        literature_raw = await PubmedService.mine_literature(gene, hgvs_str, db_snp)
        literature = [LiteratureArticle(**article) for article in literature_raw]

        # 6. Infer/confirm ACMG-style classification from the gathered evidence
        acmg_result = ACMGEngine.infer_criteria(
            {
                "consequence": ensembl_info.get("consequence", []),
                "sift": ensembl_info.get("sift"),
                "polyphen": ensembl_info.get("polyphen"),
            },
            clinvar_info,
            population_info,
            {},
        )
        status = acmg_result.get("classification", {}).get("status") or clinvar_info.get("status", "Uncertain Significance")

        impact_score = {
            "Pathogenic": 0.95,
            "Likely Pathogenic": 0.88,
            "Uncertain Significance": 0.45,
            "Likely Benign": 0.20,
            "Benign": 0.05,
        }.get(status, 0.45)

        domains = ensembl_info.get("domains", [])
        domain_str = f"Structural Domain: {', '.join(domains[:2])}" if domains else (
            f"Amino Acid Region (Pos: {parsed.get('position')})" if parsed.get("position") else "Functional Domain"
        )

        prediction = "Missense mutation"
        if ensembl_info.get("consequence"):
            prediction = ", ".join(ensembl_info["consequence"][:2]).replace("_", " ").title()

        transcript = ensembl_info.get("transcript") or f"{gene}-201"

        # 7. AI summary - only explains, never re-derives classification
        ai_summary = AIService.generate_explanation(
            gene=gene,
            hgvs=hgvs_str,
            clinvar=clinvar_info,
            population=population_info,
            protein={**ensembl_info, "domains": domains},
            literature=literature_raw,
        )

        return VariantResponse(
            gene=gene,
            variant=raw_input,
            hgvs=hgvs_str,
            db_snp=db_snp,
            transcript=transcript,
            clinical=ClinicalData(
                status=status,
                phenotypes=clinvar_info.get("phenotypes", []),
                review_status=clinvar_info.get("review_status"),
                submissions=clinvar_info.get("submissions"),
                last_evaluated=clinvar_info.get("last_evaluated"),
            ),
            population=PopulationData(
                frequency=population_info.get("frequency", "Not observed"),
                homozygotes=population_info.get("homozygotes"),
                allele_count=population_info.get("allele_count"),
                allele_number=population_info.get("allele_number"),
                population=population_info.get("population"),
            ),
            protein=ProteinData(
                domain=domain_str,
                impact_score=impact_score,
                prediction=prediction,
                sift=ensembl_info.get("sift"),
                polyphen=ensembl_info.get("polyphen"),
                amino_acid_change=ensembl_info.get("amino_acids"),
            ),
            literature=literature,
            ai_summary=ai_summary,
        )
