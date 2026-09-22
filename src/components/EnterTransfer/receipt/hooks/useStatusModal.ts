import { useCallback, useEffect, useRef, useState } from "react";

import { haptic } from "../telegram.ts";

export type StatusModalType = "loading" | "saving" | "success" | "saved" | "error";

export interface StatusModalState {
    status: StatusModalType;
    message: string;
}

export interface StatusModalController {
    /** null when nothing is shown. */
    state: StatusModalState | null;
    /**
     * Shows a status. "loading"/"saving" stay until the next call; "success"/"saved"/"error" fire the matching
     * haptic once and auto-hide after `autoHideMs` (default 2000; pass 0 to keep it up).
     */
    show: (status: StatusModalType, message: string, autoHideMs?: number) => void;
    hide: () => void;
}

const DEFAULT_AUTO_HIDE_MS = 2000;

/**
 * State of a StatusModal: status, message, auto-hide timer and the one haptic call per status change.
 * Used by any form that shows "loading -> success/error" (Enter, Receipt): a status change here is the single
 * place that fires haptics, so a validation error and its "error" status no longer haptic twice (see ReceiptTab).
 */
export const useStatusModal = (): StatusModalController => {
    const [state, setState] = useState<StatusModalState | null>(null);
    const timerRef = useRef<number | undefined>(undefined);

    const clearTimer = () => {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
    };

    // Never let a stale timer hide a status shown after it, and never leave one running past unmount.
    useEffect(() => clearTimer, []);

    const show = useCallback((status: StatusModalType, message: string, autoHideMs: number = DEFAULT_AUTO_HIDE_MS) => {
        clearTimer();
        setState({ status, message });

        if (status === "success" || status === "saved") haptic.success();
        else if (status === "error") haptic.error();

        if (autoHideMs > 0) {
            timerRef.current = window.setTimeout(() => setState(null), autoHideMs);
        }
    }, []);

    const hide = useCallback(() => {
        clearTimer();
        setState(null);
    }, []);

    return { state, show, hide };
};
