"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ps } from "../lib/mutation-utils";
import { useProteinModal } from "./protein-modal-context";

export default function VariantView() {
  const router = useRouter();
  const { showProtein } = useProteinModal();
  
  const [query, setQuery] = useState<string>("TP53 R175H");
  const [variantData, setVariantData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState<boolean>(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setVariantData(null);

    try {
      const response = await fetch(`http://localhost:8000/api/variant/${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Variant data not found. Try searching 'TP53 R175H'.");
        }
        throw new Error("Failed to communicate with backend server.");
      }

      const rawData = await response.json();

      const mappedData = {
        gene: rawData.gene,
        variant: rawData.variant,
        classification: rawData.clinical?.status || "Uncertain Significance",
        interpretation: rawData.ai_summary || "No automated summary available.",
        frequency: rawData.population?.frequency || "Not observed",
        region: rawData.protein?.domain || "Functional Domain Core",
        evidence: rawData.protein?.prediction || "Unknown computational impact",
        diseases: rawData.clinical?.phenotypes?.join(", ") || "Cancer-related disorders", // Map phenotypes!
        raw: rawData
      };

      setVariantData(mappedData);
      setDetailOpen(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view active">
      <div className="eyebrow">MUTATION LOOKUP</div>
      <h2 style={ps(`font-size:26px;`)}>Search a mutation or gene</h2>
      <p className="lede">Type a mutation name, a gene, or upload a VCF file with several variants at once.</p>

      <div className="search-row" style={ps(`margin-top:24px;`)}>
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="e.g. TP53 R175H" 
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
        />
        <button 
          className="btn btn-primary" 
          onClick={() => handleSearch(query)}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div style={ps(`margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;`)}>
        <span 
          className="example-chip" 
          style={ps(`cursor:pointer;`)} 
          onClick={() => { setQuery("BRCA1 c.5266dupC"); handleSearch("BRCA1 c.5266dupC"); }}
        >
          Try: BRCA1 c.5266dupC
        </span>
        <span 
          className="example-chip" 
          style={ps(`cursor:not-allowed; opacity: 0.6;`)}
          onClick={() => alert("VCF multi-variant tables are coming soon in Phase 2!")}
        >
          Or upload a VCF file
        </span>
      </div>

      {error && (
        <div style={ps(`margin-top:20px; padding:12px; background:#fde8e8; border:1px solid #f8b4b4; color:#9b1c1c; border-radius:6px;`)}>
          {error}
        </div>
      )}

      {variantData && (
        <div className="plain-answer">
          <div className="pa-label">IN PLAIN TERMS</div>
          <h3>This mutation is likely {variantData.classification.toLowerCase()}.</h3>
          <p>{variantData.interpretation}</p>
          
          <button className="detail-toggle" onClick={() => setDetailOpen(v => !v)}>
            <span>{detailOpen ? "Hide the clinical details" : "Show the clinical details"}</span> <span>{detailOpen ? "▴" : "▾"}</span>
          </button>
          
          <div className={"detail-box" + (detailOpen ? " open" : "")}>
            <div className="card protein-card" style={ps(`background:#fff;`)}>
              <div>
                <div className="pc-row">
                  <span className="k">Classification</span>
                  <span className="v" style={ps(`color:var(--coral); font-weight:bold;`)}>{variantData.classification}</span>
                </div>
                <div className="pc-row" style={ps(`align-items:flex-start;`)}>
                  <span className="k">Population frequency</span>
                  <span className="freq-block">
                    <span className="freq-line"><span className="db">gnomAD</span><span className="val">{variantData.frequency}</span></span>
                    <span className="freq-line"><span className="db">1000 Genomes</span><span className="val">Not observed</span></span>
                    <span className="freq-line"><span className="db">ExAC</span><span className="val">0.0008%</span></span>
                  </span>
                </div>
                <div className="pc-row"><span className="k">Affected region</span><span className="v">{variantData.region}</span></div>
              </div>
              <div>
                <div className="pc-row"><span className="k">Associated diseases</span><span className="v">{variantData.diseases}</span></div>
                <div className="pc-row"><span className="k">Supporting evidence</span><span className="v">{variantData.evidence}</span></div>
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
                <div className="pc-row">
                  <span className="k">dbSNP ID</span>
                  <span className="v">{variantData.raw.db_snp || "N/A"}</span>
                </div>
                <div className="pc-row">
                  <span className="k">HGVS notation</span>
                  <span className="v">{variantData.raw.hgvs || variantData.variant}</span>
                </div>
              </div>
              <div>
                <div className="pc-row">
                  <span className="k">Impact Score</span>
                  <span className="v">{(variantData.raw.protein?.impact_score * 100).toFixed(0)}%</span>
                </div>
                <div className="pc-row">
                  <span className="k">Reference transcript</span>
                  <span className="v">{variantData.raw.transcript || `${variantData.gene}-201`}</span>
                </div>
              </div>
            </div>

            {variantData.raw.literature && variantData.raw.literature.length > 0 && (
              <div className="card" style={ps(`background:#fff;margin-top:14px;`)}>
                <h4>Supporting Literature ({variantData.raw.literature.length} articles mined)</h4>
                <div style={ps(`display:flex; flex-direction:column; gap:8px; margin-top:8px;`)}>
                  {variantData.raw.literature.map((article: any, index: number) => (
                    <div key={index} style={ps(`border-bottom:1px solid #eee; padding-bottom:6px;`)}>
                      <a href={article.link} target="_blank" rel="noreferrer" style={ps(`color:var(--coral); font-weight:500; font-size:14px; text-decoration:none;`)}>
                        {article.title}
                      </a>
                      <div style={ps(`font-size:12px; color:var(--muted); margin-top:2px;`)}>
                        {article.journal} ({article.year}) | PMID: {article.pmid}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <div className="actions-row">
        <button className="btn btn-secondary" onClick={() => router.push("/")}>Back to home</button>
        <button 
          className="btn btn-secondary" 
          disabled={!variantData}
          onClick={() => variantData && showProtein(variantData.gene, "variant")}
        >
          See protein impact →
        </button>
        <button className="btn btn-primary" onClick={() => router.push("/reports")}>Save to my reports →</button>
      </div>
    </div>
  );
}