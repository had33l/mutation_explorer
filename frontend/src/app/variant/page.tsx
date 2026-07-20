"use client";

import dynamic from "next/dynamic";

// Dynamically import the view only on the client-side to bypass SSR completely
const VariantView = dynamic(() => import("@/components/VariantView"), {
  ssr: false,
});

export default function Page() {
  return <VariantView />;
}