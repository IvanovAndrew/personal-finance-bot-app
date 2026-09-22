import { describe, expect, it } from "vitest";

import type { MonthlyAnalyticsItem } from "../../../services/api.ts";
import type { Category } from "../../../types/finance.ts";
import {
    aggregateSubcategories,
    buildCategoryView,
    categoriesWithData,
    categoryTrend,
    resolveActiveCode,
    sameCode,
    toggleMonth,
    uniqueOutcomeCodes,
} from "./categoryAnalytics.ts";

const cat = (code: string, subs: [string, string][] = []): Category =>
    ({ code, name: code, icon: "", color: "", isPopular: true, subCategories: subs.map(([c, n]) => ({ code: c, name: n })) }) as unknown as Category;

const month = (m: string, outcome: MonthlyAnalyticsItem["outcomeCategories"]): MonthlyAnalyticsItem =>
    ({ month: m, total: 0, totalOutcome: 0, realOutcomeTotal: 0, totalIncome: 0, incomeCategories: [], outcomeCategories: outcome }) as MonthlyAnalyticsItem;

const food = (total: number, subs: { subCategory: string | null; total: number }[] = []) => ({ category: "Food", total, subCategories: subs });

describe("sameCode", () => {
    it("ignores case, and null never matches", () => {
        expect(sameCode("Food", "fOOD")).toBe(true);
        expect(sameCode("Food", "Pets")).toBe(false);
        expect(sameCode(null, "Food")).toBe(false);
        expect(sameCode(undefined, null)).toBe(false);
    });
});

describe("uniqueOutcomeCodes", () => {
    it("lists each code once, in first-seen order", () => {
        const months = [month("2026-01", [food(1), { category: "Pets", total: 1, subCategories: [] }]), month("2026-02", [{ category: "Cafe", total: 1, subCategories: [] }, food(1)])];
        expect(uniqueOutcomeCodes(months)).toEqual(["Food", "Pets", "Cafe"]);
    });
});

describe("categoriesWithData", () => {
    const all = [cat("Food"), cat("Pets"), cat("Cafe")];
    it("keeps only categories that appear in the data, case-insensitively", () => {
        expect(categoriesWithData(all, ["food", "CAFE"]).map((c) => c.code)).toEqual(["Food", "Cafe"]);
    });
    it("falls back to all categories when none has data", () => {
        expect(categoriesWithData(all, ["Unknown"])).toBe(all);
        expect(categoriesWithData(all, [])).toBe(all);
    });
});

describe("resolveActiveCode", () => {
    it("prefers the selection, then the first available category, then the first code in the data", () => {
        expect(resolveActiveCode("Pets", [cat("Food")], ["Cafe"])).toBe("Pets");
        expect(resolveActiveCode(null, [cat("Food")], ["Cafe"])).toBe("Food");
        expect(resolveActiveCode(null, [], ["Cafe"])).toBe("Cafe");
        expect(resolveActiveCode(null, [], [])).toBeNull();
    });
});

describe("categoryTrend", () => {
    it("matches the category case-insensitively, zero where it is absent, order of the input kept", () => {
        const months = [month("2026-02", [food(20)]), month("2026-01", [{ category: "food", total: 10, subCategories: [] }]), month("2026-03", [])];
        expect(categoryTrend(months, "FOOD").map((p) => [p.monthStr, p.total])).toEqual([["2026-02", 20], ["2026-01", 10], ["2026-03", 0]]);
    });
    it("is all zeros for an unknown or missing category", () => {
        expect(categoryTrend([month("2026-01", [food(5)])], null)[0].total).toBe(0);
    });
});

describe("aggregateSubcategories", () => {
    const names: Record<string, string> = { groceries: "Продукты", snacks: "Перекусы" };
    const resolve = (code: string | null) => (code ? names[code.toLowerCase()] ?? null : null);
    const points = (subs: { subCategory: string | null; total: number }[]) => [{ monthStr: "2026-01", total: 100, subCategories: subs }];

    it("merges the same subcategory across months and case variants, biggest first", () => {
        const pts = [
            { monthStr: "2026-01", total: 0, subCategories: [{ subCategory: "Snacks", total: 10 }, { subCategory: "Groceries", total: 30 }] },
            { monthStr: "2026-02", total: 0, subCategories: [{ subCategory: "GROCERIES", total: 5 }] },
        ];
        const rows = aggregateSubcategories(pts, resolve, 100);
        expect(rows.map((r) => [r.name, r.total])).toEqual([["Продукты", 35], ["Перекусы", 10]]);
    });

    it("puts null, empty and missing subcategories into one 'other' row", () => {
        const rows = aggregateSubcategories(points([{ subCategory: null, total: 4 }, { subCategory: "", total: 6 }]), resolve, 10);
        expect(rows).toHaveLength(1);
        expect(rows[0]).toMatchObject({ name: "other", total: 10 });
    });

    it('uses "other" as the name when the subcategory is not in the catalogue', () => {
        expect(aggregateSubcategories(points([{ subCategory: "Zzz", total: 1 }]), resolve, 1)[0].name).toBe("other");
    });

    it("shares are relative to the denominator (0 when it is 0)", () => {
        const rows = aggregateSubcategories(points([{ subCategory: "Snacks", total: 25 }]), resolve, 100);
        expect(rows[0].share).toBe(0.25);
        expect(aggregateSubcategories(points([{ subCategory: "Snacks", total: 25 }]), resolve, 0)[0].share).toBe(0);
    });
});

describe("buildCategoryView", () => {
    const categories = [cat("Food", [["Groceries", "Продукты"], ["Snacks", "Перекусы"]]), cat("Pets")];
    const months = [
        month("2026-01", [food(100, [{ subCategory: "Groceries", total: 60 }, { subCategory: "Snacks", total: 40 }])]),
        month("2026-02", [food(50, [{ subCategory: "Groceries", total: 50 }])]),
    ];

    it("without a month: the whole period", () => {
        const v = buildCategoryView(months, categories, { categoryCode: null, monthStr: null });
        expect(v.activeCode).toBe("Food");
        expect(v.grandTotal).toBe(150);
        expect(v.activeTotal).toBe(150);
        expect(v.selectedIndex).toBe(-1);
        expect(v.subcategories.map((s) => [s.name, s.total])).toEqual([["Продукты", 110], ["Перекусы", 40]]);
    });

    it("with a month: the list and the total narrow to it, the grand total does not", () => {
        const v = buildCategoryView(months, categories, { categoryCode: "Food", monthStr: "2026-02" });
        expect(v.grandTotal).toBe(150);
        expect(v.activeTotal).toBe(50);
        expect(v.selectedIndex).toBe(1);
        expect(v.subcategories.map((s) => [s.name, s.total, s.share])).toEqual([["Продукты", 50, 1]]);
    });

    it("a month that is not in the data selects nothing and empties the scope", () => {
        const v = buildCategoryView(months, categories, { categoryCode: "Food", monthStr: "2026-09" });
        expect(v.selectedIndex).toBe(-1);
        expect(v.activeTotal).toBe(0);
        expect(v.subcategories).toEqual([]);
    });

    it("shares are relative to the category total, not to the listed rows (documented behaviour)", () => {
        const m = [month("2026-01", [food(100, [{ subCategory: "Snacks", total: 40 }])])];
        const v = buildCategoryView(m, categories, { categoryCode: "Food", monthStr: null });
        expect(v.subcategories[0].share).toBe(0.4);
    });

    it("no data at all", () => {
        const v = buildCategoryView([], categories, { categoryCode: null, monthStr: null });
        expect(v).toMatchObject({ activeCode: "Food", grandTotal: 0, activeTotal: 0, trend: [], subcategories: [] });
    });
});

describe("toggleMonth", () => {
    it("selects, switches and clears", () => {
        expect(toggleMonth(null, "2026-01")).toBe("2026-01");
        expect(toggleMonth("2026-01", "2026-02")).toBe("2026-02");
        expect(toggleMonth("2026-02", "2026-02")).toBeNull();
    });
});
