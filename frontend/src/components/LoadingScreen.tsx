export default function LoadingScreen({ label = "Loading…"}: { label?: string} ){
    return (
        <div className="view active" style={{ display: "flex",
           flexDirection: "column", alignItems: "center", justifyContent: "center",
           minHeight: "40vh", gap: 14}}>
            <div className="loading-spinner" aria-hidden="true" />
            <p style={{ color: "var(--muted)", fontSize: 14 }}> {label}</p>
        </div>
    );
}