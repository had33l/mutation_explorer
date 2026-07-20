import httpx
from typing import Dict, Any, List
from urllib.parse import quote

from app.config import settings


class PubmedService:
    """
    Single responsibility: literature. Queries NCBI E-utilities for
    papers relevant to a gene/variant and returns a short, clean list.
    """

    EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

    @staticmethod
    async def mine_literature(gene: str, hgvs: str, rsid: str = None) -> List[Dict[str, Any]]:
        search_terms = f"{gene} AND ({hgvs}"
        if rsid:
            search_terms += f" OR {rsid}"
        search_terms += ") AND (pathogenic OR mutation OR clinical)"

        esearch_url = (
            f"{PubmedService.EUTILS_BASE}/esearch.fcgi?"
            f"db=pubmed&term={quote(search_terms)}&retmode=json&retmax=3"
            f"&email={quote(settings.NCBI_EMAIL)}"
        )

        async with httpx.AsyncClient() as client:
            try:
                search_res = await client.get(esearch_url, timeout=6.0)
                if search_res.status_code != 200:
                    return []

                id_list = search_res.json().get("esearchresult", {}).get("idlist", [])
                if not id_list:
                    return []

                ids_str = ",".join(id_list)
                esummary_url = (
                    f"{PubmedService.EUTILS_BASE}/esummary.fcgi?"
                    f"db=pubmed&id={ids_str}&retmode=json"
                    f"&email={quote(settings.NCBI_EMAIL)}"
                )
                summary_res = await client.get(esummary_url, timeout=6.0)
                if summary_res.status_code != 200:
                    return []

                results = summary_res.json().get("result", {})
                articles = []
                for pmid in id_list:
                    article = results.get(pmid, {})
                    if not article:
                        continue
                    author = article.get("sortfirstauthor", "Unknown Author")
                    raw_date = article.get("pubdate", "")
                    year = raw_date.split()[0] if raw_date else "N/A"

                    articles.append({
                        "title": article.get("title", "Scientific Investigation"),
                        "journal": f"{article.get('source', 'PubMed')} ({author} et al.)",
                        "year": year,
                        "pmid": pmid,
                        "link": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                    })
                return articles

            except Exception as e:
                print(f"[PubMed] Error: {e}")
                return []
