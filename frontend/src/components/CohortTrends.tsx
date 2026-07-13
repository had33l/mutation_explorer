"use client";

import { useState } from "react";
import { ps } from "@/lib/mutation-utils";
import { ENRICH, ENRICH_TABS } from "@/lib/mutation-data";
import type { EnrichKey } from "@/lib/mutation-types";
import { useProteinModal } from "./protein-modal-context";

export default function CohortTrends() {
    const { showProtein } = useProteinModal();
    const [enrichTab, setEnrichTab] = useState<EnrichKey>("go");

    return(
        <div className="subview active">
            <div className="card">
                <h4>Volcano plot - every gene in this dataset</h4>
                <p className="hint" style={ps(`color:var(--muted);font-size:12.5px;margin-top:4px`)}>
                    Each dot is one gene. Further right or left means a bigger difference between 
                    tumor and normal; highrt up means stronger and statistical confidence. Click a hilighted gene to opent its protein record.
                </p>
                <svg viewBox="0 0 460 275" style={ps(`width:100%;height:auto;margin-top:14px;`)}
                stroke="none">
                    <line x1="230" y1="10" x2="230" y2="230" stroke="var(--line)" strokeWidth="1"/>
                    <line x1="20" y1="230" x2="440" y2="230" stroke="var(--line)" strokeWidth="1"/>
            
                    <text x="10" y="120" fontSize="10" fill="var(--muted)" fontFamily="Inter" transform="rotate(-90 10 120)" textAnchor="middle">−log₁₀(p-value)</text>
                    <text x="230" y="18" fontSize="9" fill="var(--muted)" fontFamily="Inter" textAnchor="middle">8</text>
                    <text x="230" y="115" fontSize="9" fill="var(--muted)" fontFamily="Inter" textAnchor="middle">4</text>
            
                    <text x="230" y="262" fontSize="10" fill="var(--muted)" fontFamily="Inter" textAnchor="middle">log₂(fold change)</text>
                    <text x="60" y="243" fontSize="9" fill="var(--muted)" fontFamily="Inter" textAnchor="middle">−4</text>
                    <text x="230" y="243" fontSize="9" fill="var(--muted)" fontFamily="Inter" textAnchor="middle">0</text>
                    <text x="400" y="243" fontSize="9" fill="var(--muted)" fontFamily="Inter" textAnchor="middle">+4</text>
                    <text x="20" y="245" fontSize="10" fill="var(--muted)" fontFamily="Inter">down in tumor</text>
                    <text x="360" y="245" fontSize="10" fill="var(--muted)" fontFamily="Inter">up in tumor</text>
                    <g fill="var(--muted)" opacity="0.35">
                        <circle cx="210" cy="200" r="3.5"/><circle cx="250" cy="210" r="3.5"/><circle cx="190" cy="190" r="3.5"/><circle cx="270" cy="195" r="3.5"/>
                        <circle cx="230" cy="180" r="3.5"/><circle cx="180" cy="205" r="3.5"/><circle cx="260" cy="215" r="3.5"/><circle cx="200" cy="175" r="3.5"/>
                        <circle cx="240" cy="160" r="3.5"/><circle cx="220" cy="150" r="3.5"/><circle cx="300" cy="200" r="3.5"/><circle cx="160" cy="200" r="3.5"/>
                        <circle cx="140" cy="185" r="3.5"/><circle cx="320" cy="180" r="3.5"/><circle cx="150" cy="160" r="3.5"/><circle cx="310" cy="150" r="3.5"/>
                    </g>
                    <circle cx="360" cy="40" r="6" fill="var(--coral)" style={ps(`cursor:pointer;`)} onClick={() => showProtein('TP53','rnaseq')}/>
                    <text x="360" y="28" fontSize="11" fontWeight="700" fill="var(--coral)" textAnchor="middle" fontFamily="Inter">TP53</text>
                    <circle cx="330" cy="70" r="6" fill="var(--coral)" style={ps(`cursor:pointer;`)} onClick={() => showProtein('MYC','rnaseq')}/>
                    <text x="330" y="58" fontSize="11" fontWeight="700" fill="var(--coral)" textAnchor="middle" fontFamily="Inter">MYC</text>
                    <circle cx="380" cy="95" r="6" fill="var(--coral)" style={ps(`cursor:pointer;`)} onClick={() => showProtein('BRCA1','rnaseq')}/>
                    <text x="380" y="112" fontSize="11" fontWeight="700" fill="var(--coral)" textAnchor="middle" fontFamily="Inter">BRCA1</text>
                    <circle cx="90" cy="50" r="6" fill="var(--blue,#2E5D8A)" style={ps(`cursor:pointer;`)} onClick={() => showProtein('GATA3','rnaseq')}/>
                    <text x="90" y="38" fontSize="11" fontWeight="700" fill="var(--blue,#2E5D8A)" textAnchor="middle" fontFamily="Inter">GATA3</text>
                </svg>
                <div className="qc-legend">
                    <span><i style={ps(`background:var(--coral);`)}></i>Significantly up in tumor</span>
                    <span><i style={ps(`background:var(--blue,#2E5D8A);`)}></i>Significantly down in tumor</span>
                    <span><i style={ps(`background:var(--muted);`)}></i>Not significant</span>
                </div>
            </div>

        <div className="card" style={ps(`margin-top:14px;`)}>
          <h4>Top 8 genes, tumor vs. normal samples</h4>
          <p className="hint" style={ps(`color:var(--muted);font-size:12.5px;margin-top:4px;`)}>Darker red = higher expression, darker blue = lower expression, relative to the gene's own average. Values are log₂(TPM + 1), normalized across samples with DESeq2 size factors.</p>
          <div className="heatmap-wrap" style={ps(`margin-top:14px;`)}>
            <div className="heatmap">
              <div className="hm-corner"></div>
              <div className="hm-colhead" style={ps(`grid-column:span 5;`)}>TUMOR SAMPLES</div>
              <div className="hm-colhead" style={ps(`grid-column:span 5;`)}>NORMAL SAMPLES</div>
              <div className="hm-rowhead">TP53</div>
              <div className="hm-cell" style={ps(`background:rgba(193,84,63,.85)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.7)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.9)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.6)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.75)`)}></div>
              <div className="hm-cell" style={ps(`background:rgba(46,93,138,.5)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.3)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.4)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.2)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.35)`)}></div>
              <div className="hm-rowhead">MYC</div>
              <div className="hm-cell" style={ps(`background:rgba(193,84,63,.7)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.6)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.5)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.8)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.65)`)}></div>
              <div className="hm-cell" style={ps(`background:rgba(46,93,138,.3)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.4)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.25)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.3)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.2)`)}></div>
              <div className="hm-rowhead">BRCA1</div>
              <div className="hm-cell" style={ps(`background:rgba(193,84,63,.5)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.6)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.45)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.55)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.4)`)}></div>
              <div className="hm-cell" style={ps(`background:rgba(46,93,138,.35)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.3)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.4)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.25)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.3)`)}></div>
              <div className="hm-rowhead">ESR1</div>
              <div className="hm-cell" style={ps(`background:rgba(46,93,138,.4)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.3)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.45)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.35)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.5)`)}></div>
              <div className="hm-cell" style={ps(`background:rgba(193,84,63,.6)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.7)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.55)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.65)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.75)`)}></div>
              <div className="hm-rowhead">GATA3</div>
              <div className="hm-cell" style={ps(`background:rgba(46,93,138,.45)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.5)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.4)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.55)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.35)`)}></div>
              <div className="hm-cell" style={ps(`background:rgba(193,84,63,.65)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.5)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.7)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.6)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.55)`)}></div>
              <div className="hm-rowhead">FOXA1</div>
              <div className="hm-cell" style={ps(`background:rgba(46,93,138,.3)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.35)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.25)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.4)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.3)`)}></div>
              <div className="hm-cell" style={ps(`background:rgba(193,84,63,.5)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.55)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.45)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.6)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.5)`)}></div>
              <div className="hm-rowhead">MKI67</div>
              <div className="hm-cell" style={ps(`background:rgba(193,84,63,.75)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.8)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.65)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.7)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.85)`)}></div>
              <div className="hm-cell" style={ps(`background:rgba(46,93,138,.2)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.25)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.3)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.2)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.25)`)}></div>
              <div className="hm-rowhead">CCND1</div>
              <div className="hm-cell" style={ps(`background:rgba(193,84,63,.6)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.65)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.55)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.5)`)}></div><div className="hm-cell" style={ps(`background:rgba(193,84,63,.7)`)}></div>
              <div className="hm-cell" style={ps(`background:rgba(46,93,138,.3)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.35)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.3)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.4)`)}></div><div className="hm-cell" style={ps(`background:rgba(46,93,138,.3)`)}></div>
            </div>
          </div>
          <div className="heatmap-legend"><span>Low</span><div className="hm-scale"></div><span>High</span></div>
        </div>

            <div className="card" style={{ marginTop: 14 }}>
              <h4>Pathway &amp; gene set enrichment</h4>
              <p className="hint" style={{ color: "var(--muted)", fontSize: "12.5px", marginTop: 4 }}>What biological processes and pathways the differentially expressed genes fall into, across four standard reference databases.</p>
              <div className="enrich-tabs">
                {ENRICH_TABS.map(t => (
                  <button
                    key={t.key}
                    className={"enrich-tab" + (enrichTab === t.key ? " active" : "")}
                    onClick={() => setEnrichTab(t.key)}
                  >{t.label}</button>
                ))}
              </div>
              <div className="enrich-list">
                {ENRICH[enrichTab].map(item => (
                  <div className="enrich-row" key={item.name}>
                    <span className="ename">{item.name}</span>
                    <div className="ebar"><div className="ebar-fill" style={{ width: item.w + "%" }}></div></div>
                    <span className="enote">{item.note}</span>
                  </div>
                ))}
              </div>
            </div>
        </div>
    )
}