// "use client";

// import { useState, type MouseEvent } from "react";
// import { useSearchParams } from "next/navigation";
// import { INITIAL_REPORTS } from "../lib/mutation-data";
// import type { Report } from "../lib/mutation-types";
// import ReportRow from "./ReportRow";
// import VersionHistoryPanel from "./VersionHistoryPanel";

// export default function ReportsView() {
//   const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
//   const [reportsSearch, setReportsSearch] = useState<string>("");
//   const [openReportMenu, setOpenReportMenu] = useState<string | null>(null);
//   const searchParams = useSearchParams();

//   function toggleReportPin(id: string) {
//     setReports(prev => prev.map(r => (r.id === id ? { ...r, pinned: !r.pinned } : r)));
//   }

//   function toggleReportMenu(e: MouseEvent, id: string) {
//     e.stopPropagation();
//     setOpenReportMenu(prev => (prev === id ? null : id));
//   }

//   // Reflect "which report's version history is open" in the URL (?history=<id>)
//   // using the native History API rather than router.push/replace. This keeps
//   // the panel bookmarkable/shareable and lets the browser back button close
//   // it, without triggering a Next.js route transition or remounting the page
//   // (no data refetch, no scroll reset) — see:
//   // https://nextjs.org/docs/app/getting-started/linking-and-navigating#using-the-native-history-api
//   function openHistory(id: string) {
//     setOpenReportMenu(null);
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("history", id);
//     window.history.pushState(null, "", `?${params.toString()}`);
//   }

//   function closeHistory() {
//     const params = new URLSearchParams(searchParams.toString());
//     params.delete("history");
//     const qs = params.toString();
//     window.history.pushState(null, "", qs ? `?${qs}` : window.location.pathname);
//   }

//   const historyReportId = searchParams.get("history");
//   const historyReport = reports.find(r => r.id === historyReportId) ?? null;

//   const q = reportsSearch.toLowerCase().trim();
//   const reportMatches = (r: Report) => !q || r.title.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q);
//   const pinnedReports = reports.filter(r => r.pinned && reportMatches(r));
//   const restReports = reports.filter(r => !r.pinned && reportMatches(r));

//   return (
//   <div className="view active">
//             <div className="eyebrow">MY REPORTS</div>
//             <h2 style={{ fontSize: 26 }}>Everything you've saved</h2>
//             <p className="lede">Star anything you want quick access to — search works across titles and gene names.</p>

//             <div className="reports-toolbar">
//               <input
//                 className="reports-search"
//                 placeholder="Search reports, genes, or mutations…"
//                 value={reportsSearch}
//                 onChange={e => setReportsSearch(e.target.value)}
//               />
//             </div>

//             {pinnedReports.length > 0 && (
//               <div>
//                 <div className="reports-group-title">★ Pinned</div>
//                 {pinnedReports.map(r => (
//                   <ReportRow
//                     key={r.id}
//                     r={r}
//                     openMenuId={openReportMenu}
//                     onTogglePin={toggleReportPin}
//                     onToggleMenu={toggleReportMenu}
//                     onOpenHistory={openHistory}
//                   />
//                 ))}
//               </div>
//             )}

//             <div>
//               <div className="reports-group-title">All reports</div>
//               {restReports.length > 0 ? restReports.map(r => (
//                 <ReportRow
//                   key={r.id}
//                   r={r}
//                   openMenuId={openReportMenu}
//                   onTogglePin={toggleReportPin}
//                   onToggleMenu={toggleReportMenu}
//                   onOpenHistory={openHistory}
//                 />
//               )) : (
//                 <div className="reports-empty">{reportsSearch ? "No reports match your search." : "Nothing else saved yet."}</div>
//               )}
//             </div>

//             <VersionHistoryPanel report={historyReport} onClose={closeHistory} />
//           </div>
//   );
// }



"use client";

import { useState } from "react";
import { INITIAL_REPORTS, UPLOAD_HISTORY } from "../lib/mutation-data";
import type { Report, UploadHistoryEntry } from "../lib/mutation-types";
import SavedReportsPanel from "./SavedReportsPanel";
import UploadHistoryPanel from "./UploadHistoryPanel";

type ArchiveTab = "saved" | "history";

export default function ReportsView() {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [archiveTab, setArchiveTab] = useState<ArchiveTab>("saved");
  // Tracks history entries saved to "My reports" during this session, on top
  // of whatever INITIAL_REPORTS/UPLOAD_HISTORY already marked as saved.
  const [savedHistoryIds, setSavedHistoryIds] = useState<Set<string>>(new Set());

  function toggleReportPin(id: string) {
    setReports(prev => prev.map(r => (r.id === id ? { ...r, pinned: !r.pinned } : r)));
  }

  function isEntrySaved(entry: UploadHistoryEntry) {
    return Boolean(entry.savedReportId) || savedHistoryIds.has(entry.id);
  }

  function saveHistoryEntry(entry: UploadHistoryEntry) {
    if (entry.status === "failed" || isEntrySaved(entry)) return;
    const newReport: Report = {
      id: `from-${entry.id}`,
      title: entry.label,
      sub: `${entry.meta} · saved just now`,
      icon: entry.kind,
      pinned: false,
    };
    setReports(prev => [...prev, newReport]);
    setSavedHistoryIds(prev => new Set(prev).add(entry.id));
  }

  return (
    <div className="view active">
      <div className="eyebrow">WORKSPACE ARCHIVE</div>
      <h2 style={{ fontSize: 26 }}>Everything you&apos;ve saved — and everything you&apos;ve run</h2>
      <p className="lede">Star anything you want quick access to, and check the upload history for runs you never got around to saving.</p>

      <div className="subtabs">
        <button className={"subtab" + (archiveTab === "saved" ? " active" : "")} onClick={() => setArchiveTab("saved")}>Saved reports</button>
        <button className={"subtab" + (archiveTab === "history" ? " active" : "")} onClick={() => setArchiveTab("history")}>Upload history</button>
      </div>

      {archiveTab === "saved" && (
        <SavedReportsPanel reports={reports} onTogglePin={toggleReportPin} />
      )}

      {archiveTab === "history" && (
        <UploadHistoryPanel entries={UPLOAD_HISTORY} isSaved={isEntrySaved} onSave={saveHistoryEntry} />
      )}
    </div>
  );
}
