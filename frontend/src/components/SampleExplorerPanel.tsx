"use client";

import { useState } from "react";
import { SAMPLE_ORDER, SAMPLES, BOXPLOTS } from "../lib/mutation-data";
import { useProteinModal } from "./protein-modal-context";

export default function SampleExplorerPanel() {
  const { showProtein } = useProteinModal();

  const [activeSample, setActiveSample] = useState<string>("patient_0142");
  const [samplesSearch, setSamplesSearch] = useState<string>("");
  const [selectedGenes, setSelectedGenes] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState<boolean>(false);

  function selectSample(id: string) {
    setActiveSample(id);
    setSelectedGenes(new Set());
    setShowCompare(false);
  }

  function toggleGeneCompare(gene: string) {
    setSelectedGenes(prev => {
      const next = new Set(prev);
      if (next.has(gene)) next.delete(gene);
      else { if (next.size >= 4) return prev; next.add(gene); }
      return next;
    });
  }

  const sample = SAMPLES[activeSample];
  const filteredSampleIds = SAMPLE_ORDER.filter(id => {
    const q = samplesSearch.toLowerCase().trim();
    if (!q) return true;
    const s = SAMPLES[id];
    return id.toLowerCase().includes(q) || s.patient.toLowerCase().includes(q);
  });

  return (
          <div className="subview active">
            <div className="split-dashboard">
              <div className="samples-panel">
                <div className="sp-title">Samples in this file</div>
                <input
                  className="samples-search"
                  placeholder="Search sample or patient ID…"
                  value={samplesSearch}
                  onChange={e => setSamplesSearch(e.target.value)}
                />
                <div>
                  {filteredSampleIds.map(id => {
                    const s = SAMPLES[id];
                    const predClass = s.pred === "tumor" ? "tumor" : "normal";
                    const predLabel = s.pred === "tumor" ? "Tumor" : "Normal";
                    return (
                      <div
                        key={id}
                        className={"sample-row" + (id === activeSample ? " active" : "")}
                        onClick={() => selectSample(id)}
                      >
                        <span className="sid">{id}</span>
                        <span className={"spred " + predClass}>{predLabel}</span>
                        <span className="sconf">{s.conf}%</span>
                      </div>
                    );
                  })}
                </div>
                <div className="samples-count">Showing {filteredSampleIds.length} of 220 · rest omitted from this preview</div>
              </div>

              <div>
                <div className="result-hero">
                  <div>
                    <div className="rh-label">ACTIVE SAMPLE — {activeSample.toUpperCase()} · {sample.patient.toUpperCase()}</div>
                    <div className="rh-val">{sample.label}</div>
                  </div>
                  <div className="rh-conf">
                    <div className="confring" style={{ background: `conic-gradient(var(--sage) 0% ${sample.conf}%, rgba(255,255,255,.15) ${sample.conf}% 100%)` }}>
                      <span>{sample.conf}%</span>
                    </div>
                    <div className="help" style={{ color: "#B9C4BE" }}>confident</div>
                  </div>
                </div>

                <h3 className="section-title">Possible conditions, ranked</h3>
                <p className="section-sub">Not a single yes/no — here's every condition the model considered for this sample.</p>
                <div className="diff-list">
                  {sample.diffs.map((d, i) => (
                    <div className={"diff-row" + (d.top ? " top" : "")} key={d.name}>
                      <span className="drank">{i + 1}</span>
                      <span className="dname">{d.name}</span>
                      <div className="dbar"><div className="dbar-fill" style={{ width: d.pct + "%" }}></div></div>
                      <span className="dval">{d.pct}%</span>
                      <span className="dmeta">{d.genes} · {d.src}</span>
                    </div>
                  ))}
                </div>

                <h3 className="section-title">The genes that mattered most</h3>
                <p className="section-sub">Bars show each gene's relative contribution to this prediction (SHAP value, not raw expression level). Check up to 4 to compare their actual expression, or click a name to open its protein record.</p>
                <div className="gene-list">
                  {sample.genes.map(g => (
                    <div className="gene-row" key={g.g}>
                      <span
                        className={"gcheck" + (selectedGenes.has(g.g) ? " checked" : "")}
                        onClick={e => { e.stopPropagation(); toggleGeneCompare(g.g); }}
                      ></span>
                      <span className="gname" onClick={() => showProtein(g.g, "rnaseq")} style={{ cursor: "pointer" }}>{g.g}</span>
                      <div className="gbar" onClick={() => showProtein(g.g, "rnaseq")} style={{ cursor: "pointer" }}>
                        <div className="gbar-fill" style={{ width: g.w + "%" }}></div>
                      </div>
                      <span className="gnote">{g.note}</span>
                      <span className="go" onClick={() => showProtein(g.g, "rnaseq")} style={{ cursor: "pointer" }}>See what this gene does →</span>
                    </div>
                  ))}
                </div>

                <div className={"compare-bar" + (selectedGenes.size > 0 ? " show" : "")}>
                  <span>{selectedGenes.size} {selectedGenes.size === 1 ? "gene selected" : "genes selected"}{selectedGenes.size >= 4 ? " (max 4)" : ""}</span>
                  <button className="btn" style={{ background: "#fff", color: "var(--ink)" }} onClick={() => setShowCompare(true)}>Compare selected →</button>
                </div>

                {showCompare && selectedGenes.size > 0 && (
                  <div className="compare-panel">
                    <h3 className="section-title">Comparing {selectedGenes.size} genes across the cohort</h3>
                    <p className="section-sub">Each track shows the normal-tissue range in green and the tumor-tissue range in coral, with a marker for this sample's actual value. Expression is log₂(TPM + 1), DESeq2-normalized — not raw read counts.</p>
                    <div className="card">
                      {Array.from(selectedGenes).map(gene => {
                        const b = BOXPLOTS[gene] || BOXPLOTS.TP53;
                        return (
                          <div className="boxplot-row" key={gene}>
                            <span className="bp-name">{gene}</span>
                            <div className="boxplot-track">
                              <div className="bp-group normal" style={{ left: b.normalLo + "%", width: (b.normalHi - b.normalLo) + "%" }}></div>
                              <div className="bp-group tumor" style={{ left: b.tumorLo + "%", width: (b.tumorHi - b.tumorLo) + "%" }}></div>
                              <div className="bp-marker" style={{ left: b.sample + "%" }}></div>
                            </div>
                            <span className="bp-legend">normal range vs. tumor range</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
  );
}
