import { ps } from "@/lib/mutation-utils";
import { CSSProperties } from 'react'; 

export default function BatchQualityCheck() {
  return (
      <div className="subview active">
        <div className="qc-grid">
          <div className="card">
            <h4>Where each sample lands (PCA)</h4>
            <p className="hint" {...{ style: ps(`color:var(--muted);font-size:12.5px;margin-top:4px;`) }}>  Every one.
            </p>
            <svg viewBox="0 0 400 240" style={ps(`width:100%;height:auto;margin-top:12px;`)} stroke="none">
              <rect x="0" y="0" width="400" height="240" fill="none"/>
              <g fill="var(--coral)" opacity="0.55">
                <circle cx="260" cy="70" r="5"/>
                <circle cx="280" cy="90" r="5"/>
                <circle cx="250" cy="100" r="5"/>
                <circle cx="300" cy="80" r="5"/>
                <circle cx="270" cy="110" r="5"/>
                <circle cx="310" cy="60" r="5"/>
                <circle cx="240" cy="80" r="5"/>
                <circle cx="290" cy="130" r="5"/>
                <circle cx="320" cy="100" r="5"/>
                <circle cx="255" cy="130" r="5"/>
                <circle cx="275" cy="55" r="5"/>
                <circle cx="305" cy="115" r="5"/>
                <circle cx="330" cy="80" r="5"/>
                <circle cx="245" cy="115" r="5"/>
                <circle cx="285" cy="145" r="5"/>
              </g>
              <g fill="var(--sage)" opacity="0.55">
                <circle cx="90" cy="170" r="5"/>
                <circle cx="110" cy="150" r="5"/>
                <circle cx="70" cy="160" r="5"/>
                <circle cx="100" cy="190" r="5"/>
                <circle cx="130" cy="170" r="5"/>
                <circle cx="80" cy="190" r="5"/>
                <circle cx="120" cy="130" r="5"/>
              </g>
              <circle cx="200" cy="35" r="6" fill="var(--amber)"/>
              <text x="200" y="20" fontSize="10" fill="var(--amber)" textAnchor="middle" fontFamily="Inter">possible outlier</text>
            </svg>
            <div className="qc-legend">
              <span><i {...{ style: { background: 'var(--coral)' } }}></i>Predicted tumor</span>
              <span><i {...{ style: { background: 'var(--sage)' } }}></i>Predicted normal</span>
              <span><i {...{ style: { background: 'var(--amber)' } }}></i>Flagged outlier</span>
            </div>
            <div className="qc-flag">⚠️ <span><b>Sample_0177</b> sits apart from both clusters — worth checking for a labeling error or a batch effect before trusting its prediction.</span></div>
          </div>

          <div className="card">
            <h4>Sequencing depth across the batch</h4>
            <p className="hint" style={ps(`color:var(--muted);font-size:12.5px;margin-top:4px;`)}>Confirms the file was normalized consistently — a lumpy or multi-peaked curve usually means a formatting issue.</p>
            <svg viewBox="0 0 300 140" style={ps(`width:100%;height:auto;margin-top:16px;`)}>
              <path d="M0,120 C40,118 60,40 100,30 C140,22 160,110 200,116 C230,120 260,124 300,124" stroke="var(--sage)" strokeWidth="2" fill="none"/>
              <line x1="0" y1="130" x2="300" y2="130" stroke="var(--line)" strokeWidth="1"/>
            </svg>
            <div className="qc-legend"><span>Low read count</span><span style={ps(`margin-left:auto;`)}>Typical range</span></div>
          </div>
        </div>

        <h4 style={ps(`margin-top:24px;`)}>Additional quality metrics</h4>
        <p className="hint" style={ps(`color:var(--muted);font-size:12.5px;margin-top:4px;`)}>Standard sequencing QC checks run across the batch before any prediction is trusted.</p>
        <div className="metric-grid">
          <div className="metric-card">
            <div className="metric-label">Mapping rate</div>
            <div className="metric-value">94.2%</div>
            <div className="metric-note">Reads aligned to GRCh38</div>
            <div className="metric-status ok">● Good</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Read duplication</div>
            <div className="metric-value">12.8%</div>
            <div className="metric-note">PCR / optical duplicates</div>
            <div className="metric-status ok">● Acceptable</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">GC bias</div>
            <div className="metric-value">Low</div>
            <div className="metric-note">Coverage vs. %GC deviation</div>
            <div className="metric-status ok">● Within range</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Library complexity</div>
            <div className="metric-value">0.86</div>
            <div className="metric-note">Unique / total read fraction</div>
            <div className="metric-status ok">● High complexity</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Batch effect detection</div>
            <div className="metric-value">2 batches</div>
            <div className="metric-note">Moderate separation on PC2</div>
            <div className="metric-status warn">● Review recommended</div>
          </div>
        </div>
      </div>
  );
}
