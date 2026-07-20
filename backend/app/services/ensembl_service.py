import httpx
from typing import Dict, Any, Optional
from urllib.parse import quote


class EnsemblService:
    """
    Single responsibility: protein-level annotation via the Ensembl VEP
    REST API. Returns transcript, consequence terms, SIFT/PolyPhen
    predictions, amino acid change, and protein domains.

    Prefers the resolver's canonical genomic HGVS (VEP handles that most
    reliably) and falls back to the raw protein-level HGVS from the
    parser if resolution didn't succeed.
    """

    BASE_URL = "https://rest.ensembl.org"

    @staticmethod
    async def get_annotation(resolved: Dict[str, Any], parsed: Dict[str, Any]) -> Dict[str, Any]:
        candidate_hgvs = resolved.get("hgvs_genomic") or parsed.get("hgvs")
        vep_data = None

        if candidate_hgvs:
            vep_data = await EnsemblService._query_vep_hgvs(candidate_hgvs)

        # Backup: query by region/allele directly using resolved coordinates.
        # More reliable than guessing a transcript-qualified HGVS string,
        # since the region endpoint needs no transcript/protein accession.
        if not vep_data:
            chrom, pos, alt = resolved.get("chrom"), resolved.get("pos"), resolved.get("alt")
            if chrom and pos and alt:
                vep_data = await EnsemblService._query_vep_region(chrom, pos, alt)

        if not vep_data:
            return EnsemblService._empty()

        return EnsemblService._extract(vep_data)

    @staticmethod
    async def _query_vep_region(chrom: str, pos: int, alt: str) -> Optional[Dict[str, Any]]:
        chrom = str(chrom).replace("chr", "")
        region = f"{chrom}:{pos}-{pos}/{alt}"
        url = f"{EnsemblService.BASE_URL}/vep/human/region/{quote(region)}?content-type=application/json"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, timeout=8.0)
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list) and data:
                        return data[0]
                else:
                    print(f"[Ensembl] VEP region HTTP {response.status_code} for '{region}': {response.text[:300]}")
            except Exception as e:
                print(f"[Ensembl] VEP region {type(e).__name__} for '{region}': {e or 'no detail'}")
        return None

    @staticmethod
    async def _query_vep_hgvs(hgvs: str) -> Optional[Dict[str, Any]]:
        # Ensembl's REST API uses bare chromosome names ("7", "X", "MT") with
        # no "chr" prefix. MyVariant's genomic HGVS (_id field) always comes
        # back UCSC-style with "chr" - stripping it here is required or VEP
        # returns 400 on every single genomic-coordinate lookup.
        formatted = hgvs.replace(" ", ":")
        if formatted.lower().startswith("chr"):
            formatted = formatted[3:]

        url = f"{EnsemblService.BASE_URL}/vep/human/hgvs/{quote(formatted)}?content-type=application/json"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, timeout=8.0)
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list) and data:
                        return data[0]
                else:
                    print(f"[Ensembl] VEP HTTP {response.status_code} for '{formatted}': {response.text[:300]}")
            except Exception as e:
                print(f"[Ensembl] VEP {type(e).__name__} for '{formatted}': {e or 'no detail'}")
        return None

    @staticmethod
    def _extract(vep_data: Dict[str, Any]) -> Dict[str, Any]:
        result = EnsemblService._empty()

        transcript_consequences = vep_data.get("transcript_consequences", [])
        if not transcript_consequences:
            return result

        canonical = next(
            (t for t in transcript_consequences if t.get("canonical") == 1),
            transcript_consequences[0],
        )

        result["gene"] = canonical.get("gene_symbol")
        result["transcript"] = canonical.get("transcript_id")
        result["consequence"] = canonical.get("consequence_terms", [])
        result["biotype"] = canonical.get("biotype")
        result["canonical"] = canonical.get("canonical") == 1
        result["protein_position"] = canonical.get("protein_start")
        result["amino_acids"] = canonical.get("amino_acids")
        result["codon_change"] = canonical.get("codons")

        domains = canonical.get("domains", [])
        if domains:
            result["domains"] = [d.get("name") for d in domains if d.get("name")]

        sift = canonical.get("sift", {})
        if isinstance(sift, dict):
            result["sift"] = sift.get("prediction")

        polyphen = canonical.get("polyphen", {})
        if isinstance(polyphen, dict):
            result["polyphen"] = polyphen.get("prediction")

        return result

    @staticmethod
    def _empty() -> Dict[str, Any]:
        return {
            "gene": None,
            "transcript": None,
            "consequence": [],
            "protein_position": None,
            "amino_acids": None,
            "codon_change": None,
            "biotype": None,
            "canonical": False,
            "domains": [],
            "sift": None,
            "polyphen": None,
        }
