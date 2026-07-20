from typing import List, Optional

from pydantic import BaseModel



# =====================================================
# RESOLVED VARIANT
# =====================================================

class ResolvedVariantSchema(BaseModel):

    gene: str

    hgvs: str

    rsid: Optional[str] = None

    chromosome: Optional[str] = None

    genomic_position: Optional[int] = None

    reference: Optional[str] = None

    alternate: Optional[str] = None

    transcript: Optional[str] = None



# =====================================================
# CLINVAR
# =====================================================

class ClinicalAnnotationSchema(BaseModel):

    significance: str = "Not available"

    review_status: Optional[str] = None

    diseases: List[str] = []

    submissions: Optional[int] = None



# =====================================================
# ENSEMBL PROTEIN
# =====================================================

class ProteinAnnotationSchema(BaseModel):

    transcript: Optional[str] = None

    consequence: Optional[str] = None

    amino_acids: Optional[str] = None

    codons: Optional[str] = None

    protein_position: Optional[int] = None


    sift_score: Optional[float] = None

    sift_prediction: Optional[str] = None


    polyphen_score: Optional[float] = None

    polyphen_prediction: Optional[str] = None


    impact: Optional[str] = None



# =====================================================
# POPULATION
# =====================================================

class PopulationFrequencySchema(BaseModel):

    overall_frequency: Optional[float] = None

    afr_frequency: Optional[float] = None

    eas_frequency: Optional[float] = None

    nfe_frequency: Optional[float] = None

    amr_frequency: Optional[float] = None



# =====================================================
# PUBLICATION
# =====================================================

class PaperSchema(BaseModel):

    title: str

    journal: Optional[str] = None

    year: Optional[str] = None

    pmid: Optional[str] = None

    link: Optional[str] = None



# =====================================================
# FINAL RESPONSE
# =====================================================

class VariantResponseSchema(BaseModel):

    gene: str

    variant: str

    hgvs: str


    resolved: Optional[ResolvedVariantSchema] = None


    clinical: Optional[ClinicalAnnotationSchema] = None


    protein: Optional[ProteinAnnotationSchema] = None


    population: Optional[PopulationFrequencySchema] = None


    literature: List[PaperSchema] = []


    ai_summary: Optional[str] = None