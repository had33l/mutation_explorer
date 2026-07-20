
# import httpx
# from typing import Dict, Any, Optional
# from urllib.parse import quote

# from app.config import settings


# class ClinVarService:
#     """
#     Single responsibility: clinical significance. Takes the canonical
#     rsID or genomic coordinate produced by ResolverService and returns
#     pathogenicity, associated diseases, review status, and submission count.

#     Queries NCBI E-utilities directly (most authoritative, includes
#     review status / submitter detail that aggregators often drop). If
#     that fails, falls back to the ClinVar block MyVariant already fetched
#     during resolution, so a single rate-limited NCBI outage doesn't kill
#     the whole clinical picture.
#     """

#     EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

#     @staticmethod
#     async def get_clinical_data(resolved: Dict[str, Any], gene: str, hgvs: str) -> Dict[str, Any]:
#         rsid = resolved.get("rsid")
#         search_term = f"{rsid}[Variant ID]" if rsid else f"{gene} AND {hgvs}"

#         eutils_result = await ClinVarService._query_eutils(search_term)
#         if eutils_result:
#             return eutils_result

#         # Fall back to the clinvar block already present on the MyVariant hit
#         hit = resolved.get("myvariant_hit") or {}
#         clinvar_block = hit.get("clinvar")
#         if clinvar_block:
#             return ClinVarService._extract_from_myvariant(clinvar_block)

#         return ClinVarService._empty()

#     @staticmethod
#     async def _query_eutils(search_term: str) -> Optional[Dict[str, Any]]:
#         esearch_url = (
#             f"{ClinVarService.EUTILS_BASE}/esearch.fcgi?"
#             f"db=clinvar&term={quote(search_term)}&retmode=json&retmax=5"
#             f"&email={quote(settings.NCBI_EMAIL)}"
#         )

#         async with httpx.AsyncClient() as client:
#             try:
#                 search_res = await client.get(esearch_url, timeout=6.0)
#                 if search_res.status_code != 200:
#                     return None

#                 id_list = search_res.json().get("esearchresult", {}).get("idlist", [])
#                 if not id_list:
#                     return None

#                 ids_str = ",".join(id_list)
#                 esummary_url = (
#                     f"{ClinVarService.EUTILS_BASE}/esummary.fcgi?"
#                     f"db=clinvar&id={ids_str}&retmode=json"
#                     f"&email={quote(settings.NCBI_EMAIL)}"
#                 )
#                 summary_res = await client.get(esummary_url, timeout=6.0)
#                 if summary_res.status_code != 200:
#                     return None

#                 results = summary_res.json().get("result", {})

#                 best_match, best_score = None, -1
#                 for clinvar_id, data in results.items():
#                     if clinvar_id == "uids" or not isinstance(data, dict):
#                         continue
#                     score = 0
#                     # Review status may live at the top level (older schema)
#                     # or inside one of the classification blocks (2024+ schema).
#                     review_candidates = [data.get("review_status")]
#                     for key in ("germline_classification", "oncogenicity_classification", "somatic_clinical_impact"):
#                         block = data.get(key)
#                         if isinstance(block, dict):
#                             review_candidates.append(block.get("review_status"))
#                     review_text = " ".join(r for r in review_candidates if r)

#                     if "reviewed by expert panel" in review_text or "practice guideline" in review_text:
#                         score += 100
#                     elif "multiple submitters" in review_text:
#                         score += 50
#                     if score > best_score:
#                         best_score, best_match = score, data

#                 if not best_match:
#                     return None

#                 return ClinVarService._extract_from_eutils(best_match)

#             except Exception as e:
#                 print(f"[ClinVar] eutils error: {e}")
#                 return None

#     @staticmethod
#     def _extract_from_eutils(data: Dict[str, Any]) -> Dict[str, Any]:
#         status = "Uncertain Significance"
#         review_status = None
#         last_evaluated = None
#         phenotypes = []

#         # NCBI's Jan 2024 release split the single "clinical_significance"
#         # field into three separate classification types. Check them in
#         # priority order, since a variant may have some or all of them.
#         # BRAF V600E, for example, is a somatic/oncogenic variant and will
#         # generally NOT have a germline_classification populated.
#         classification_keys = [
#             "somatic_clinical_impact",
#             "oncogenicity_classification",
#             "germline_classification",
#             "clinical_significance",
#     ]

#         significance = None
#         for key in classification_keys:
#             block = data.get(key)
#             if isinstance(block, dict) and (block.get("description") or block.get("classification")):
#                 significance = block
#                 status = block.get("description") or block.get("classification") or status
#                 review_status = block.get("review_status") or review_status
#                 last_evaluated = block.get("last_evaluated") or block.get("date_last_evaluated") or last_evaluated
#                 for cond in block.get("conditions", []) or []:
#                     if isinstance(cond, dict):
#                         name = cond.get("name") or cond.get("trait_name")
#                         if name and name not in phenotypes:
#                             phenotypes.append(name)
#                 break
#             elif isinstance(block, str) and block:
#                 status = block
#                 significance = block
#                 break

#         # Some records still carry a top-level trait_set regardless of
#         # classification type - merge in anything not already captured.
#         for trait in data.get("trait_set", []) or []:
#             if isinstance(trait, dict):
#                 name = trait.get("trait_name")
#                 if name and name not in phenotypes:
#                     phenotypes.append(name)

#         # Fall back to a top-level review_status/last_evaluated if the
#         # classification block didn't have one (older schema shape).
#         review_status = review_status or data.get("review_status")
#         last_evaluated = last_evaluated or data.get("last_evaluated")

#         db_snp = None
#         for var in data.get("variation_set", []) or []:
#             if not isinstance(var, dict):
#                 continue
#             for xref in var.get("variation_xrefs", []) or []:
#                 if isinstance(xref, dict) and xref.get("db_source") == "dbSNP":
#                     db_snp = f"rs{xref.get('db_id')}"
#                     break

#         # Submission count: esummary exposes actual SCV accessions under
#         # "supporting_submissions", grouped by classification type.
#         submissions = None
#         supporting = data.get("supporting_submissions")
#         if isinstance(supporting, dict):
#             total = 0
#             found_any = False
#             for value in supporting.values():
#                 if isinstance(value, list):
#                     total += len(value)
#                     found_any = True
#             if found_any:
#                 submissions = total
#         if submissions is None and isinstance(significance, dict):
#             submissions = significance.get("number_of_submitters") or significance.get("submission_count")

#         return {
#             "status": status,
#             "phenotypes": phenotypes or ["No specific phenotype reported"],
#             "review_status": review_status,
#             "submissions": submissions,
#             "db_snp": db_snp,
#             "last_evaluated": last_evaluated,
#         }

#     @staticmethod
#     def _extract_from_myvariant(clinvar_block: Dict[str, Any]) -> Dict[str, Any]:
#         rcv = clinvar_block.get("rcv", [])
#         entries = rcv if isinstance(rcv, list) else [rcv]
#         entries = [e for e in entries if isinstance(e, dict)]

#         status = "Uncertain Significance"
#         phenotypes = []
#         last_evaluated = None
#         review_status = None

#         if entries:
#             first = entries[0]
#             status = first.get("clinical_significance", status)
#             review_status = first.get("review_status")
#             last_evaluated = first.get("last_evaluated")
#             conditions = first.get("conditions", [])
#             if isinstance(conditions, list):
#                 phenotypes = [c.get("name") for c in conditions if isinstance(c, dict) and c.get("name")]
#             elif isinstance(conditions, dict) and conditions.get("name"):
#                 phenotypes = [conditions["name"]]

#         return {
#             "status": status,
#             "phenotypes": phenotypes or ["No specific phenotype reported"],
#             "review_status": review_status,
#             "submissions": len(entries) if entries else None,
#             "db_snp": None,
#             "last_evaluated": last_evaluated,
#         }

#     @staticmethod
#     def _empty() -> Dict[str, Any]:
#         return {
#             "status": "Uncertain Significance",
#             "phenotypes": ["No dynamic disease association found"],
#             "review_status": None,
#             "submissions": None,
#             "db_snp": None,
#             "last_evaluated": None,
#         }


import httpx
from typing import Dict, Any, Optional
from urllib.parse import quote

from app.config import settings


class ClinVarService:
    """
    Retrieves clinical interpretation from ClinVar.

    Strategy:
    1. Search ClinVar using rsID if available.
    2. Search using gene + HGVS.
    3. Rank returned records by:
       - exact variant match
       - exact gene match
       - review quality
    4. Fall back to MyVariant ClinVar data if needed.
    """

    EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"


    @staticmethod
    async def get_clinical_data(
        resolved: Dict[str, Any],
        gene: str,
        hgvs: str
    ) -> Dict[str, Any]:

        rsid = resolved.get("rsid")

        search_terms = []


        if rsid:
            search_terms.append(
                f"{rsid}[Variant ID]"
            )


        # Standard HGVS search
        search_terms.append(
            f'"{gene}" AND "{hgvs}"'
        )


        # Protein HGVS search
        if hgvs.startswith("p."):
            search_terms.append(
                f'{gene}[Gene Name] AND {hgvs}[Protein change]'
            )


        for term in search_terms:

            result = await ClinVarService._query_eutils(
                term,
                gene,
                hgvs
            )

            if result:
                return result



        # fallback to MyVariant
        hit = resolved.get("myvariant_hit") or {}

        clinvar_block = hit.get("clinvar")

        if clinvar_block:

            return ClinVarService._extract_from_myvariant(
                clinvar_block
            )


        return ClinVarService._empty()



    @staticmethod
    async def _query_eutils(
        search_term: str,
        gene: str,
        hgvs: str
    ) -> Optional[Dict[str, Any]]:


        esearch_url = (
            f"{ClinVarService.EUTILS_BASE}/esearch.fcgi?"
            f"db=clinvar"
            f"&term={quote(search_term)}"
            f"&retmode=json"
            f"&retmax=50"
            f"&email={quote(settings.NCBI_EMAIL)}"
        )


        async with httpx.AsyncClient() as client:

            try:

                search_res = await client.get(
                    esearch_url,
                    timeout=8.0
                )


                if search_res.status_code != 200:
                    return None



                id_list = (
                    search_res
                    .json()
                    .get("esearchresult", {})
                    .get("idlist", [])
                )


                if not id_list:
                    return None



                ids_str = ",".join(id_list)



                esummary_url = (
                    f"{ClinVarService.EUTILS_BASE}/esummary.fcgi?"
                    f"db=clinvar"
                    f"&id={ids_str}"
                    f"&retmode=json"
                    f"&email={quote(settings.NCBI_EMAIL)}"
                )


                summary_res = await client.get(
                    esummary_url,
                    timeout=8.0
                )


                if summary_res.status_code != 200:
                    return None



                results = (
                    summary_res
                    .json()
                    .get("result", {})
                )



                best_match = None
                best_score = -1



                for clinvar_id, data in results.items():


                    if (
                        clinvar_id == "uids"
                        or not isinstance(data, dict)
                    ):
                        continue



                    score = 0



                    title = (
                        str(data.get("title", ""))
                        .lower()
                    )


                    variation_name = (
                        str(data.get("variation_name", ""))
                        .lower()
                    )


                    searchable = (
                        title + " " + variation_name
                    )



                    gene_lower = gene.lower()
                    hgvs_lower = hgvs.lower()



                    # Exact HGVS match
                    if hgvs_lower in searchable:
                        score += 300



                    # Exact gene match
                    if gene_lower in searchable:
                        score += 100



                    # Review quality

                    reviews = []


                    if data.get("review_status"):
                        reviews.append(
                            data.get("review_status")
                        )


                    for key in (
                        "germline_classification",
                        "oncogenicity_classification",
                        "somatic_clinical_impact"
                    ):

                        block = data.get(key)

                        if isinstance(block, dict):

                            reviews.append(
                                block.get("review_status")
                            )


                    review_text = " ".join(
                        r for r in reviews if r
                    ).lower()



                    if "expert panel" in review_text:
                        score += 50

                    elif "multiple submitters" in review_text:
                        score += 25



                    # Penalize unrelated records

                    if gene_lower not in searchable:
                        score -= 100



                    if score > best_score:

                        best_score = score
                        best_match = data



                if not best_match:
                    return None



                print(
                    "[ClinVar] Selected:",
                    best_match.get("title"),
                    "score:",
                    best_score
                )



                return ClinVarService._extract_from_eutils(
                    best_match
                )


            except Exception as e:

                print(
                    f"[ClinVar] eutils error: {e}"
                )

                return None




    @staticmethod
    def _extract_from_eutils(
        data: Dict[str, Any]
    ) -> Dict[str, Any]:


        status = "Uncertain Significance"

        review_status = None

        last_evaluated = None

        phenotypes = []



        classification_keys = [

            "somatic_clinical_impact",

            "oncogenicity_classification",

            "germline_classification",

            "clinical_significance",

        ]



        significance = None



        for key in classification_keys:


            block = data.get(key)



            if isinstance(block, dict) and (
                block.get("description")
                or block.get("classification")
            ):

                significance = block


                status = (
                    block.get("description")
                    or block.get("classification")
                    or status
                )


                review_status = (
                    block.get("review_status")
                    or review_status
                )


                last_evaluated = (
                    block.get("last_evaluated")
                    or block.get("date_last_evaluated")
                    or last_evaluated
                )


                for cond in block.get("conditions", []) or []:

                    if isinstance(cond, dict):

                        name = (
                            cond.get("name")
                            or cond.get("trait_name")
                        )


                        if name and name not in phenotypes:
                            phenotypes.append(name)


                break



            elif isinstance(block, str) and block:

                status = block

                significance = block

                break




        for trait in data.get("trait_set", []) or []:

            if isinstance(trait, dict):

                name = trait.get("trait_name")

                if name and name not in phenotypes:
                    phenotypes.append(name)



        review_status = (
            review_status
            or data.get("review_status")
        )


        last_evaluated = (
            last_evaluated
            or data.get("last_evaluated")
        )



        db_snp = None



        for var in data.get("variation_set", []) or []:

            if not isinstance(var, dict):
                continue


            for xref in var.get("variation_xrefs", []) or []:

                if (
                    isinstance(xref, dict)
                    and xref.get("db_source") == "dbSNP"
                ):

                    db_snp = f"rs{xref.get('db_id')}"
                    break




        submissions = None


        supporting = data.get(
            "supporting_submissions"
        )


        if isinstance(supporting, dict):

            total = 0

            found = False


            for value in supporting.values():

                if isinstance(value, list):

                    total += len(value)

                    found = True


            if found:
                submissions = total



        return {

            "status": status,

            "phenotypes": phenotypes
            or ["No specific phenotype reported"],

            "review_status": review_status,

            "submissions": submissions,

            "db_snp": db_snp,

            "last_evaluated": last_evaluated,

        }




    @staticmethod
    def _extract_from_myvariant(
        clinvar_block: Dict[str, Any]
    ) -> Dict[str, Any]:


        rcv = clinvar_block.get(
            "rcv",
            []
        )


        entries = (
            rcv
            if isinstance(rcv, list)
            else [rcv]
        )


        entries = [
            e for e in entries
            if isinstance(e, dict)
        ]



        if entries:

            first = entries[0]

            return {

                "status": first.get(
                    "clinical_significance",
                    "Uncertain Significance"
                ),

                "phenotypes": [
                    c.get("name")
                    for c in first.get("conditions", [])
                    if isinstance(c, dict)
                    and c.get("name")
                ]
                or ["No specific phenotype reported"],


                "review_status":
                    first.get("review_status"),


                "submissions":
                    len(entries),


                "db_snp": None,


                "last_evaluated":
                    first.get("last_evaluated"),

            }



        return ClinVarService._empty()




    @staticmethod
    def _empty() -> Dict[str, Any]:

        return {

            "status":
                "Uncertain Significance",

            "phenotypes":
                ["No dynamic disease association found"],

            "review_status":
                None,

            "submissions":
                None,

            "db_snp":
                None,

            "last_evaluated":
                None,

        }