import re
from typing import Dict, Any


class VariantParser:
    """
    Single responsibility: turn whatever the user typed into a structured,
    predictable shape. No network calls, no external services - this module
    is pure and synchronous so it's trivial to unit test.

    Input examples handled:
      "TP53 R175H"        -> protein change, space-separated
      "TP53 p.R175H"      -> protein change, explicit p. prefix
      "TP53:p.R175H"      -> protein change, colon-separated
      "BRAF V600E"        -> protein change
      "HBB c.20A>T"       -> coding DNA change
      "rs28934578"        -> dbSNP rsID (passed through, resolved downstream)
      "chr17:g.7674220C>T"-> genomic HGVS (passed through, resolved downstream)
    """

    @staticmethod
    def parse(raw_input: str) -> Dict[str, Any]:
        cleaned = (raw_input or "").strip()

        if not cleaned:
            return {
                "raw": raw_input,
                "gene": "UNKNOWN",
                "variant_type": "unknown",
                "hgvs": "",
                "position": None,
                "is_protein": False,
                "ref_aa": None,
                "alt_aa": None,
                "rsid": None,
            }

        # Pass-through identifiers: dbSNP rsID or genomic HGVS.
        # These already have everything the resolver needs, so we don't
        # try to guess gene/position from them here.
        if re.match(r"^rs\d+$", cleaned, re.IGNORECASE):
            return {
                "raw": cleaned,
                "gene": None,
                "variant_type": "rsid",
                "hgvs": cleaned,
                "position": None,
                "is_protein": False,
                "ref_aa": None,
                "alt_aa": None,
                "rsid": cleaned.lower(),
            }

        if re.match(r"^(chr)?[0-9XYMxym]+:g\.", cleaned, re.IGNORECASE):
            return {
                "raw": cleaned,
                "gene": None,
                "variant_type": "genomic_hgvs",
                "hgvs": cleaned,
                "position": None,
                "is_protein": False,
                "ref_aa": None,
                "alt_aa": None,
                "rsid": None,
            }

        # Split into [GENE, MUTATION] - handles space or colon separated input
        parts = re.split(r"\s+", cleaned, maxsplit=1)
        if len(parts) < 2:
            parts = cleaned.split(":", 1)

        if len(parts) < 2:
            # No recognizable gene/mutation split at all
            return {
                "raw": cleaned,
                "gene": cleaned.upper(),
                "variant_type": "unknown",
                "hgvs": cleaned,
                "position": None,
                "is_protein": False,
                "ref_aa": None,
                "alt_aa": None,
                "rsid": None,
            }

        gene, mutation = parts[0].upper(), parts[1].strip()

        # Protein change: R175H, p.R175H, p.Arg175His
        protein_match = re.search(
            r"(?:p\.)?([A-Z][a-z]{0,2})(\d+)([A-Z][a-z]{0,2})",
            mutation,
            re.IGNORECASE,
        )
        if protein_match:
            ref, pos, alt = protein_match.groups()
            return {
                "raw": cleaned,
                "gene": gene,
                "variant_type": "missense",
                "hgvs": f"p.{ref}{pos}{alt}",
                "position": int(pos),
                "is_protein": True,
                "ref_aa": ref.upper(),
                "alt_aa": alt.upper(),
                "rsid": None,
            }

        # Coding DNA change: c.20A>T, c.5266dupC
        cdna_match = re.search(r"c\.(\d+)([A-Z_>a-z]+)", mutation)
        if cdna_match:
            pos_str, change = cdna_match.groups()
            pos = int(pos_str)
            return {
                "raw": cleaned,
                "gene": gene,
                "variant_type": "frameshift" if ("dup" in change or "del" in change) else "substitution",
                "hgvs": f"c.{pos}{change}",
                "position": max(1, pos // 3),  # rough amino-acid position estimate
                "is_protein": False,
                "ref_aa": None,
                "alt_aa": None,
                "rsid": None,
            }

        # Fell through - keep gene, treat the rest as an opaque variant string
        return {
            "raw": cleaned,
            "gene": gene,
            "variant_type": "variant",
            "hgvs": mutation,
            "position": None,
            "is_protein": False,
            "ref_aa": None,
            "alt_aa": None,
            "rsid": None,
        }
