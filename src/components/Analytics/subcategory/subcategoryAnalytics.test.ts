import { describe, expect, it } from "vitest";

import type { MonthlyAnalyticsItem } from "../../../services/api.ts";
import type { Category, SubCategory } from "../../../types/finance.ts";
import {
    buildRows,
    buildSubcategoryView,
    resolveActiveSub,
    resolveCategory,
    sortMonths,
    sortSubcategoriesByTotal,
    subcategoryKey,
    subcategorySeries,
    subcategoryTotalInMonth,
    sumSubcategoryTotals,
} from "./subcategoryAnalytics.ts";

const sub = (code: string, name = code): SubCategory => ({ code, name }) as SubCategory;
const cat = (code: string, subs: SubCategory[] = []): Category =>
    ({ code, name: code, icon: "", color: "", isPopular: true, subCategories: subs }) as unknown as Category;
type Entry = { subCategory: string | null; total: number };
const month = (m: string, category: string, subs: Entry[]): MonthlyAnalyticsItem =>
    ({
        month: m, total: 0, totalOutcome: 0, realOutcomeTotal: 0, totalIncome: 0, incomeCategories: [],
        outcomeCategories: [{ category, total: subs.reduce((s, e) => s + e.total, 0), subCategories: subs }],
    }) as MonthlyAnalyticsItem;

describe("subcategoryKey", () => {
    it("lower-cases, and maps null and empty to 'other'", () => {
        expect(subcategoryKey("Groceries")).toBe("groceries");
        expect(subcategoryKey(null)).toBe("other");
        expect(subcategoryKey("")).toBe("other");
        expect(subcategoryKey(undefined)).toBe("other");
    });
});

describe("resolveCategory", () => {
    const list = [cat("Food"), cat("Pets")];
    it("finds by exact code, falls back to the first, null when empty", () => {
        expect(resolveCategory(list, "Pets")?.code).toBe("Pets");
        expect(resolveCategory(list, "Nope")?.code).toBe("Food");
        expect(resolveCategory(list, null)?.code).toBe("Food");
        expect(resolveCategory([], "Food")).toBeNull();
    });
});

describe("sumSubcategoryTotals", () => {
    it("sums over months, ignoring case; no subcategory goes to 'other'", () => {
        const months = [
            month("2026-01", "Food", [{ subCategory: "Groceries", total: 10 }, { subCategory: null, total: 1 }]),
            month("2026-02", "food", [{ subCategory: "GROCERIES", total: 5 }, { subCategory: "", total: 2 }]),
        ];
        expect(Object.fromEntries(sumSubcategoryTotals(months, "FOOD"))).toEqual({ groceries: 15, other: 3 });
    });

    it("ignores other categories and is empty for an unknown or missing category", () => {
        const months = [month("2026-01", "Pets", [{ subCategory: "Vet", total: 9 }])];
        expect(sumSubcategoryTotals(months, "Food").size).toBe(0);
        expect(sumSubcategoryTotals(months, null).size).toBe(0);
        expect(sumSubcategoryTotals(months, undefined).size).toBe(0);
    });
});

describe("sortSubcategoriesByTotal", () => {
    const totals = new Map([["snacks", 40], ["groceries", 110], ["fruit", 40]]);
    it("puts the biggest first, keeps the catalogue order for ties, treats unknown as 0", () => {
        const list = [sub("Snacks"), sub("Zzz"), sub("Fruit"), sub("Groceries")];
        expect(sortSubcategoriesByTotal(list, totals).map((s) => s.code)).toEqual(["Groceries", "Snacks", "Fruit", "Zzz"]);
    });
    it("does not change its input", () => {
        const list = [sub("Snacks"), sub("Groceries")];
        sortSubcategoriesByTotal(list, totals);
        expect(list.map((s) => s.code)).toEqual(["Snacks", "Groceries"]);
    });
});

describe("buildRows", () => {
    it("shares are relative to the sum of the listed subcategories, so they add up to 1", () => {
        const { rows, grandTotal } = buildRows([sub("A"), sub("B")], new Map([["a", 30], ["b", 10], ["other", 60]]));
        expect(grandTotal).toBe(40);
        expect(rows.map((r) => r.share)).toEqual([0.75, 0.25]);
    });
    it("spending without a subcategory is not in the catalogue, so not in the total", () => {
        expect(buildRows([sub("A")], new Map([["other", 100]])).grandTotal).toBe(0);
    });
    it("no spending: zero shares", () => {
        expect(buildRows([sub("A")], new Map()).rows[0].share).toBe(0);
    });
});

describe("subcategoryTotalInMonth", () => {
    const m = month("2026-01", "Food", [{ subCategory: "Groceries", total: 10 }, { subCategory: null, total: 4 }]);
    it("finds the subcategory case-insensitively, 'other' for none", () => {
        expect(subcategoryTotalInMonth(m, "food", "GROCERIES")).toBe(10);
        expect(subcategoryTotalInMonth(m, "Food", "other")).toBe(4);
    });
    it("is 0 without a subcategory code, for another category, or when absent", () => {
        expect(subcategoryTotalInMonth(m, "Food", null)).toBe(0);
        expect(subcategoryTotalInMonth(m, "Pets", "Groceries")).toBe(0);
        expect(subcategoryTotalInMonth(m, "Food", "Vet")).toBe(0);
    });
    it("DOCUMENTED INCONSISTENCY: with two entries of one subcategory it takes the first, while the Total list sums them", () => {
        const dup = month("2026-01", "Food", [{ subCategory: "Groceries", total: 10 }, { subCategory: "groceries", total: 5 }]);
        expect(subcategoryTotalInMonth(dup, "Food", "Groceries")).toBe(10);
        expect(sumSubcategoryTotals([dup], "Food").get("groceries")).toBe(15);
    });
});

describe("subcategorySeries", () => {
    const months = sortMonths([
        month("2026-03", "Food", [{ subCategory: "Snacks", total: 7 }]),
        month("2026-01", "Food", [{ subCategory: "Snacks", total: 3 }]),
        month("2026-02", "Food", [{ subCategory: "Groceries", total: 9 }]),
    ]);
    it("is ascending and leaves out months without spending (the chart has gaps)", () => {
        expect(subcategorySeries(months, "Food", "Snacks")).toEqual([{ monthStr: "2026-01", total: 3 }, { monthStr: "2026-03", total: 7 }]);
    });
    it("is empty without a subcategory", () => {
        expect(subcategorySeries(months, "Food", null)).toEqual([]);
    });
});

describe("resolveActiveSub", () => {
    const sorted = [sub("A"), sub("B")];
    it("uses the chosen one, else the biggest, else nothing", () => {
        expect(resolveActiveSub("B", sorted)).toEqual({ code: "B", sub: sorted[1] });
        expect(resolveActiveSub(null, sorted)).toEqual({ code: "A", sub: sorted[0] });
        expect(resolveActiveSub(null, [])).toEqual({ code: null, sub: null });
    });
    it("keeps an unknown chosen code, with no subcategory object", () => {
        expect(resolveActiveSub("Zzz", sorted)).toEqual({ code: "Zzz", sub: null });
    });
});

describe("buildSubcategoryView", () => {
    const categories = [cat("Food", [sub("Groceries", "Продукты"), sub("Snacks", "Перекусы")]), cat("Pets", [sub("Vet")])];
    const months = [
        month("2026-02", "Food", [{ subCategory: "Groceries", total: 50 }]),
        month("2026-01", "Food", [{ subCategory: "Groceries", total: 60 }, { subCategory: "Snacks", total: 40 }]),
    ];

    it("picks the first category and its biggest subcategory by default", () => {
        const v = buildSubcategoryView(months, categories, { categoryCode: null, subCode: null });
        expect(v.category?.code).toBe("Food");
        expect(v.rows.map((r) => [r.sub.code, r.total])).toEqual([["Groceries", 110], ["Snacks", 40]]);
        expect(v.grandTotal).toBe(150);
        expect(v.activeSubCode).toBe("Groceries");
        expect(v.sortedMonths.map((m) => m.month)).toEqual(["2026-01", "2026-02"]);
        expect(v.series).toEqual([{ monthStr: "2026-01", total: 60 }, { monthStr: "2026-02", total: 50 }]);
    });

    it("follows the chosen category and subcategory", () => {
        const v = buildSubcategoryView(months, categories, { categoryCode: "Food", subCode: "Snacks" });
        expect(v.activeSub?.code).toBe("Snacks");
        expect(v.series).toEqual([{ monthStr: "2026-01", total: 40 }]);
    });

    it("no data: rows with zeros, empty series", () => {
        const v = buildSubcategoryView([], categories, { categoryCode: "Pets", subCode: null });
        expect(v.rows.map((r) => r.total)).toEqual([0]);
        expect(v.series).toEqual([]);
    });

    it("no categories at all", () => {
        const v = buildSubcategoryView(months, [], { categoryCode: null, subCode: null });
        expect(v).toMatchObject({ category: null, rows: [], grandTotal: 0, activeSubCode: null, series: [] });
    });
});
