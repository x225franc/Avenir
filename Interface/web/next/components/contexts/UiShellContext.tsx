"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type UiShellVisibility = {
    showHeader: boolean;
    showFooter: boolean;
};

type UiShellContextValue = UiShellVisibility & {
    setVisibility: (visibility: Partial<UiShellVisibility>) => void;
    resetVisibility: () => void;
};

const UiShellContext = createContext<UiShellContextValue | undefined>(undefined);

export function UiShellProvider({ children, initialVisibility }: { children: React.ReactNode; initialVisibility: UiShellVisibility }) {
    const [visibility, setVisibilityState] = useState<UiShellVisibility>(initialVisibility);

    const setVisibility = useCallback((v: Partial<UiShellVisibility>) => {
        setVisibilityState(prev => ({ ...prev, ...v }));
    }, []);

    const resetVisibility = useCallback(() => {
        setVisibilityState(initialVisibility);
    }, [initialVisibility]);

    const value = useMemo<UiShellContextValue>(() => ({
        showHeader: visibility.showHeader,
        showFooter: visibility.showFooter,
        setVisibility,
        resetVisibility,
    }), [visibility, setVisibility, resetVisibility]);

    return (
        <UiShellContext.Provider value={value}>
            {children}
        </UiShellContext.Provider>
    );
}

export function useUiShell() {
    const ctx = useContext(UiShellContext);
    if (!ctx) {
        throw new Error("useUiShell must be used within a UiShellProvider");
    }
    return ctx;
}



