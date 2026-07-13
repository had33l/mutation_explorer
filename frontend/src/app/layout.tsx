import type { Metadata } from "next";
import type  {ReactNode}  from "react";
import "./globals.css";
import "@/styles/mutation-explorer.css";
import  AppLayout  from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Mutation Impact Explorer",
  description: "An AI-assisted tool for exploring the impact of genetic mutations on protein function and disease.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}

