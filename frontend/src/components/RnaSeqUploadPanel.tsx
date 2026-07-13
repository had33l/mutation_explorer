import { ps } from "@/lib/mutation-utils";
export default function RnaSeqUploadPanel() {
    return (
        <>
        <div className="eyebrow"> GENE EXPRESSION ANALYSIS</div>
        <h2 style={ps(`font-size:26px;`)}> Upload your dataset to get started</h2>
        <p className="lede"> Genes as rows, samples as columns, We accept .csv and .tsv files up to 50MB.</p>

        <div className="steps" style={ps(`margin-top:32px;`)}>
            <div className="step-chip done"> <span></span></div>
            <div className="step-chip done"><span className="c">✓</span>Upload</div>
            <div className="step-sep"></div>
            <div className="step-chip current"><span className="c">2</span>Review results</div>
        </div>

        <div className="card" style={ps(`max-width:720px;margin-bottom:16px;`)}>
            <div className="mf-label" style={ps(`margin-bottom:12px;`)}>Recent uploads</div>
            <div className="recent-row">
                <div style={ps(`flex:1;`)}>
                    <div className="rname">expression_matrix.csv <span className="cached-badge">Cached</span></div>
                    <div className="rmeta">220 samples · uploaded Jul 8, 2026 · hash a1f9…c2</div>
                </div>
                <button className="btn btn-secondary">Load cached results →</button>
            </div>
        </div>
        
        <div className="mf-note" style={ps(`margin-top:12px;`)}>Loading a cached file skips re-running the model — instant results, same version used originally.</div>
        <div className="card" style={ps(`max-width:720px;`)}>
        <div className="upload-zone">
            <div className="ic"><svg width="26" height="26" stroke="var(--sage)"><path d="M12 16V4M6 10l6-6 6 6M4 20h16"/></svg></div>
            <h3>Drop your file here</h3>
            <p>or click to browse your computer</p>
            <div className="file-chip">expression_matrix.csv &nbsp;·&nbsp; 4.2 MB <span className="x">✓</span></div>
        </div>
        <div className="meta-form">
            <div className="mf-label">Sample context (optional, but improves accuracy)</div>
            <div className="mf-grid">
                <div className="mf-field">
                    <label>Tissue source</label>
                    <select><option>Breast</option><option>Lung</option><option>Colon</option><option>Not sure / mixed</option></select>
                </div>
                <div className="mf-field">
                    <label>Sequencing platform</label>
                    <select><option>Illumina</option><option>Ion Torrent</option><option>PacBio</option><option>Not sure</option></select>
                </div>
                <div className="mf-field">
                    <label>Library preparation</label>
                    <select><option>PolyA selection</option><option>Ribo-depletion</option><option>Not sure</option></select>
                </div>
            </div>
            <div className="mf-note">Leave any field on its default if you're not sure — the analysis still runs, it just won't adjust for that context.</div>
        </div><div className="actions-row" style={ps(`justify-content:space-between;align-items:center;`)}>
        <span className="help">18,412 genes · 220 samples detected</span>
        <button className="btn btn-primary btn-lg">Run analysis →</button>
      </div>
    </div>
        
        </>
    )
}