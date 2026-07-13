import type { MouseEvent } from "react";
import type { Report } from "../lib/mutation-types";
import { REPORT_ICON_PATHS } from "../lib/mutation-data";

interface ReportRowProps {
  r: Report;
  openMenuId: string | null;
  onTogglePin: (id: string) => void;
  onToggleMenu: (e: MouseEvent, id: string) => void;
  onOpenHistory: (id: string) => void;
}

export default function ReportRow({ r, openMenuId, onTogglePin, onToggleMenu, onOpenHistory }: ReportRowProps) {
  return (
    <div className="report-row">
      <div className="report-ic">
        <svg width="20" height="20" stroke="var(--sage)"><path d={REPORT_ICON_PATHS[r.icon]} /></svg>
      </div>
      <div style={{ flex: 1 }}>
        <div className="rtitle">{r.title}</div>
        <div className="rsub">{r.sub}</div>
      </div>
      <button
        className={"star-btn" + (r.pinned ? " starred" : "")}
        onClick={() => onTogglePin(r.id)}
        title={r.pinned ? "Unpin" : "Pin to top"}
      >★</button>
      <div className="report-menu-wrap">
        <button className="btn btn-secondary" onClick={e => onToggleMenu(e, r.id)}>Export &amp; share ▾</button>
        <div className={"report-menu" + (openMenuId === r.id ? " open" : "")}>
          <button>⬇ Export PDF</button>
          <button>⬇ Export CSV</button>
          <button>⬇ Export JSON</button>
          <div className="rm-sep"></div>
          <button>🔗 Share report</button>
          <button onClick={() => onOpenHistory(r.id)}>🕘 Version history</button>
        </div>
      </div>
    </div>
  );
}
