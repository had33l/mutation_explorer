export interface DiffRow {
  name: string;
  pct: number;
  top?: boolean;
  genes: string;
  src: string;
}

export interface GeneRow {
  g: string;
  w: number;
  note: string;
}

export interface Sample {
  patient: string;
  pred: "tumor" | "normal";
  label: string;
  conf: number;
  diffs: DiffRow[];
  genes: GeneRow[];
}

export interface BoxplotRange {
  normalLo: number;
  normalHi: number;
  tumorLo: number;
  tumorHi: number;
  sample: number;
}

export interface EnrichItem {
  name: string;
  w: number;
  note: string;
}

export type EnrichKey = "go" | "kegg" | "reactome" | "hallmark";

export interface ProteinLink {
  label: string;
  url: string;
}

export interface ProteinTherapy {
  name: string;
  note: string;
}

export interface ProteinInfo {
  name: string;
  func: string;
  loc: string;
  domain: string;
  disease: string;
  explain: string;
  reasoning: string;
  tags: string[];
  links: ProteinLink[];
  therapy: ProteinTherapy | null;
}

export type ReportIcon = "expr" | "var";

export interface Report {
  id: string;
  title: string;
  sub: string;
  icon: ReportIcon;
  pinned: boolean;
}

export interface ProteinModalState {
  open: boolean;
  gene: string;
  source: "rnaseq" | "variant";
}

export type HistoryStatus = "completed" | "failed";

export interface UploadHistoryEntry {
  id: string;
  kind: ReportIcon;
  label: string;
  meta: string;
  timestamp: string;
  status: HistoryStatus;
  /** Set once the user has explicitly saved this run to "My reports". */
  savedReportId?: string;
}
