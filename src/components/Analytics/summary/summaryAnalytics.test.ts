import { describe, expect, it } from "vitest";

import type { FutureExpense } from "../../../services/api.ts";
import type { Category } from "../../../types/finance.ts";
import { buildFutureExpenseRows, describeCategory, resolveExpenseAvatar } from "./summaryAnalytics.ts";

const cat = (code: string, name: string, subs: [string, string][] = []): Category =>
    ({ code, name, icon: "🍎", color: "#ABCDEF", isPopular: true, subCategories: subs.map(([c, n]) => ({ code: c, name: n })) }) as unknown as Category;

const categories = [cat("Food", "Еда", [["Groceries", "Продукты"]]), cat("Netflix", "Подписки")];
const currency = { name: "AMD", symbol: "֏", format: "C0", isPopular: true };
const exp = (over: Partial<FutureExpense> = {}): FutureExpense => ({ name: "Netflix", category: "Netflix", amount: 999, currency: "AMD", ...over });

describe("describeCategory", () => {
    it("is just the category name without a subcategory", () => {
        expect(describeCategory(categories, exp({ category: "Netflix" }))).toBe("Подписки");
    });
    it("appends a known subcategory", () => {
        expect(describeCategory(categories, exp({ category: "Food", subCategory: "Groceries" }))).toBe("Еда · Продукты");
    });
    it("falls back to a generic label for an unknown category", () => {
        expect(describeCategory(categories, exp({ category: "Missing" }))).not.toBe("");
    });
});

describe("resolveExpenseAvatar", () => {
    it("uses a shop avatar for a known shop, e.g. Yerevan City", () => {
        expect(resolveExpenseAvatar(categories, exp({ shop: "Yerevan City" }))).toEqual({ kind: "shop", name: "Yerevan City" });
    });
    it("falls back to the category avatar for an unknown shop or no shop", () => {
        expect(resolveExpenseAvatar(categories, exp({ category: "Food", shop: "Some Random Shop Name" }))).toEqual({ kind: "category", name: "Еда", color: "#ABCDEF", icon: "🍎" });
        expect(resolveExpenseAvatar(categories, exp({ category: "Food" }))).toEqual({ kind: "category", name: "Еда", color: "#ABCDEF", icon: "🍎" });
    });
});

describe("buildFutureExpenseRows", () => {
    it("negates the amount (a future expense reduces the balance) and keeps the order", () => {
        const rows = buildFutureExpenseRows(categories, [exp({ name: "A", amount: 100 }), exp({ name: "B", amount: 50 })], currency);
        expect(rows.map((r) => [r.title, r.amount])).toEqual([["A", -100], ["B", -50]]);
        expect(rows.map((r) => r.key)).toEqual([0, 1]);
    });
    it("is empty for no expenses", () => {
        expect(buildFutureExpenseRows(categories, [], currency)).toEqual([]);
    });
});
