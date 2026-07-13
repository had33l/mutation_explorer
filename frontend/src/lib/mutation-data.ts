import type {
  Sample,
  BoxplotRange,
  EnrichItem,
  EnrichKey,
  ProteinInfo,
  Report,
  UploadHistoryEntry,
} from "./mutation-types";

export const SAMPLE_ORDER: string[] = ["patient_0142", "patient_0143", "patient_0144", "patient_0145", "patient_0146"];

export const SAMPLES: Record<string, Sample> = {
  patient_0142: { patient:"Patient A", pred:"tumor", label:"This sample looks like tumor tissue", conf:96,
    diffs:[
      { name:"Invasive ductal carcinoma", pct:96, top:true, genes:"TP53, MYC, BRCA1", src:"TCGA-BRCA + ClinVar" },
      { name:"Normal / non-tumor tissue", pct:3, genes:"GATA3, ESR1", src:"TCGA-BRCA" },
      { name:"Other tissue anomaly", pct:1, genes:"—", src:"—" }
    ],
    genes:[
      { g:"TP53", w:88, note:"Strongest signal in this sample" },
      { g:"MYC", w:64, note:"Commonly elevated in this cancer type" },
      { g:"BRCA1", w:46, note:"Known hereditary cancer gene" }
    ]
  },
  patient_0143: { patient:"Patient B", pred:"normal", label:"This sample looks like normal tissue", conf:98,
    diffs:[
      { name:"Normal / non-tumor tissue", pct:98, top:true, genes:"GATA3, ESR1, FOXA1", src:"TCGA-BRCA" },
      { name:"Invasive ductal carcinoma", pct:1.5, genes:"TP53", src:"ClinVar" },
      { name:"Other tissue anomaly", pct:0.5, genes:"—", src:"—" }
    ],
    genes:[
      { g:"GATA3", w:80, note:"Baseline expression, as expected in healthy tissue" },
      { g:"ESR1", w:58, note:"Normal hormone-receptor signaling" },
      { g:"FOXA1", w:33, note:"Consistent with non-tumor profile" }
    ]
  },
  patient_0144: { patient:"Patient A", pred:"tumor", label:"This sample looks like tumor tissue", conf:84,
    diffs:[
      { name:"Invasive ductal carcinoma", pct:84, top:true, genes:"TP53, MYC", src:"TCGA-BRCA + ClinVar" },
      { name:"Normal / non-tumor tissue", pct:12, genes:"GATA3", src:"TCGA-BRCA" },
      { name:"Other tissue anomaly", pct:4, genes:"—", src:"—" }
    ],
    genes:[
      { g:"TP53", w:70, note:"Elevated, consistent with tumor signal" },
      { g:"MYC", w:55, note:"Moderately elevated" },
      { g:"BRCA1", w:20, note:"Within a borderline range" }
    ]
  },
  patient_0145: { patient:"Patient C", pred:"tumor", label:"This sample looks like tumor tissue", conf:91,
    diffs:[
      { name:"Invasive ductal carcinoma", pct:91, top:true, genes:"BRCA1, TP53", src:"TCGA-BRCA + ClinVar" },
      { name:"Hereditary breast cancer pattern", pct:7, genes:"BRCA1", src:"ClinVar" },
      { name:"Normal / non-tumor tissue", pct:2, genes:"—", src:"—" }
    ],
    genes:[
      { g:"BRCA1", w:75, note:"Strongest signal in this sample" },
      { g:"TP53", w:52, note:"Elevated alongside BRCA1" },
      { g:"MYC", w:24, note:"Modest contribution" }
    ]
  },
  patient_0146: { patient:"Patient D", pred:"normal", label:"This sample looks like normal tissue", conf:89,
    diffs:[
      { name:"Normal / non-tumor tissue", pct:89, top:true, genes:"GATA3, FOXA1", src:"TCGA-BRCA" },
      { name:"Invasive ductal carcinoma", pct:9, genes:"TP53", src:"ClinVar" },
      { name:"Other tissue anomaly", pct:2, genes:"—", src:"—" }
    ],
    genes:[
      { g:"GATA3", w:66, note:"Consistent with healthy tissue" },
      { g:"FOXA1", w:40, note:"Within expected range" },
      { g:"ESR1", w:22, note:"Slightly below typical baseline" }
    ]
  }
};

export const BOXPLOTS: Record<string, BoxplotRange> = {
  TP53:  { normalLo:18, normalHi:38, tumorLo:55, tumorHi:92, sample:88 },
  MYC:   { normalLo:22, normalHi:44, tumorLo:48, tumorHi:80, sample:64 },
  BRCA1: { normalLo:15, normalHi:35, tumorLo:30, tumorHi:60, sample:46 },
  ESR1:  { normalLo:40, normalHi:70, tumorLo:15, tumorHi:45, sample:31 },
  GATA3: { normalLo:45, normalHi:75, tumorLo:10, tumorHi:38, sample:20 },
  FOXA1: { normalLo:38, normalHi:66, tumorLo:12, tumorHi:40, sample:33 }
};

export const ENRICH: Record<EnrichKey, EnrichItem[]> = {
  go: [
    { name:"Regulation of cell cycle", w:92, note:"34 genes · padj = 3.2e-9" },
    { name:"DNA damage response", w:81, note:"27 genes · padj = 6.5e-8" },
    { name:"Apoptotic process", w:68, note:"22 genes · padj = 2.1e-6" },
    { name:"Regulation of transcription", w:54, note:"40 genes · padj = 4.4e-5" }
  ],
  kegg: [
    { name:"p53 signaling pathway", w:95, note:"18 genes · padj = 1.8e-10" },
    { name:"Cell cycle", w:78, note:"25 genes · padj = 3.0e-7" },
    { name:"PI3K–Akt signaling pathway", w:59, note:"31 genes · padj = 1.2e-5" },
    { name:"Breast cancer", w:47, note:"14 genes · padj = 8.7e-4" }
  ],
  reactome: [
    { name:"Cell Cycle Checkpoints", w:88, note:"21 genes · padj = 4.1e-8" },
    { name:"DNA Repair", w:74, note:"19 genes · padj = 2.8e-6" },
    { name:"Signal Transduction", w:51, note:"46 genes · padj = 3.5e-5" },
    { name:"Apoptosis", w:42, note:"17 genes · padj = 6.9e-4" }
  ],
  hallmark: [
    { name:"HALLMARK_G2M_CHECKPOINT", w:90, note:"29 genes · padj = 2.0e-9" },
    { name:"HALLMARK_E2F_TARGETS", w:83, note:"26 genes · padj = 5.4e-8" },
    { name:"HALLMARK_P53_PATHWAY", w:70, note:"20 genes · padj = 1.6e-6" },
    { name:"HALLMARK_APOPTOSIS", w:45, note:"16 genes · padj = 5.2e-4" }
  ]
};

export const ENRICH_TABS: { key: EnrichKey; label: string }[] = [
  { key:"go", label:"Gene Ontology" },
  { key:"kegg", label:"KEGG pathways" },
  { key:"reactome", label:"Reactome" },
  { key:"hallmark", label:"Hallmark" }
];

export const PROTEINS: Record<string, ProteinInfo> = {
  TP53: { name:"p53", func:"Tumor suppressor", loc:"Cell nucleus", domain:"DNA-binding domain", disease:"Multiple cancer types",
    explain:"p53 normally acts as a \"quality control\" checkpoint, stopping damaged cells from dividing. When it isn't working properly, damaged cells can multiply unchecked — which is why it shows up so often in cancer.",
    reasoning:"TP53 expression is upregulated in this sample (z-score: +2.4), placing it in the 98th percentile of the cohort — consistent with it being one of the top contributors (SHAP value +0.42) to this sample's tumor prediction.",
    tags:["Cell-cycle arrest","DNA repair","p53 signaling pathway","Apoptosis"],
    links:[{label:"ClinVar", url:"https://www.ncbi.nlm.nih.gov/clinvar/?term=TP53"},{label:"COSMIC", url:"https://cancer.sanger.ac.uk/cosmic/gene/analysis?ln=TP53"},{label:"PubMed", url:"https://pubmed.ncbi.nlm.nih.gov/?term=TP53+cancer"}],
    therapy:{ name:"APR-246 (Eprenetapopt)", note:"Investigational agent designed to restore normal function to mutant p53 — in clinical trials for TP53-mutated cancers." } },
  MYC: { name:"c-Myc", func:"Growth & division regulator", loc:"Cell nucleus", domain:"Transcription factor domain",
    disease:"Elevated in many solid tumors",
    explain:"MYC tells cells when to grow and divide. When it's overactive, it can push cells to multiply far faster than they should.",
    reasoning:"MYC expression is upregulated in this sample (z-score: +1.8), placing it in the 91st percentile of the cohort — a common driver of the proliferative signature seen in this tumor subtype (SHAP value +0.31).",
    tags:["Cell proliferation","Transcriptional amplification","MYC target genes"],
    links:[{label:"ClinVar", url:"https://www.ncbi.nlm.nih.gov/clinvar/?term=MYC"},{label:"COSMIC", url:"https://cancer.sanger.ac.uk/cosmic/gene/analysis?ln=MYC"},{label:"PubMed", url:"https://pubmed.ncbi.nlm.nih.gov/?term=MYC+cancer"}],
    therapy:null },
  BRCA1: { name:"BRCA1", func:"DNA repair protein", loc:"Cell nucleus", domain:"RING & BRCT domains",
    disease:"Hereditary breast & ovarian cancer",
    explain:"BRCA1 helps repair broken DNA strands. Inherited changes in this gene reduce that repair capacity, raising long-term cancer risk.",
    reasoning:"BRCA1 expression is reduced in this sample (z-score: −1.6), placing it in the 8th percentile of the cohort — consistent with impaired homologous recombination repair (SHAP value +0.22 toward the tumor prediction).",
    tags:["DNA repair","Homologous recombination","BRCA1 signaling"],
    links:[{label:"ClinVar", url:"https://www.ncbi.nlm.nih.gov/clinvar/?term=BRCA1"},{label:"COSMIC", url:"https://cancer.sanger.ac.uk/cosmic/gene/analysis?ln=BRCA1"},{label:"PubMed", url:"https://pubmed.ncbi.nlm.nih.gov/?term=BRCA1+cancer"}],
    therapy:{ name:"Olaparib (PARP inhibitor)", note:"Approved for BRCA1/2-mutated breast and ovarian cancers — exploits reduced DNA-repair capacity via synthetic lethality." } },
  ESR1: { name:"ERα (estrogen receptor 1)", func:"Hormone receptor / transcription factor", loc:"Cell nucleus", domain:"Ligand-binding domain",
    disease:"Hormone-receptor breast cancer subtyping",
    explain:"ESR1 encodes the estrogen receptor, which drives growth in hormone-sensitive breast tumors. Its expression level determines whether hormone-blocking therapy is likely to help.",
    reasoning:"ESR1 expression is reduced in this sample (z-score: −2.1), placing it in the 6th percentile of the cohort — consistent with a hormone-receptor-negative profile.",
    tags:["Hormone receptor signaling","Estrogen response","Endocrine therapy target"],
    links:[{label:"ClinVar", url:"https://www.ncbi.nlm.nih.gov/clinvar/?term=ESR1"},{label:"COSMIC", url:"https://cancer.sanger.ac.uk/cosmic/gene/analysis?ln=ESR1"},{label:"PubMed", url:"https://pubmed.ncbi.nlm.nih.gov/?term=ESR1+breast+cancer"}],
    therapy:{ name:"Tamoxifen / Fulvestrant", note:"Effective mainly in ER-positive tumors — this sample's low ESR1 expression suggests limited expected benefit." } },
  GATA3: { name:"GATA3", func:"Transcription factor", loc:"Cell nucleus", domain:"Zinc-finger DNA-binding domain",
    disease:"Luminal breast cancer differentiation",
    explain:"GATA3 helps maintain the identity of luminal breast epithelial cells. Lower levels are often seen in less-differentiated, more aggressive tumors.",
    reasoning:"GATA3 expression is reduced in this sample (z-score: −1.4), placing it in the 12th percentile of the cohort — a pattern often seen in less-differentiated tumors.",
    tags:["Luminal differentiation","Transcription factor","Mammary epithelial identity"],
    links:[{label:"ClinVar", url:"https://www.ncbi.nlm.nih.gov/clinvar/?term=GATA3"},{label:"COSMIC", url:"https://cancer.sanger.ac.uk/cosmic/gene/analysis?ln=GATA3"},{label:"PubMed", url:"https://pubmed.ncbi.nlm.nih.gov/?term=GATA3+breast+cancer"}],
    therapy:null },
  FOXA1: { name:"FOXA1", func:"Pioneer transcription factor", loc:"Cell nucleus", domain:"Forkhead DNA-binding domain",
    disease:"Luminal breast cancer subtyping",
    explain:"FOXA1 opens up chromatin so other transcription factors, including the estrogen receptor, can bind DNA. It typically tracks with ESR1 and GATA3 expression.",
    reasoning:"FOXA1 expression is reduced in this sample (z-score: −1.1), placing it in the 15th percentile of the cohort — consistent with the lower ESR1/GATA3 levels also seen here.",
    tags:["Pioneer transcription factor","Chromatin accessibility","Luminal subtype marker"],
    links:[{label:"ClinVar", url:"https://www.ncbi.nlm.nih.gov/clinvar/?term=FOXA1"},{label:"COSMIC", url:"https://cancer.sanger.ac.uk/cosmic/gene/analysis?ln=FOXA1"},{label:"PubMed", url:"https://pubmed.ncbi.nlm.nih.gov/?term=FOXA1+breast+cancer"}],
    therapy:null },
  EGFR: { name:"EGFR", func:"Receptor tyrosine kinase", loc:"Cell membrane", domain:"Kinase domain",
    disease:"Multiple carcinomas, treatment-resistant subtypes",
    explain:"EGFR sits on the cell surface and switches on growth signals inside the cell. Overactive EGFR signaling is linked to faster-growing, sometimes treatment-resistant tumors.",
    reasoning:"EGFR expression is upregulated in this sample (z-score: +1.9), placing it in the 89th percentile of the cohort — a pattern associated with more aggressive, treatment-resistant tumor subtypes.",
    tags:["Receptor tyrosine kinase","MAPK signaling","Cell proliferation"],
    links:[{label:"ClinVar", url:"https://www.ncbi.nlm.nih.gov/clinvar/?term=EGFR"},{label:"COSMIC", url:"https://cancer.sanger.ac.uk/cosmic/gene/analysis?ln=EGFR"},{label:"PubMed", url:"https://pubmed.ncbi.nlm.nih.gov/?term=EGFR+cancer"}],
    therapy:{ name:"Cetuximab / Erlotinib", note:"Approved EGFR-targeted therapies — response varies by tumor type and mutation status." } }
};

export const REPORT_ICON_PATHS: Record<string, string> = {
  expr: "M3 17V9M9 17V4M15 17v-6M21 17V7",
  var: "M4 4v16M4 8h6a4 4 0 000-8H4M4 16h9a4 4 0 010 8H4"
};

export const INITIAL_REPORTS: Report[] = [
  { id:"r1", title:"Gene expression analysis — patient_0142", sub:"Tumor · 96% confidence · saved Jul 8, 2026", icon:"expr", pinned:true },
  { id:"r2", title:"Mutation lookup — TP53 R175H", sub:"Pathogenic · saved Jul 8, 2026", icon:"var", pinned:true },
  { id:"r3", title:"Mutation lookup — BRCA1 c.5266dupC", sub:"Pathogenic · saved Jul 6, 2026", icon:"var", pinned:false }
];

// Every run the platform has actually executed, whether or not the user hit
// "Save to my reports". This backs the "Upload history" tab of the Workspace
// Archive — a superset of INITIAL_REPORTS, so entries with a savedReportId
// are cross-referenced to an existing saved report rather than duplicated.
export const UPLOAD_HISTORY: UploadHistoryEntry[] = [
  { id:"h1", kind:"expr", label:"Gene expression analysis — patient_0142.csv", meta:"220 samples · tumor prediction, 96% confidence", timestamp:"Jul 8, 2026 · 4:09 PM", status:"completed", savedReportId:"r1" },
  { id:"h2", kind:"var", label:"Mutation lookup — TP53 R175H", meta:"Pathogenic classification", timestamp:"Jul 8, 2026 · 3:52 PM", status:"completed", savedReportId:"r2" },
  { id:"h3", kind:"var", label:"Mutation lookup — BRCA1 c.5266dupC", meta:"Pathogenic classification", timestamp:"Jul 6, 2026 · 10:41 AM", status:"completed", savedReportId:"r3" },
  { id:"h4", kind:"expr", label:"Gene expression analysis — patient_0144_rerun.csv", meta:"220 samples · tumor prediction, 84% confidence", timestamp:"Jul 5, 2026 · 6:20 PM", status:"completed" },
  { id:"h5", kind:"var", label:"Mutation lookup — EGFR L858R", meta:"No strong classification returned", timestamp:"Jul 4, 2026 · 1:15 PM", status:"completed" },
  { id:"h6", kind:"expr", label:"Gene expression analysis — batch_upload_003.csv", meta:"Upload failed — file exceeded the 50MB limit", timestamp:"Jul 2, 2026 · 9:03 AM", status:"failed" }
];

