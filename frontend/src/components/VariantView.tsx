"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ps } from "../lib/mutation-utils";
import { useProteinModal } from "./protein-modal-context";

export default function VariantView() {
  const router = useRouter();
  const { showProtein } = useProteinModal();
  const [detailOpen, setDetailOpen] = useState<boolean>(false);

  return (
  <div className="view active">
    <div className="eyebrow">MUTATION LOOKUP</div>
    <h2 style={ps(`font-size:26px;`)}>Search a mutation or gene</h2>
    <p className="lede">Type a mutation name, a gene, or upload a VCF file with several variants at once.</p>

    <div className="search-row" style={ps(`margin-top:24px;`)}>
      <input defaultValue="TP53 R175H" placeholder="e.g. TP53 R175H" />
      <button className="btn btn-primary">Search</button>
    </div>
    <div style={ps(`margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;`)}>
      <span className="example-chip">Try: BRCA1 c.5266dupC</span>
      <span className="example-chip">Or upload a VCF file</span>
    </div>

    <div className="plain-answer">
      <div className="pa-label">IN PLAIN TERMS</div>
      <h3>This mutation is likely harmful.</h3>
      <p>TP53 R175H changes a critical part of the p53 protein that normally stops damaged cells from multiplying. This exact change is rare in the general population and has been linked to several cancers, including breast cancer, in 23 published studies.</p>
      <button className="detail-toggle" onClick={() => setDetailOpen(v => !v)}>
        <span>{detailOpen ? "Hide the clinical details" : "Show the clinical details"}</span> <span>{detailOpen ? "▴" : "▾"}</span>
      </button>
      <div className={"detail-box" + (detailOpen ? " open" : "")}>
        <div className="card protein-card" style={ps(`background:#fff;`)}>
          <div>
            <div className="pc-row"><span className="k">Classification</span><span className="v" style={ps(`color:var(--coral);`)}>Pathogenic</span></div>
            <div className="pc-row" style={ps(`align-items:flex-start;`)}>
              <span className="k">Population frequency</span>
              <span className="freq-block">
                <span className="freq-line"><span className="db">gnomAD</span><span className="val">&lt; 0.001%</span></span>
                <span className="freq-line"><span className="db">1000 Genomes</span><span className="val">Not observed</span></span>
                <span className="freq-line"><span className="db">ExAC</span><span className="val">0.0008%</span></span>
              </span>
            </div>
            <div className="pc-row"><span className="k">Affected region</span><span className="v">DNA-binding domain</span></div>
          </div>
          <div>
            <div className="pc-row"><span className="k">Associated diseases</span><span className="v">Cancer-related disorders</span></div>
            <div className="pc-row"><span className="k">Supporting evidence</span><span className="v">23 publications</span></div>
            <div className="pc-row"><span className="k">Source</span><span className="v">ClinVar, gnomAD</span></div>
          </div>
        </div>

        <div className="card" style={ps(`background:#fff;margin-top:14px;`)}>
          <h4>Why this classification (ACMG/AMP criteria)</h4>
          <p className="hint" style={ps(`color:var(--muted);font-size:12.5px;margin-top:4px;`)}>The standardized rules a clinical geneticist would check, not just a single AI score.</p>
          <div className="acmg-row">
            <div className="acmg-tag"><span className="code">PS1</span><span className="desc">Same amino acid change already reported as pathogenic in the literature</span></div>
            <div className="acmg-tag"><span className="code">PM2</span><span className="desc">Absent or extremely rare in gnomAD's population reference</span></div>
            <div className="acmg-tag"><span className="code">PP3</span><span className="desc">Multiple computational predictors agree this is damaging</span></div>
          </div>
        </div>

        <div className="card protein-card" style={ps(`background:#fff;margin-top:14px;`)}>
          <div>
            <div className="pc-row"><span className="k">dbSNP ID</span><span className="v">rs28934578</span></div>
            <div className="pc-row"><span className="k">HGVS notation</span><span className="v">NM_000546.6:c.524G&gt;A (p.Arg175His)</span></div>
          </div>
          <div>
            <div className="pc-row"><span className="k">Genome coordinates</span><span className="v">chr17:7,675,088 (GRCh38)</span></div>
            <div className="pc-row"><span className="k">Reference transcript</span><span className="v">NM_000546.6 (TP53-201)</span></div>
          </div>
        </div>
      </div>
    </div>

    <div className="actions-row">
      <button className="btn btn-secondary" onClick={() => router.push("/")}>Back to home</button>
      <button className="btn btn-secondary" onClick={() => showProtein("TP53", "variant")}>See protein impact →</button>
      <button className="btn btn-primary" onClick={() => router.push("/reports")}>Save to my reports →</button>
    </div>
  </div>

  );
}
