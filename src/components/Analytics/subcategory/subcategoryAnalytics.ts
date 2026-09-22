import type { MonthlyAnalyticsItem } from "../../../services/api.ts";
import type { Category, SubCategory } from "../../../types/finance.ts";
import { sameCode } from "../category/categoryAnalytics.ts";

// Pure logic of the "Subcategories" screen. Every function gets what it needs as parameters:
// no closure over component state, no React, no formatting for display.

export interface SubcategorySelection {
    categoryCode: string | null;
    /** The subcategory chosen for the monthly chart. Null: the biggest one. */
    subCode: string | null;
}

export interface SubcategoryRow {
    sub: SubCategory;
    total: number;
    /** Fraction of the total of all listed subcategories (0..1). */
    share: number;
}

export interface SeriesPoint {
    monthStr: string;
    total: number;
}

export interface SubcategoryView {
    /** The selected category, or the first one. */
    category: Category | null;
    rows: SubcategoryRow[];
    /** Sum of the listed subcategories. Spending without a subcategory is not in it. */
    grandTotal: number;
    activeSubCode: string | null;
    activeSub: SubCategory | null;
    /** Months, ascending. */
    sortedMonths: MonthlyAnalyticsItem[];
    /** The monthly series of the active subcategory (months with spending only). */
    series: SeriesPoint[];
}

/** Key of a subcategory in totals: lower-cased code, "other" for spending without one. */
export const subcategoryKey = (code: string | null | undefined): string => (code || "other").toLowerCase();

/** The selected category (exact code), or the first one. */
export const resolveCategory = (categories: Category[], code: string | null): Category | null =>
    categories.find((c) => c.code === code) || categories[0] || null;

export const sortMonths = (months: MonthlyAnalyticsItem[]): MonthlyAnalyticsItem[] =>
    [...months].sort((a, b) => a.month.localeCompare(b.month));

/** Totals per subcategory of one category over all months. */
export const sumSubcategoryTotals = (
    months: MonthlyAnalyticsItem[],
    categoryCode: string | null | undefined
): Map<string, number> => {
    const totals = new Map<string, number>();

    months.forEach((m) => {
        const category = m.outcomeCategories.find((c) => sameCode(c.category, categoryCode));
        category?.subCategories?.forEach((sc) => {
            const key = subcategoryKey(sc.subCategory);
            totals.set(key, (totals.get(key) || 0) + sc.total);
        });
    });

    return totals;
};

/** The catalogue of subcategories, biggest first (ties keep the catalogue order). */
export const sortSubcategoriesByTotal = (list: SubCategory[], totals: Map<string, number>): SubCategory[] => {
    const totalOf = (code: string) => totals.get(code.toLowerCase()) || 0;
    return [...list].sort((a, b) => totalOf(b.code) - totalOf(a.code));
};

export const buildRows = (
    sorted: SubCategory[],
    totals: Map<string, number>
): { rows: SubcategoryRow[]; grandTotal: number } => {
    const raw = sorted.map((sub) => ({ sub, total: totals.get(sub.code.toLowerCase()) || 0 }));
    const grandTotal = raw.reduce((sum, r) => sum + r.total, 0);
    return { grandTotal, rows: raw.map((r) => ({ ...r, share: grandTotal > 0 ? r.total / grandTotal : 0 })) };
};

/**
 * Spending of one subcategory in one month.
 * Takes the FIRST matching entry; the "Total" list sums all of them (see the test that documents this).
 */
export const subcategoryTotalInMonth = (
    month: MonthlyAnalyticsItem,
    categoryCode: string | null | undefined,
    subCode: string | null
): number => {
    if (!subCode) return 0;

    const category = month.outcomeCategories.find((c) => sameCode(c.category, categoryCode));
    const sub = category?.subCategories?.find((sc) => subcategoryKey(sc.subCategory) === subCode.toLowerCase());
    return sub?.total || 0;
};

/** The subcategory's spending per month, months ascending; months without spending are left out. */
export const subcategorySeries = (
    sortedMonths: MonthlyAnalyticsItem[],
    categoryCode: string | null | undefined,
    subCode: string | null
): SeriesPoint[] => {
    if (!subCode) return [];
    return sortedMonths
        .map((m) => ({ monthStr: m.month, total: subcategoryTotalInMonth(m, categoryCode, subCode) }))
        .filter((p) => p.total > 0);
};

/** The chosen subcategory, or the biggest one. An unknown chosen code is kept, `sub` is then null. */
export const resolveActiveSub = (
    chosenCode: string | null,
    sorted: SubCategory[]
): { code: string | null; sub: SubCategory | null } => {
    const code = chosenCode || sorted[0]?.code || null;
    return { code, sub: sorted.find((s) => s.code === code) || null };
};

export const buildSubcategoryView = (
    months: MonthlyAnalyticsItem[],
    categories: Category[],
    selection: SubcategorySelection
): SubcategoryView => {
    const category = resolveCategory(categories, selection.categoryCode);
    const totals = sumSubcategoryTotals(months, category?.code);
    const sorted = sortSubcategoriesByTotal(category?.subCategories || [], totals);
    const { rows, grandTotal } = buildRows(sorted, totals);
    const { code: activeSubCode, sub: activeSub } = resolveActiveSub(selection.subCode, sorted);
    const sortedMonths = sortMonths(months);

    return {
        category,
        rows,
        grandTotal,
        activeSubCode,
        activeSub,
        sortedMonths,
        series: subcategorySeries(sortedMonths, category?.code, activeSubCode),
    };
};
