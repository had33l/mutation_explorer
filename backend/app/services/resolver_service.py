import httpx
from typing import Dict, Any, Optional
from urllib.parse import quote


class ResolverService:
    """
    Single responsibility: establish the canonical identity of a variant
    using MyVariant.info, so every downstream service (ClinVar, Ensembl,
    population) works off the same coordinates instead of each re-guessing
    from the user's raw text.

    Returns a "resolved" dict shaped like:
      {
        "resolved": bool,
        "rsid": "rs28934578" | None,
        "hgvs_genomic": "chr17:g.7674220C>T" | None,
        "chrom": "17" | None,
        "pos": 7674220 | None,
        "ref": "C" | None,
        "alt": "T" | None,
        "myvariant_hit": {...}  # raw hit, reused by clinvar/population services
                                 # to avoid duplicate network calls
      }
    """

    BASE_URL = "https://myvariant.info/v1"
    FIELDS = "dbsnp.rsid,clinvar,gnomad_exome,gnomad_genome,chrom,vcf,hg19,hg38,cadd"

    @staticmethod
    async def resolve(parsed: Dict[str, Any]) -> Dict[str, Any]:
        empty = {
            "resolved": False,
            "rsid": parsed.get("rsid"),
            "hgvs_genomic": None,
            "chrom": None,
            "pos": None,
            "ref": None,
            "alt": None,
            "myvariant_hit": None,
        }

        # Case 1: user already gave us an rsID or genomic HGVS - fetch it directly.
        direct_id = None
        if parsed.get("variant_type") == "rsid" and parsed.get("rsid"):
            direct_id = parsed["rsid"]
        elif parsed.get("variant_type") == "genomic_hgvs" and parsed.get("hgvs"):
            direct_id = parsed["hgvs"]

        if direct_id:
            hit = await ResolverService._fetch_by_id(direct_id)
            if hit:
                return ResolverService._extract(hit)
            return empty

        # Case 2: gene + protein change (e.g. TP53 / p.R175H) - search dbNSFP
        # annotations, which index amino-acid position per gene.
        gene = parsed.get("gene")
        position = parsed.get("position")
        if gene and gene != "UNKNOWN" and position:
            query = f'dbnsfp.genename:"{gene}" AND dbnsfp.aa.pos:{position}'
            hit = await ResolverService._search(query, expected_gene=gene)

            if hit:
                dbnsfp = hit.get("dbnsfp", {})

                if isinstance(dbnsfp, dict):
                    hit_gene = dbnsfp.get("genename")

                    if isinstance(hit_gene, list):
                        hit_gene = hit_gene[0]

                    if isinstance(hit_gene, str) and hit_gene.upper() == gene.upper():
                        return ResolverService._extract(hit)

        # Case 3: last resort - free text search on gene + hgvs string
        if gene and gene != "UNKNOWN":
            fallback_query = f'{gene} "{parsed.get("hgvs", "")}"'
            hit = await ResolverService._search(
                fallback_query,
                expected_gene=gene,
            )

        if hit:
            dbnsfp = hit.get("dbnsfp", {})

            if isinstance(dbnsfp, dict):
                hit_gene = dbnsfp.get("genename")

                if isinstance(hit_gene, list):
                    hit_gene = hit_gene[0]

                if isinstance(hit_gene, str) and hit_gene.upper() == gene.upper():
                    return ResolverService._extract(hit)

        return empty

    @staticmethod
    async def _fetch_by_id(variant_id: str) -> Optional[Dict[str, Any]]:
        url = f"{ResolverService.BASE_URL}/variant/{quote(variant_id)}?fields={ResolverService.FIELDS}"
        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(url, timeout=6.0)
                if res.status_code == 200:
                    data = res.json()
                    if isinstance(data, list) and data:
                        return data[0]
                    if isinstance(data, dict) and data.get("_id"):
                        return data
            except Exception as e:
                print(f"[Resolver] Direct fetch error for '{variant_id}': {e}")
        return None

    @staticmethod
    async def _search(query: str, expected_gene: str | None = None) -> Optional[Dict[str, Any]]:
        url = (
            f"{ResolverService.BASE_URL}/query?"
            f"q={quote(query)}"
            f"&fields={ResolverService.FIELDS},"
            f"&size=20"
        )

        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(url, timeout=6.0)
                if res.status_code != 200:
                    return None

                hits = res.json().get("hits", [])
                if not hits:
                    return None

                if expected_gene:
                    expected_gene = expected_gene.upper()
                    for hit in hits:
                        dbsnp = hit.get("dbsnp",{})

                        if isinstance(dbsnp, dict):
                            gene = dbsnp,get(genename)
                            if isinstance(gene, list):
                                gene = gene[0] 
                            if isinstance(gene, str) and gene.upper() == expected_gene:
                                return hit
                return hits[0]
            except Exception as e:
                print(f"[Resolver] search error for '{query}': {e}")
        return None       

    @staticmethod
    def _extract(hit: Dict[str, Any]) -> Dict[str, Any]:
        rsid = None
        dbsnp = hit.get("dbsnp")
        if isinstance(dbsnp, dict):
            rsid = dbsnp.get("rsid")
        elif isinstance(dbsnp, list) and dbsnp:
            rsid = dbsnp[0].get("rsid")

        chrom = hit.get("chrom")
        vcf = hit.get("vcf", {})
        pos = vcf.get("position") if isinstance(vcf, dict) else None
        ref = vcf.get("ref") if isinstance(vcf, dict) else None
        alt = vcf.get("alt") if isinstance(vcf, dict) else None

        hgvs_genomic = hit.get("_id")

        return {
            "resolved": True,
            "rsid": rsid,
            "hgvs_genomic": hgvs_genomic,
            "chrom": chrom,
            "pos": pos,
            "ref": ref,
            "alt": alt,
            "myvariant_hit": hit,
        }
