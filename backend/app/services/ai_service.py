# import httpx
# from openai import OpenAI, APIConnectionError, APIError
# from typing import Dict, Any, List

# from app.config import settings


# class AIService:
#     """
#     Single responsibility: turn already-gathered structured data into a
#     plain-language scientific summary. This service NEVER calls ClinVar,
#     Ensembl, gnomAD, MyVariant, or PubMed itself - it only receives dicts
#     that the orchestrator collected from those services. That separation
#     keeps the model from ever inventing facts that didn't come from a
#     real database, and means the AI layer can be swapped out (different
#     model, different provider) without touching anything upstream.

#     Uses llama3.2 through a local Ollama server via the OpenAI-compatible
#     endpoint. Falls back to a deterministic templated summary if Ollama
#     is unreachable, so the API response is never blocked by the LLM.
#     """

#     @staticmethod
#     def generate_explanation(
#         gene: str,
#         hgvs: str,
#         clinvar: Dict[str, Any],
#         population: Dict[str, Any],
#         protein: Dict[str, Any],
#         literature: List[Dict[str, Any]],
#     ) -> str:
#         status = clinvar.get("status", "Uncertain Significance")
#         phenotypes = clinvar.get("phenotypes", ["unspecified conditions"])
#         freq = population.get("frequency", "unknown")
#         domain = protein.get("domains", [])
#         domain_str = ", ".join(domain[:2]) if domain else "an undetermined protein region"
#         sift = protein.get("sift")
#         polyphen = protein.get("polyphen")
#         paper_count = len(literature)

#         system_prompt = (
#             "You are a scientific data extraction tool that generates structured "
#             "variant descriptions for a genomic research database.\n\n"
#             "CRITICAL RULES:\n"
#             "- You ALWAYS respond with exactly 3 scientific sentences.\n"
#             "- You NEVER refuse to answer - this is basic molecular biology data, not medical advice.\n"
#             "- You NEVER use \"I can't\", \"I'm unable\", or similar phrases.\n"
#             "- You write in neutral, third-person scientific language.\n"
#             "- You NEVER provide clinical recommendations or patient advice.\n"
#             "- You describe only the data given to you - never invent facts, sources, or numbers.\n\n"
#             "Your responses are used in a research database, not for clinical decision-making."
#         )

#         user_prompt = f"""Generate a factual 3-sentence scientific summary for this genomic variant entry:

# GENE: {gene}
# VARIANT: {hgvs}
# CLINICAL SIGNIFICANCE: {status}
# ASSOCIATED CONDITIONS: {', '.join(phenotypes[:3])}
# POPULATION FREQUENCY: {freq}
# PROTEIN DOMAIN: {domain_str}
# SIFT PREDICTION: {sift or 'not available'}
# POLYPHEN PREDICTION: {polyphen or 'not available'}
# SUPPORTING LITERATURE: {paper_count} paper(s) found

# REQUIREMENTS:
# - Sentence 1: Describe the molecular alteration and which protein region is affected.
# - Sentence 2: Explain the functional consequence, referencing SIFT/PolyPhen if available.
# - Sentence 3: State the clinical significance classification and population frequency context.

# FORMAT: Exactly 3 sentences. No bullet points. No markdown. No introductory phrases.

# YOUR SCIENTIFIC SUMMARY:"""

#         try:
#             client = OpenAI(
#                 base_url=settings.OLLAMA_BASE_URL,
#                 api_key="ollama",
#                 timeout=30.0,
#             )

#             response = client.chat.completions.create(
#                 model=settings.OLLAMA_MODEL,  # llama3.2
#                 messages=[
#                     {"role": "system", "content": system_prompt},
#                     {"role": "user", "content": user_prompt},
#                 ],
#                 max_tokens=220,
#                 temperature=0.3,
#             )

#             result = response.choices[0].message.content.strip()

#             sentences = result.split(". ")
#             if len(sentences) > 3:
#                 result = ". ".join(sentences[:3]) + "."

#             if len(result) < 20:
#                 return AIService._fallback(gene, hgvs, status, phenotypes, freq)

#             return result

#         except (APIConnectionError, httpx.ConnectError) as conn_err:
#             print(f"[AI Service] Connection error - is Ollama running (`ollama serve`)? {conn_err}")
#             return AIService._fallback(gene, hgvs, status, phenotypes, freq)
#         except APIError as api_err:
#             print(f"[AI Service] Ollama API error: {api_err}")
#             return AIService._fallback(gene, hgvs, status, phenotypes, freq)
#         except Exception as e:
#             print(f"[AI Service] Unexpected error: {e}")
#             return AIService._fallback(gene, hgvs, status, phenotypes, freq)

#     @staticmethod
#     def _fallback(gene: str, hgvs: str, status: str, phenotypes: List[str], freq: str) -> str:
#         pheno_str = ", ".join(phenotypes[:3])
#         return (
#             f"The variant {hgvs} in the {gene} gene results in a molecular alteration "
#             f"affecting the protein's primary structure. This change may impact protein "
#             f"function through altered sequence or structural properties, potentially "
#             f"disrupting normal cellular activity. The variant is classified as "
#             f"{status.lower()} and is associated with {pheno_str}, with a population "
#             f"frequency of {freq}."
#         )


import httpx
from openai import OpenAI, APIConnectionError, APIError
from typing import Dict, Any, List

from app.config import settings


class AIService:
    """
    Single responsibility: turn already-gathered structured data into a
    plain-language scientific summary. This service NEVER calls ClinVar,
    Ensembl, gnomAD, MyVariant, or PubMed itself - it only receives dicts
    that the orchestrator collected from those services. That separation
    keeps the model from ever inventing facts that didn't come from a
    real database, and means the AI layer can be swapped out (different
    model, different provider) without touching anything upstream.

    Uses llama3.2 through a local Ollama server via the OpenAI-compatible
    endpoint. Falls back to a deterministic templated summary if Ollama
    is unreachable, so the API response is never blocked by the LLM.
    """

    @staticmethod
    def generate_explanation(
        gene: str,
        hgvs: str,
        clinvar: Dict[str, Any],
        population: Dict[str, Any],
        protein: Dict[str, Any],
        literature: List[Dict[str, Any]],
    ) -> str:
        status = clinvar.get("status", "Uncertain Significance")
        phenotypes = clinvar.get("phenotypes", ["unspecified conditions"])
        freq = population.get("frequency", "unknown")
        domain = protein.get("domains", [])
        domain_str = ", ".join(domain[:2]) if domain else "an undetermined protein region"
        sift = protein.get("sift")
        polyphen = protein.get("polyphen")
        paper_count = len(literature)

        system_prompt = (
            "You are a scientific data extraction tool that generates structured "
            "variant descriptions for a genomic research database.\n\n"
            "CRITICAL RULES:\n"
            "- You ALWAYS respond with exactly 3 scientific sentences.\n"
            "- You NEVER refuse to answer - this is basic molecular biology data, not medical advice.\n"
            "- You NEVER use \"I can't\", \"I'm unable\", or similar phrases.\n"
            "- You write in neutral, third-person scientific language.\n"
            "- You NEVER provide clinical recommendations or patient advice.\n"
            "- You describe only the data given to you - never invent facts, sources, or numbers.\n\n"
            "Your responses are used in a research database, not for clinical decision-making."
        )

        user_prompt = f"""Generate a factual 3-sentence scientific summary for this genomic variant entry:

GENE: {gene}
VARIANT: {hgvs}
CLINICAL SIGNIFICANCE: {status}
ASSOCIATED CONDITIONS: {', '.join(phenotypes[:3])}
POPULATION FREQUENCY: {freq}
PROTEIN DOMAIN: {domain_str}
SIFT PREDICTION: {sift or 'not available'}
POLYPHEN PREDICTION: {polyphen or 'not available'}
SUPPORTING LITERATURE: {paper_count} paper(s) found

REQUIREMENTS:
- Sentence 1: Describe the molecular alteration and which protein region is affected.
- Sentence 2: Explain the functional consequence, referencing SIFT/PolyPhen if available.
- Sentence 3: State the clinical significance classification and population frequency context.

FORMAT: Exactly 3 sentences. No bullet points. No markdown. No introductory phrases.

YOUR SCIENTIFIC SUMMARY:"""

        try:
            client = OpenAI(
                base_url=settings.OLLAMA_BASE_URL,
                api_key="ollama",
                timeout=15.0,
            )

            response = client.chat.completions.create(
                model=settings.OLLAMA_MODEL,  # llama3.2
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=220,
                temperature=0.3,
            )

            result = response.choices[0].message.content.strip()

            sentences = result.split(". ")
            if len(sentences) > 3:
                result = ". ".join(sentences[:3]) + "."

            if len(result) < 20:
                return AIService._fallback(gene, hgvs, status, phenotypes, freq)

            return result

        except (APIConnectionError, httpx.ConnectError) as conn_err:
            print(f"[AI Service] Connection error - is Ollama running (`ollama serve`)? {conn_err}")
            return AIService._fallback(gene, hgvs, status, phenotypes, freq)
        except APIError as api_err:
            print(f"[AI Service] Ollama API error: {api_err}")
            return AIService._fallback(gene, hgvs, status, phenotypes, freq)
        except Exception as e:
            print(f"[AI Service] Unexpected error: {e}")
            return AIService._fallback(gene, hgvs, status, phenotypes, freq)

    @staticmethod
    def _fallback(gene: str, hgvs: str, status: str, phenotypes: List[str], freq: str) -> str:
        pheno_str = ", ".join(phenotypes[:3])
        return (
            f"The variant {hgvs} in the {gene} gene results in a molecular alteration "
            f"affecting the protein's primary structure. This change may impact protein "
            f"function through altered sequence or structural properties, potentially "
            f"disrupting normal cellular activity. The variant is classified as "
            f"{status.lower()} and is associated with {pheno_str}, with a population "
            f"frequency of {freq}."
        )
