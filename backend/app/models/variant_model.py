# from pydantic import BaseModel, Field
# from typing import List, Optional


# class ClinicalData(BaseModel):
#     status: str = Field(..., description="ClinVar pathogenicity classification")
#     phenotypes: List[str] = Field(default_factory=list, description="Associated disease/phenotype names")
#     review_status: Optional[str] = Field(None, description="ClinVar review status (e.g. 'reviewed by expert panel')")
#     submissions: Optional[int] = Field(None, description="Number of ClinVar submitters/submissions")
#     last_evaluated: Optional[str] = None


# class PopulationData(BaseModel):
#     frequency: str = Field(..., description="Allele frequency from gnomAD (or MyVariant fallback)")
#     homozygotes: Optional[int] = Field(None, description="Homozygote count in gnomAD")
#     allele_count: Optional[int] = None
#     allele_number: Optional[int] = None
#     population: Optional[str] = Field(None, description="Population with the highest allele frequency (popmax)")


# class ProteinData(BaseModel):
#     domain: str = Field(..., description="Identified functional/structural domain region")
#     impact_score: float = Field(..., description="Computed protein functional impact (0.0 - 1.0)")
#     prediction: str = Field(..., description="Consequence prediction class (e.g. missense, frameshift)")
#     sift: Optional[str] = Field(None, description="SIFT prediction (e.g. 'deleterious', 'tolerated')")
#     polyphen: Optional[str] = Field(None, description="PolyPhen-2 prediction (e.g. 'probably_damaging')")
#     amino_acid_change: Optional[str] = None


# class LiteratureArticle(BaseModel):
#     title: str
#     journal: str
#     year: str
#     pmid: str
#     link: str


# class VariantResponse(BaseModel):
#     gene: str
#     variant: str
#     hgvs: str = Field(..., description="Standard HGVS nomenclature")
#     db_snp: Optional[str] = Field(None, description="dbSNP rsID")
#     transcript: Optional[str] = Field(None, description="Reference canonical transcript")
#     clinical: ClinicalData
#     population: PopulationData
#     protein: ProteinData
#     literature: List[LiteratureArticle] = Field(default_factory=list)
#     ai_summary: str


from pydantic import BaseModel, Field
from typing import List, Optional


class ClinicalData(BaseModel):
    status: str = Field(..., description="ClinVar pathogenicity classification")
    phenotypes: List[str] = Field(default_factory=list, description="Associated disease/phenotype names")
    review_status: Optional[str] = Field(None, description="ClinVar review status (e.g. 'reviewed by expert panel')")
    submissions: Optional[int] = Field(None, description="Number of ClinVar submitters/submissions")
    last_evaluated: Optional[str] = None


class PopulationData(BaseModel):
    frequency: str = Field(..., description="Allele frequency from gnomAD (or MyVariant fallback)")
    homozygotes: Optional[int] = Field(None, description="Homozygote count in gnomAD")
    allele_count: Optional[int] = None
    allele_number: Optional[int] = None
    population: Optional[str] = Field(None, description="Population with the highest allele frequency (popmax)")


class ProteinData(BaseModel):
    domain: str = Field(..., description="Identified functional/structural domain region")
    impact_score: float = Field(..., description="Computed protein functional impact (0.0 - 1.0)")
    prediction: str = Field(..., description="Consequence prediction class (e.g. missense, frameshift)")
    sift: Optional[str] = Field(None, description="SIFT prediction (e.g. 'deleterious', 'tolerated')")
    polyphen: Optional[str] = Field(None, description="PolyPhen-2 prediction (e.g. 'probably_damaging')")
    amino_acid_change: Optional[str] = None


class LiteratureArticle(BaseModel):
    title: str
    journal: str
    year: str
    pmid: str
    link: str


class VariantResponse(BaseModel):
    gene: str
    variant: str
    hgvs: str = Field(..., description="Standard HGVS nomenclature")
    db_snp: Optional[str] = Field(None, description="dbSNP rsID")
    transcript: Optional[str] = Field(None, description="Reference canonical transcript")
    clinical: ClinicalData
    population: PopulationData
    protein: ProteinData
    literature: List[LiteratureArticle] = Field(default_factory=list)
    ai_summary: str
