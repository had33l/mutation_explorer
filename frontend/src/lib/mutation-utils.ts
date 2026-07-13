import type { CSSProperties } from "react";

/**
 * Converts a CSS declaration string ("color:red;font-size:12px;") into a
 * React style object. This lets markup ported from the original HTML
 * mockup keep its original inline style strings unchanged, instead of
 * hand-converting every style="..." attribute into a style={{ }} object.
 */
export function ps(str?: string): CSSProperties {
  const out: Record<string, string> = {};
  if (!str) return out as CSSProperties;
  
  str.split(";").forEach(decl => {
    const idx = decl.indexOf(":");
    if (idx === -1) return;
    const prop = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!prop || !val) return;
    const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = val;
  });
  
  return out as CSSProperties;
}