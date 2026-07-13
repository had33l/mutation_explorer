import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
    {href: "/", label: "Home"},
    {href: "/rnaseq", label: "RNA-seq"},
    {href: "/variant", label: "Mutation Lookup"},
    {href: "/reports", label: "Reports"},
];

export default function Navbar() {
    const pathname = usePathname();

    return(
        <div className="nav">
            <div className="nav-inner">
                <div className="brand">
                    <span className="logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" stroke="#fff"><path d="M4 12c2-4 4-4 6 0 4-4 6 0"/></svg>
                    </span>
                    Mutation Impact Explorer 
                </div>
                <div className="nav-links">
                    {LINKS.map((link) => (
                        <Link key={link.href} href={link.href} className={"nav-link" + (pathname === link.href ? " active" : "")}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
                <button className="nav-help"> Help ?</button>
            </div>
        </div>
    );
}