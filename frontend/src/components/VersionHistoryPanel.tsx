import type { Report } from "../lib/mutation-types";

interface VersionEntry {
  label: string;
  date: string;
  current?: boolean;
}

// Static demo history — in a real backend this would be fetched per report id.
const MOCK_VERSIONS: VersionEntry[] = [
  { label: "Version 3", date: "Jul 8, 2026 · 4:12 PM", current: true },
  { label: "Version 2", date: "Jul 6, 2026 · 11:03 AM" },
  { label: "Version 1 (original)", date: "Jul 3, 2026 · 9:47 AM" },
];

interface VersionHistoryPanelProps {
  report: Report | null;
  onClose: () => void;
}

export default function VersionHistoryPanel({ report, onClose }: VersionHistoryPanelProps) {
  return (
    <div
      className={"version-history-overlay" + (report ? " open" : "")}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {report && (
        <div className="version-history-box">
          <div className="eyebrow">VERSION HISTORY</div>
          <h3 className="section-title" style={{ marginTop: 4 }}>{report.title}</h3>
          <p className="section-sub">Every saved version of this report. Restoring an older version keeps the current one in history too.</p>

          <div className="version-history-list">
            {MOCK_VERSIONS.map(v => (
              <div className="version-history-row" key={v.label}>
                <div className="vh-meta">
                  <div>{v.label}</div>
                  <div className="vh-date">{v.date}</div>
                </div>
                {v.current ? (
                  <span className="vh-current">Current</span>
                ) : (
                  <button className="btn btn-secondary">Restore</button>
                )}
              </div>
            ))}
          </div>

          <div className="actions-row" style={{ marginTop: 20 }}>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
