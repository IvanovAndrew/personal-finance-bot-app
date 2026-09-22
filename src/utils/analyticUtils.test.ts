import { describe, expect, it } from "vitest";

import { NOT_EVERYDAY_OUTCOME_CATEGORIES, SALARY_CATEGORY_CODE, SAVINGS_CATEGORY_CODE } from "../constants/categories.ts";
import { countedOutcomeCategories, isOutcomeCounted, type MonthAmounts, monthValues, periodTotals, sortMonths } from "./analyticUtils.ts";

// Savings is itself one of the "not everyday" categories, so pick another member for the fixtures.
const NOT_EVERYDAY = Array.from(NOT_EVERYDAY_OUTCOME_CATEGORIES).find((c) => c !== SAVINGS_CATEGORY_CODE)!;
const cat = (category: string, total: number) => ({ category, total, subCategories: [] });
const month = (over: Partial<MonthAmounts> = {}): MonthAmounts => ({
    totalIncome: 1000,
    totalOutcome: 700,
    incomeCategories: [cat(SALARY_CATEGORY_CODE, 800), cat("Gifts", 200)],
    outcomeCategories: [cat("Food", 300), cat(SAVINGS_CATEGORY_CODE, 150), cat(NOT_EVERYDAY, 250)],
    ...over,
});

describe("isOutcomeCounted", () => {
    it("total counts everything", () => {
        for (const c of ["Food", SAVINGS_CATEGORY_CODE, NOT_EVERYDAY]) expect(isOutcomeCounted(c, "total")).toBe(true);
    });
    it("real drops savings only", () => {
        expect(isOutcomeCounted(SAVINGS_CATEGORY_CODE, "real")).toBe(false);
        expect(isOutcomeCounted(NOT_EVERYDAY, "real")).toBe(true);
    });
    it("everyday drops the 'not everyday' categories, savings included", () => {
        expect(isOutcomeCounted(SAVINGS_CATEGORY_CODE, "everyday")).toBe(false);
        expect(isOutcomeCounted(NOT_EVERYDAY, "everyday")).toBe(false);
        expect(isOutcomeCounted("Food", "everyday")).toBe(true);
    });
});

describe("countedOutcomeCategories", () => {
    it("filters by mode, keeps the objects, does not change the input", () => {
        const input = month().outcomeCategories;
        const real = countedOutcomeCategories(input, "real");
        expect(real.map((c) => c.category)).toEqual(["Food", NOT_EVERYDAY]);
        expect(real[0]).toBe(input[0]);
        expect(input).toHaveLength(3);
    });
});

describe("monthValues", () => {
    it("total: the totals from the API, whatever the categories say", () => {
        expect(monthValues(month(), "total")).toEqual({ income: 1000, outcome: 700 });
    });
    it("real: income as is, expenses without savings", () => {
        expect(monthValues(month(), "real")).toEqual({ income: 1000, outcome: 300 + 250 });
    });
    it("everyday: salary only as income, expenses without the 'not everyday' ones", () => {
        expect(monthValues(month(), "everyday")).toEqual({ income: 800, outcome: 300 });
    });
    it("copes with missing totals and categories", () => {
        const bare = { totalIncome: undefined, totalOutcome: undefined, incomeCategories: undefined, outcomeCategories: undefined } as unknown as MonthAmounts;
        for (const mode of ["total", "real", "everyday"] as const) expect(monthValues(bare, mode)).toEqual({ income: 0, outcome: 0 });
    });
});

describe("periodTotals", () => {
    it("adds up months and the net", () => {
        const t = periodTotals([month(), month({ totalIncome: 500 })], "real");
        expect(t).toEqual({ income: 1500, outcome: 1100, net: 400 });
    });
    it("is zero for no months", () => {
        expect(periodTotals([], "total")).toEqual({ income: 0, outcome: 0, net: 0 });
    });
});

describe("sortMonths", () => {
    it("sorts a copy ascending", () => {
        const input = [{ month: "2026-03" }, { month: "2026-01" }, { month: "2026-02" }];
        expect(sortMonths(input).map((m) => m.month)).toEqual(["2026-01", "2026-02", "2026-03"]);
        expect(input[0].month).toBe("2026-03");
    });
});
