import httpx
from typing import Dict, Any, Optional


class PopulationService:
    """
    Single responsibility: population allele frequencies. Prefers a live
    gnomAD GraphQL lookup by the resolver's genomic coordinates (richest
    data - per-population breakdown, homozygote counts). Falls back to
    the gnomad_exome/gnomad_genome blocks already present on the
    MyVariant hit from resolution, so one slow/unavailable API doesn't
    blank out this whole section.
    """

    # NOTE: there is no "api." subdomain - the browser's own GraphQL
    # endpoint IS the API. Using "api.gnomad.broadinstitute.org" fails DNS
    # resolution entirely (confirmed against a real run).
    GRAPHQL_URL = "https://gnomad.broadinstitute.org/api"

    @staticmethod
    async def get_frequency(resolved: Dict[str, Any]) -> Dict[str, Any]:
        chrom, pos, ref, alt = (
            resolved.get("chrom"),
            resolved.get("pos"),
            resolved.get("ref"),
            resolved.get("alt"),
        )

        if chrom and pos and ref and alt:
            variant_id = f"{str(chrom).replace('chr', '')}-{pos}-{ref}-{alt}"
            gnomad_data = await PopulationService._query_gnomad(variant_id)
            if gnomad_data:
                return PopulationService._extract_gnomad(gnomad_data)

        # Fall back to whatever MyVariant already had on hand
        hit = resolved.get("myvariant_hit") or {}
        fallback = hit.get("gnomad_exome") or hit.get("gnomad_genome")
        if fallback:
            return PopulationService._extract_myvariant(fallback)

        return PopulationService._empty()

    @staticmethod
    async def _query_gnomad(variant_id: str) -> Optional[Dict[str, Any]]:
        query = """
        query Variant($variantId: String!) {
          variant(variantId: $variantId, dataset: gnomad_r4) {
            variant_id
            rsids
            exome { ac an af homozygote_count }
            genome { ac an af homozygote_count }
          }
        }
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    PopulationService.GRAPHQL_URL,
                    json={"query": query, "variables": {"variantId": variant_id}},
                    timeout=10.0,
                )
                if response.status_code == 200:
                    print(f"DEBUG: gnomAD raw data: {data}") #
                    return response.json().get("data", {}).get("variant")
            except Exception as e:
                print(f"[Population] gnomAD error for '{variant_id}': {e}")
        return None

    @staticmethod
    def _extract_gnomad(data: Dict[str, Any]) -> Dict[str, Any]:
        exome = data.get("exome") or {}
        genome = data.get("genome") or {}
        source = exome if exome.get("af") is not None else genome

        # Use helper to ensure everything is an int
        def to_int(val: Any) -> int:
            if isinstance(val, int): return val
            if isinstance(val, dict): return val.get("ac", 0) # or specific key if nested
            return 0

        af = source.get("af")
        return {
            "frequency": f"{af:.6f}" if af is not None and isinstance(af, (int, float)) else "Not observed",
            "homozygotes": int(source.get("homozygote_count", 0)),
            "allele_count": int(source.get("ac", 0)),
            "allele_number": int(source.get("an", 0)),
            "population": data.get("popmax_population"),
            "rsid": data.get("rsid"),
        }

    @staticmethod
    def _extract_myvariant(block: Dict[str, Any]) -> Dict[str, Any]:
        af = block.get("af")
        if isinstance(af, dict):
            af = af.get("af")

        return {
            "frequency": f"{float(af):.6f}" if af is not None else "Not observed",
            "homozygotes": block.get("hom", 0),
            "allele_count": block.get("ac", {}).get("ac") if isinstance(block.get("ac"), dict) else block.get("ac", 0),
            "allele_number": block.get("an", 0),
            "population": None,
            "rsid": None,
        }

    @staticmethod
    def _empty() -> Dict[str, Any]:
        return {
            "frequency": "Not observed",
            "homozygotes": 0,
            "allele_count": 0,
            "allele_number": 0,
            "population": None,
            "rsid": None,
        }
