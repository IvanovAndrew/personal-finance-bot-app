import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EARLIEST_DATA_DATE } from "../../../constants/data.ts";
import { financeApi } from "../../../services/api.ts";
import { parseDateKey, toDateKey } from "../../../utils/dates.ts";
import {
    appendGroups,
    chunkCacheKey,
    chunkEndingAt,
    cursorAfter,
    type DailyGroup,
    type DateRange,
    mapDailyResponse,
} from "./dailyTimeline.ts";

export interface TimelineError {
    /** "initial": the first chunk failed. "more": an older chunk failed, what is loaded stays on screen. */
    phase: "initial" | "more";
    message: string;
}

export interface DailyTimeline {
    groups: DailyGroup[];
    /** First load, or reload after currency / anchor date changed. */
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    error: TimelineError | null;
    loadMore: () => void;
    retry: () => void;
}

interface Options {
    /** Nothing is fetched while the Daily view is not on screen. */
    enabled: boolean;
    currency: string;
    /** The newest day of the timeline. */
    anchorDate: Date;
    /** Must be referentially stable. */
    earliest?: Date;
}

type Status = "loading" | "idle" | "loadingMore" | "error";

interface State {
    /** Which (currency, anchor day) this state belongs to. */
    scope: string;
    groups: DailyGroup[];
    /** End day of the next chunk to request. */
    cursor: Date;
    status: Status;
    error: TimelineError | null;
}

const NO_GROUPS: DailyGroup[] = [];

/**
 * State of the endless Daily timeline: first chunk, older chunks on demand, per-chunk cache,
 * cancellation, and a snapshot per (currency, anchor day) so that going back is instant.
 *
 * A change of currency or anchor day starts a new "scope": the old data is never shown for the new scope,
 * `hasMore` starts over, and responses of the old scope are discarded.
 */
export const useDailyTimeline = ({ enabled, currency, anchorDate, earliest = EARLIEST_DATA_DATE }: Options): DailyTimeline => {
    const anchorKey = toDateKey(anchorDate);
    const anchor = useMemo(() => parseDateKey(anchorKey), [anchorKey]);
    const scope = `${currency}|${anchorKey}`;

    const [state, setState] = useState<State>(() => ({ scope, groups: NO_GROUPS, cursor: anchor, status: "loading", error: null }));
    const [reloadToken, setReloadToken] = useState(0);

    const stateRef = useRef(state);
    const scopeRef = useRef(scope);
    const busyRef = useRef(false);
    const controllerRef = useRef<AbortController | null>(null);
    const chunkCache = useRef(new Map<string, DailyGroup[]>());
    const snapshots = useRef(new Map<string, State>());

    useEffect(() => {
        stateRef.current = state;
        if (state.status === "idle") snapshots.current.set(state.scope, state);
    }, [state]);

    const fetchChunk = useCallback(
        async (chunk: DateRange, signal: AbortSignal): Promise<DailyGroup[]> => {
            const key = chunkCacheKey(currency, chunk);
            const cached = chunkCache.current.get(key);
            if (cached) return cached;

            const response = await financeApi.getDailyExpenses({ startDate: chunk.start, endDate: chunk.end, currency }, signal);
            const groups = mapDailyResponse(response);
            chunkCache.current.set(key, groups);
            return groups;
        },
        [currency]
    );

    // New scope (or reload): restore a snapshot, or load the first chunk.
    useEffect(() => {
        if (!enabled) return;

        scopeRef.current = scope;
        busyRef.current = false;
        const controller = new AbortController();
        controllerRef.current = controller;

        const snapshot = snapshots.current.get(scope);
        if (snapshot) {
            setState(snapshot);
            return () => controller.abort();
        }

        const first = chunkEndingAt(anchor, earliest);
        if (!first) {
            setState({ scope, groups: NO_GROUPS, cursor: anchor, status: "idle", error: null });
            return () => controller.abort();
        }

        setState({ scope, groups: NO_GROUPS, cursor: anchor, status: "loading", error: null });
        busyRef.current = true;

        fetchChunk(first, controller.signal)
            .then((groups) => {
                if (controller.signal.aborted) return;
                busyRef.current = false;
                setState({ scope, groups, cursor: cursorAfter(first), status: "idle", error: null });
            })
            .catch((err: unknown) => {
                if (controller.signal.aborted) return;
                busyRef.current = false;
                console.error("Daily timeline: first chunk failed", err);
                setState({
                    scope,
                    groups: NO_GROUPS,
                    cursor: anchor,
                    status: "error",
                    error: { phase: "initial", message: "Failed to load expenses" },
                });
            });

        return () => controller.abort();
    }, [enabled, scope, anchor, earliest, fetchChunk, reloadToken]);

    const loadMore = useCallback(() => {
        const s = stateRef.current;
        const canRun = s.status === "idle" || (s.status === "error" && s.error?.phase === "more");
        const controller = controllerRef.current;
        if (!enabled || busyRef.current || !canRun || s.scope !== scopeRef.current || !controller) return;

        const chunk = chunkEndingAt(s.cursor, earliest);
        if (!chunk) return;

        busyRef.current = true;
        const runScope = s.scope;
        setState((p) => (p.scope === runScope ? { ...p, status: "loadingMore", error: null } : p));

        fetchChunk(chunk, controller.signal)
            .then((groups) => {
                if (controller.signal.aborted) return;
                busyRef.current = false;
                setState((p) =>
                    p.scope !== runScope
                        ? p
                        : { ...p, groups: appendGroups(p.groups, groups), cursor: cursorAfter(chunk), status: "idle", error: null }
                );
            })
            .catch((err: unknown) => {
                if (controller.signal.aborted) return;
                busyRef.current = false;
                console.error("Daily timeline: older chunk failed", err);
                setState((p) =>
                    p.scope !== runScope
                        ? p
                        : { ...p, status: "error", error: { phase: "more", message: "Couldn't load older days" } }
                );
            });
    }, [enabled, earliest, fetchChunk]);

    const retry = useCallback(() => {
        if (stateRef.current.error?.phase === "more") loadMore();
        else setReloadToken((t) => t + 1);
    }, [loadMore]);

    // Until the effect has switched the state to the new scope, show "loading", never the previous scope's data.
    const isCurrent = enabled && state.scope === scope;
    const status: Status = isCurrent ? state.status : "loading";

    return {
        groups: isCurrent ? state.groups : NO_GROUPS,
        isLoading: enabled && status === "loading",
        isLoadingMore: status === "loadingMore",
        hasMore: isCurrent && chunkEndingAt(state.cursor, earliest) !== null,
        error: isCurrent ? state.error : null,
        loadMore,
        retry,
    };
};
