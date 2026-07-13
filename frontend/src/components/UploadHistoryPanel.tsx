import type { UploadHistoryEntry } from "@/lib/mutation-types";
import { REPORT_ICON_PATHS } from "../lib/mutation-data";

interface UploadHistoryPanelProps {
  entries: UploadHistoryEntry[];
  isSaved: (entry: UploadHistoryEntry) => boolean;
  onSave: (entry: UploadHistoryEntry) => void;
}

export default function UploadHistoryPanel({ entries, isSaved, onSave }: UploadHistoryPanelProps) {
  return (
    <div>
      <p className="section-sub" style={{ marginBottom: 16 }}>
        Every analysis the platform has actually run, whether or not you saved it — including reruns and failed uploads.
      </p>

      {entries.map(entry => {
        const saved = isSaved(entry);
        const failed = entry.status === "failed";
        return (
          <div className={"history-row" + (failed ? " failed" : "")} key={entry.id}>
            <div className="history-ic">
              <svg width="18" height="18" stroke={failed ? "var(--coral)" : "var(--sage)"}>
                <path d={REPORT_ICON_PATHS[entry.kind]} />
              </svg>
            </div>
            <div className="history-body">
              <div className="history-label">{entry.label}</div>
              <div className="history-meta">{entry.meta}</div>
              <div className="history-date">{entry.timestamp}</div>
            </div>
            {failed ? (
              <span className="tag tag-coral">Failed</span>
            ) : saved ? (
              <span className="tag tag-sage">✓ Saved</span>
            ) : (
              <button className="btn btn-secondary" onClick={() => onSave(entry)}>Save to my reports</button>
            )}
          </div>
        );
      })}
    </div>
  );
}
