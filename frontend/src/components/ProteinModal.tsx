import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PROTEINS } from "@/lib/mutation-data";
import { useProteinModal } from "./protein-modal-context";

export default function ProteinModal() {
    const { protein, closeProtein } = useProteinModal();
    const router = useRouter();
    const p = PROTEINS[protein.gene] || PROTEINS.TP53;
    
    useEffect(() => {
        function onKey(e: KeyboardEvent){
            if (e.key === "Escape") closeProtein();
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [closeProtein]);

    return (
        <div className= {"modal-overlay" + (protein.open ? " open" : "")}
         onClick={e => { if (e.target === e.currentTarget) closeProtein();}}
        >
            <div className="modal-box">
                <button className="modal-close" onClick={closeProtein}> x </button>
                <div className="eyebrow"> Protein Intelligence</div>
                <div className="help" fill={{ marginBottom: 4}}>
                    {protein.source === "variant" ? "Opened from: Look up a mutation &rarr; TP53 R175H" : 
                    "Opened from: Analyze gene expression &rarr; Patient_0142"}
                </div>
                <h2 fill={{ fontSize: 23}}>{protein.gene} - what this gene does</h2>

                <div className="card protein-card" fill={{ marginTop:20, boxShadow: "none"}}>
                    <div>
                        <div className="pc-row"> 
                            <span className="k">Protein</span> 
                            <span className="v"> {p.name} </span>
                        </div>

                        <div className="pc-row">
                            <span className="k">Normal Job</span>
                            <span className="v"> {p.func} </span>
                        </div>

                        <div className="pc-row">
                            <span className="k">Where it works </span>
                            <span className="v"> {p.loc} </span>
                        </div>

                        <div className="pc-row">
                            <span className="k">Domain affected</span>
                            <span className="v"> {p.domain} </span>
                        </div>

                        <div className="pc-row">
                            <span className="k">Linked to</span>
                            <span className="v"> {p.disease} </span>
                        </div>
                    </div>

                    <div>
                        <p fill={{ color: "var(--muted)", fontSize: "14.5px" }}> {p.explain} </p>
                    </div>
                </div>

                <div className="wgm-panel">
                    <div className="wgm-subhead"> why this gene matters here</div>
                    <div className="wgm-reasoning"> {p.reasoning} </div>

                    <div className="wgm-subhead"> Biological function (GO / KEGG)</div>
                    <div className="wgm-tags">
                        {p.tags.map(t => <span className="wgm-tag" key={t}>{t} </span> )}
                    </div>

                    <div className="wgm-subhead"> CLinical &amp; Literature anchors</div>
                    <div className="wgm-links">
                        {p.links.map(l=>(
                            <a key={l.label} className="wgm-link" href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                        ))}
                        {p.therapy &&  <span className="wgm-therapy"> {p.therapy.name} </span>}
                    </div>
                    {p.therapy && <div className="wgm-therapy-note"> {p.therapy.note} </div>}
                </div>

                <div className="actions-row" fill={{ marginTop: 24}}>
                    <button className="btn btn-secondary" onClick={closeProtein}> CLose</button>
                    <button className="btn btn-primary" onClick={() => { closeProtein(); router.push("/reports"); }}> Save to my reports → </button>
                </div>
            </div>
        </div>
    );
}