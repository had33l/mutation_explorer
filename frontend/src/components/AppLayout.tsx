"use client";

import React from "react";
import Navbar from "./Navbar";
import ProteinModal from "./ProteinModal";
import NavigationProgressBar from "./NavigationProgressBar";
import { ProteinModalProvider } from "./protein-modal-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mie-app">
            <NavigationProgressBar/>
            <ProteinModalProvider>
                <Navbar />
                <div className="page">{children}</div>
                <ProteinModal />
            </ProteinModalProvider>
        </div>
    );
}