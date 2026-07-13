import Link from "next/link";

export default function HomeView() {
    return (
        <div className="view active">
            <div className="hero">
                <div className="eyebrow" style={{ justifyContent: "center", display:"flex" }}> Welcome</div>
                <h1>Understand what your genomic data actually means. </h1>
                <p>Upload gene expression data or look up a single mutation - we'll explain the biology in plain language, 
                    backed by the evidence behind it.</p>
            </div>

            <div className="start-cards">
                <Link href="/rnaseq" className="start-card">
                    <div className="ic"> <svg width="24" height="24" stroke="var(--sage)"><path d="M3 17V9M9 17V4M15 17v-6M21 17V7"/> </svg>  </div>
                    <h3>Analyze gene expression data</h3>
                    <p>Upload an RNA-seq dataset. We'll predict the disease state and show you which genes mattered most.</p>
                    <div className="go"> Start analysis &rarr;</div>
                </Link>
                <Link href="/varient" className="start-card">
                    <div className="ic"> <svg width="24" height="24" stroke="var(--sage)">  
                    <path d="M4 4v16M4 8h6a4 4 0 000-8H4M4 16h9a4 4 0 010 8H4"/>    </svg>  </div>
                    <h3>Look up a mutation</h3>
                    <p>Search a single mutation or gene name and get a clear answer on what it means clinically</p>
                    <div className="go"> Search now &rarr;</div>
                </Link>
            </div>

            <div className="howitworks">
                <h2>How It Works</h2>
                <div className="hiw-row">
                    <div className="hiw-step"> 
                        <div className="n"> 1 </div> 
                        <h4> You Provide data</h4>
                        <p>A gene,a mutation, or a full expression dataset - whatever you have.</p> 
                    </div>

                    <div className="hiw-step"> 
                        <div className="n"> 2 </div> 
                        <h4> We Analyze It</h4>
                        <p>Clinical databases, machine learning, and protein biology, combined automatically.</p> 
                    </div>

                    <div className="hiw-step"> 
                        <div className="n"> 3 </div> 
                        <h4> You Get Clear Answers</h4>
                        <p>A plain-language explanation, backed by the evidence, ready to share or export.</p> 
                    </div>
                </div>
            </div>

        </div>
    );
}