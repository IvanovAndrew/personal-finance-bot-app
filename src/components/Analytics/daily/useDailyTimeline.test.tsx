import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { financeApi } from "../../../services/api.ts";
import { parseDateKey, toDateKey } from "../../../utils/dates.ts";
import { useDailyTimeline } from "./useDailyTimeline.ts";

const d = parseDateKey;
type Params = { startDate: Date; endDate: Date; currency: string };
type Resp = Awaited<ReturnType<typeof financeApi.getDailyExpenses>>;
type Deferred = { params: Params; resolve: (v: Resp) => void; reject: (e: Error) => void };

const day = (dateKey: string) => ({ [dateKey]: [{ shop: "S-" + dateKey, date: dateKey, total: 1, currency: "AMD", expenses: [] }] });

let calls: Params[];
let deferred: Deferred[];
let impl: (p: Params) => Promise<Resp>;

beforeEach(() => {
    calls = []; deferred = [];
    impl = (p) => Promise.resolve(day(toDateKey(p.endDate)));
    vi.spyOn(financeApi, "getDailyExpenses").mockImplementation((p: Params) => { calls.push(p); return impl(p); });
    vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

const manual = () => { impl = (p) => new Promise((resolve, reject) => deferred.push({ params: p, resolve, reject })); };
const setup = (init: { currency?: string; anchor?: string; enabled?: boolean; earliest?: string } = {}) =>
    renderHook((props: { currency: string; anchor: string; enabled: boolean }) =>
        useDailyTimeline({ enabled: props.enabled, currency: props.currency, anchorDate: d(props.anchor), earliest: EARLIEST }),
        { initialProps: { currency: init.currency ?? "AMD", anchor: init.anchor ?? "2026-09-20", enabled: init.enabled ?? true } });
const EARLIEST = d("2026-08-01");

describe("useDailyTimeline", () => {
    it("shows loading, then the first 7-day chunk", async () => {
        const { result } = setup();
        expect(result.current.isLoading).toBe(true);
        expect(result.current.groups).toEqual([]);

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.groups).toHaveLength(1);
        expect([toDateKey(calls[0].startDate), toDateKey(calls[0].endDate)]).toEqual(["2026-09-14", "2026-09-20"]);
        expect(result.current.hasMore).toBe(true);
    });

    it("loadMore appends the next older chunk", async () => {
        const { result } = setup();
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        act(() => result.current.loadMore());
        expect(result.current.isLoadingMore).toBe(true);
        await waitFor(() => expect(result.current.isLoadingMore).toBe(false));

        expect([toDateKey(calls[1].startDate), toDateKey(calls[1].endDate)]).toEqual(["2026-09-07", "2026-09-13"]);
        expect(result.current.groups.map((g) => toDateKey(g.date))).toEqual(["2026-09-20", "2026-09-13"]);
    });

    it("an empty week does not make it ask for the same week again", async () => {
        impl = () => Promise.resolve(calls.length === 1 ? day("2026-09-20") : {});
        const { result } = setup();
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.isLoadingMore).toBe(false));
        act(() => result.current.loadMore());
        await waitFor(() => expect(calls).toHaveLength(3));

        expect(toDateKey(calls[1].endDate)).toBe("2026-09-13");
        expect(toDateKey(calls[2].endDate)).toBe("2026-09-06");
    });

    it("never runs two requests at once", async () => {
        const { result } = setup();
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        manual();

        act(() => { result.current.loadMore(); result.current.loadMore(); result.current.loadMore(); });
        expect(deferred).toHaveLength(1);
    });

    it("reaches the earliest day and stops", async () => {
        const { result } = setup({ anchor: "2026-08-05" });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect([toDateKey(calls[0].startDate), toDateKey(calls[0].endDate)]).toEqual(["2026-08-01", "2026-08-05"]);
        expect(result.current.hasMore).toBe(false);

        act(() => result.current.loadMore());
        expect(calls).toHaveLength(1);
    });

    it("a currency change starts over: no old data, hasMore is true again", async () => {
        const { result, rerender } = setup({ anchor: "2026-08-05" });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.hasMore).toBe(false);

        manual();
        rerender({ currency: "RUR", anchor: "2026-08-05", enabled: true });
        expect(result.current.isLoading).toBe(true);
        expect(result.current.groups).toEqual([]);
        expect(result.current.hasMore).toBe(true);
        await waitFor(() => expect(deferred).toHaveLength(1));
        expect(deferred[0].params.currency).toBe("RUR");
    });

    it("picking a later date after the end was reached re-enables loading (was a bug)", async () => {
        const { result, rerender } = setup({ anchor: "2026-08-05" });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.hasMore).toBe(false);

        rerender({ currency: "AMD", anchor: "2026-09-20", enabled: true });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.hasMore).toBe(true);
    });

    it("a response that arrives after the scope changed is discarded", async () => {
        manual();
        const { result, rerender } = setup({ anchor: "2026-09-20" });
        await waitFor(() => expect(deferred).toHaveLength(1));

        rerender({ currency: "AMD", anchor: "2026-09-10", enabled: true });
        await waitFor(() => expect(deferred).toHaveLength(2));

        await act(async () => { deferred[0].resolve(day("2026-09-20")); });
        expect(result.current.groups).toEqual([]);
        expect(result.current.isLoading).toBe(true);

        await act(async () => { deferred[1].resolve(day("2026-09-10")); });
        expect(result.current.groups.map((g) => toDateKey(g.date))).toEqual(["2026-09-10"]);
    });

    it("going back to a previous scope restores it without new requests", async () => {
        const { result, rerender } = setup({ anchor: "2026-09-20" });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.groups).toHaveLength(2));

        rerender({ currency: "AMD", anchor: "2026-09-10", enabled: true });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        const before = calls.length;

        rerender({ currency: "AMD", anchor: "2026-09-20", enabled: true });
        await waitFor(() => expect(result.current.groups).toHaveLength(2));
        expect(calls).toHaveLength(before);
    });

    it("first chunk failure -> error(initial), retry loads it", async () => {
        impl = () => Promise.reject(new Error("boom"));
        const { result } = setup();
        await waitFor(() => expect(result.current.error?.phase).toBe("initial"));
        expect(result.current.isLoading).toBe(false);

        impl = (p) => Promise.resolve(day(toDateKey(p.endDate)));
        act(() => result.current.retry());
        await waitFor(() => expect(result.current.groups).toHaveLength(1));
        expect(result.current.error).toBeNull();
    });

    it("older chunk failure keeps what is loaded, retry appends it", async () => {
        const { result } = setup();
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        impl = () => Promise.reject(new Error("boom"));
        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.error?.phase).toBe("more"));
        expect(result.current.groups).toHaveLength(1);

        impl = (p) => Promise.resolve(day(toDateKey(p.endDate)));
        act(() => result.current.retry());
        await waitFor(() => expect(result.current.groups).toHaveLength(2));
        expect(result.current.error).toBeNull();
    });

    it("does nothing while disabled", async () => {
        const { result } = setup({ enabled: false });
        await new Promise((r) => setTimeout(r, 20));
        expect(calls).toHaveLength(0);
        expect(result.current.isLoading).toBe(false);
    });
});
