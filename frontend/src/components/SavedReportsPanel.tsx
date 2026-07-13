"use client";

import { useState, type MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import type { Report } from "../lib/mutation-types";
import ReportRow from "./ReportRow";
import VersionHistoryPanel from "./VersionHistoryPanel";

interface SavedReportsPanelProps {
  reports: Report[];
  onTogglePin: (id: string) => void;
}

export default function SavedReportsPanel({ reports, onTogglePin }: SavedReportsPanelProps) {
  const [reportsSearch, setReportsSearch] = useState<string>("");
  const [openReportMenu, setOpenReportMenu] = useState<string | null>(null);
  const searchParams = useSearchParams();

  function toggleReportMenu(e: MouseEvent, id: string) {
    e.stopPropagation();
    setOpenReportMenu(prev => (prev === id ? null : id));
  }

  function openHistory(id: string) {
    setOpenReportMenu(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set("history", id);
    window.history.pushState(null, "", `?${params.toString()}`);
  }

  function closeHistory() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("history");
    const qs = params.toString();
    window.history.pushState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  const historyReportId = searchParams.get("history");
  const historyReport = reports.find(r => r.id === historyReportId) ?? null;

  const q = reportsSearch.toLowerCase().trim();
  const reportMatches = (r: Report) => !q || r.title.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q);
  const pinnedReports = reports.filter(r => r.pinned && reportMatches(r));
  const restReports = reports.filter(r => !r.pinned && reportMatches(r));

  return (
    <div>
      <div className="reports-toolbar">
        <input
          className="reports-search"
          placeholder="Search reports, genes, or mutations…"
          value={reportsSearch}
          onChange={e => setReportsSearch(e.target.value)}
        />
      </div>

      {pinnedReports.length > 0 && (
        <div>
          <div className="reports-group-title">★ Pinned</div>
          {pinnedReports.map(r => (
            <ReportRow
              key={r.id}
              r={r}
              openMenuId={openReportMenu}
              onTogglePin={onTogglePin}
              onToggleMenu={toggleReportMenu}
              onOpenHistory={openHistory}
            />
          ))}
        </div>
      )}

      <div>
        <div className="reports-group-title">All reports</div>
        {restReports.length > 0 ? restReports.map(r => (
          <ReportRow
            key={r.id}
            r={r}
            openMenuId={openReportMenu}
            onTogglePin={onTogglePin}
            onToggleMenu={toggleReportMenu}
            onOpenHistory={openHistory}
          />
        )) : (
          <div className="reports-empty">{reportsSearch ? "No reports match your search." : "Nothing else saved yet."}</div>
        )}
      </div>

      <VersionHistoryPanel report={historyReport} onClose={closeHistory} />
    </div>
  );
}
