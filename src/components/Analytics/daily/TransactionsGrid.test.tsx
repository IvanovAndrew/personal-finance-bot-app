import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseDateKey } from "../../../utils/dates.ts";
import { TransactionsGrid } from "./TransactionGrid.tsx";
import type { DailyTimeline } from "./useDailyTimeline.ts";

const currency = { name: "AMD", symbol: "֏", format: "C0", isPopular: true };
const group = (dateKey: string, shop: string) => ({
    date: parseDateKey(dateKey),
    items: [{ shop, date: dateKey, total: 100, currency: "AMD", expenses: [] }],
});

const timeline = (patch: Partial<DailyTimeline> = {}): DailyTimeline => ({
    groups: [], isLoading: false, isLoadingMore: false, hasMore: true, error: null, loadMore: vi.fn(), retry: vi.fn(), ...patch,
});
const renderGrid = (t: DailyTimeline) => render(<TransactionsGrid timeline={t} currency={currency} anchorDate={new Date(2026, 8, 20)} />);

let observers: { cb: IntersectionObserverCallback; live: boolean }[];
beforeEach(() => {
    observers = [];
    vi.stubGlobal("IntersectionObserver", class {
        entry = { cb: null as unknown as IntersectionObserverCallback, live: false };
        constructor(cb: IntersectionObserverCallback) { this.entry.cb = cb; observers.push(this.entry); }
        observe() { this.entry.live = true; }
        disconnect() { this.entry.live = false; }
        unobserve() { this.entry.live = false; }
    });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("TransactionsGrid", () => {
    it("shows one loader while the first chunk loads, without a Download button", () => {
        renderGrid(timeline({ isLoading: true }));
        expect(screen.getAllByText(/Loading expenses/)).toHaveLength(1);
        expect(screen.queryByText("Download")).toBeNull();
    });

    it("shows the empty state when there is nothing", () => {
        renderGrid(timeline());
        expect(screen.getByText("No expenses in this period")).toBeTruthy();
    });

    it("shows a retryable error instead of the list when the first load failed", () => {
        const t = timeline({ error: { phase: "initial", message: "Failed to load expenses" } });
        renderGrid(t);
        screen.getByText("Retry").click();
        expect(t.retry).toHaveBeenCalledTimes(1);
    });

    it("renders every day with a single Download button and asks for more when the sentinel is visible", () => {
        const t = timeline({ groups: [group("2026-09-19", "Shop A"), group("2026-09-18", "Shop B")] });
        renderGrid(t);
        expect(screen.getByText("Shop A")).toBeTruthy();
        expect(screen.getByText("Shop B")).toBeTruthy();
        expect(screen.getAllByText("Download")).toHaveLength(1);

        const live = observers.filter((o) => o.live);
        expect(live).toHaveLength(1);
        live[0].cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
        expect(t.loadMore).toHaveBeenCalledTimes(1);
    });

    it("does not observe while a chunk is loading or after a failure", () => {
        renderGrid(timeline({ groups: [group("2026-09-19", "Shop A")], isLoadingMore: true }));
        expect(observers.filter((o) => o.live)).toHaveLength(0);
        cleanup();
        renderGrid(timeline({ groups: [group("2026-09-19", "Shop A")], error: { phase: "more", message: "Couldn't load older days" } }));
        expect(observers.filter((o) => o.live)).toHaveLength(0);
        expect(screen.getByText("Couldn't load older days")).toBeTruthy();
    });

    it("says there is no earlier data at the end", () => {
        renderGrid(timeline({ groups: [group("2026-09-19", "Shop A")], hasMore: false }));
        expect(screen.getByText("No earlier data")).toBeTruthy();
    });
});
