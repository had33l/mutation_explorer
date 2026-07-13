"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RnaSeqUploadPanel from "./RnaSeqUploadPanel";
import SampleExplorerPanel from "./SampleExplorerPanel";
import BatchQualityCheck from "./BatchQualityCheck";
import CohortTrends from "./CohortTrends";

type Subview = "explorer" | "qc" | "cohort";

export default function RnaSeqView() {
  const router = useRouter();
  const [subview, setSubview] = useState<Subview>("explorer");

  return (
    <div className="view active">
      <RnaSeqUploadPanel />

      <div style={{ marginTop: 52 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 0, flexWrap: "wrap", gap: 8 }}>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>220 samples analyzed</h3>
            <p className="section-sub" style={{ marginTop: 4 }}>Select a sample on the left to see its full breakdown.</p>
          </div>
          <span className="tag tag-sage">203 tumor · 17 normal</span>
        </div>

        <div className="subtabs">
          <button className={"subtab" + (subview === "explorer" ? " active" : "")} onClick={() => setSubview("explorer")}>Sample explorer</button>
          <button className={"subtab" + (subview === "qc" ? " active" : "")} onClick={() => setSubview("qc")}>Batch quality check</button>
          <button className={"subtab" + (subview === "cohort" ? " active" : "")} onClick={() => setSubview("cohort")}>Cohort-wide trends</button>
        </div>

        {subview === "explorer" && <SampleExplorerPanel />}
        {subview === "qc" && <BatchQualityCheck />}
        {subview === "cohort" && <CohortTrends />}

        <div className="actions-row">
          <button className="btn btn-secondary">Start a new analysis</button>
          <button className="btn btn-primary" onClick={() => router.push("/reports")}>Save to my reports →</button>
        </div>
      </div>
    </div>
  );
}
