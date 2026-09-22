import { describe, expect, it } from "vitest";

import type { MonthlyAnalyticsItem } from "../../../services/api.ts";
import { buildMonthView, resolveActiveIndex, shiftMonth } from "./monthAnalytics.ts";

const m = (month: string, income: number, outcome: number): MonthlyAnalyticsItem =>
    ({ month, total: 0, totalIncome: income, totalOutcome: outcome, realOutcomeTotal: 0, incomeCategories: [], outcomeCategories: [] }) as MonthlyAnalyticsItem;
const sorted = [{ month: "2026-01" }, { month: "2026-02" }, { month: "2026-03" }];

describe("resolveActiveIndex", () => {
    it("no selection means the latest month", () => {
        expect(resolveActiveIndex(sorted, null)).toBe(2);
    });
    it("a selected month is found by its key", () => {
        expect(resolveActiveIndex(sorted, "2026-01")).toBe(0);
    });
    it("a selected month that is not in the data falls back to the latest", () => {
        expect(resolveActiveIndex(sorted, "2025-12")).toBe(2);
    });
    it("no months: -1", () => {
        expect(resolveActiveIndex([], null)).toBe(-1);
    });
});

describe("shiftMonth", () => {
    it("moves by one and stops at both ends", () => {
        expect(shiftMonth(sorted, "2026-02", -1)).toBe("2026-01");
        expect(shiftMonth(sorted, "2026-02", 1)).toBe("2026-03");
        expect(shiftMonth(sorted, "2026-01", -1)).toBe("2026-01");
        expect(shiftMonth(sorted, "2026-03", 1)).toBe("2026-03");
    });
    it("starts from the latest when nothing is selected", () => {
        expect(shiftMonth(sorted, null, -1)).toBe("2026-02");
    });
    it("is null without months", () => {
        expect(shiftMonth([], null, 1)).toBeNull();
    });
});

describe("buildMonthView", () => {
    const months = [m("2026-03", 300, 100), m("2026-01", 100, 10), m("2026-02", 200, 50)];

    it("sorts the months, totals over the period, latest month active by default", () => {
        const v = buildMonthView(months, "total", null);
        expect(v.sortedMonths.map((x) => x.month)).toEqual(["2026-01", "2026-02", "2026-03"]);
        expect(v.points.map((p) => [p.monthStr, p.income, p.outcome])).toEqual([["2026-01", 100, 10], ["2026-02", 200, 50], ["2026-03", 300, 100]]);
        expect(v.totals).toEqual({ income: 600, outcome: 160, net: 440 });
        expect(v.activeIndex).toBe(2);
        expect(v.activeValues).toEqual({ income: 300, outcome: 100 });
    });

    it("follows the selected month", () => {
        const v = buildMonthView(months, "total", "2026-01");
        expect(v.activeIndex).toBe(0);
        expect(v.activeMonth?.month).toBe("2026-01");
        expect(v.activeValues).toEqual({ income: 100, outcome: 10 });
    });

    it("when the data changes and the selected month is gone, the latest one is shown (the old code kept the index)", () => {
        const other = [m("2026-04", 1, 1), m("2026-05", 2, 2)];
        expect(buildMonthView(other, "total", "2026-01").activeMonth?.month).toBe("2026-05");
    });

    it("no months: zeros, nothing active", () => {
        const v = buildMonthView([], "real", null);
        expect(v).toMatchObject({ points: [], activeIndex: -1, activeMonth: undefined, activeValues: { income: 0, outcome: 0 }, totals: { income: 0, outcome: 0, net: 0 } });
    });
});
