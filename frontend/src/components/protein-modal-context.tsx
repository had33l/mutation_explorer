"use client";

import React, { createContext, useCallback, useContext, useMemo, useState} from "react";
import type { ProteinModalState } from "@/lib/mutation-types";

interface ProteinModalContextValue{
    protein: ProteinModalState;
    showProtein: (gene: string, source: "rnaseq" | "variant") => void;
    closeProtein: () => void;
}

const ProteinModalContext = createContext<ProteinModalContextValue | null>(null);

export function ProteinModalProvider({ children}: {children: React.ReactNode}){
    const [protein, setProtein] = useState<ProteinModalState>({ open: false, gene: "TP53", source: "rnaseq"});

    const showProtein = useCallback((gene: string, source: "rnaseq" | "variant") => {
        setProtein({ open: true, gene, source });
    }, []);

    const closeProtein = useCallback(() => {
        setProtein(prev => ({ ...prev, open: false }));
    }, []);

    const value = useMemo(() => ({ protein, showProtein, closeProtein }), [protein, showProtein, closeProtein]);

    return (
        <ProteinModalContext.Provider value={value}>
            {children}
        </ProteinModalContext.Provider>
    );
}


export function useProteinModal() {
    const ctx = useContext(ProteinModalContext);
    if (!ctx) throw new Error("useProteinModal must be used within a ProteinModalProvider");
    return ctx;
}