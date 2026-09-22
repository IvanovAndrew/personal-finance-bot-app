import type { MonthlyAnalyticsItem } from "../../../services/api.ts";
import type { Category } from "../../../types/finance.ts";
import { getSubCategoryName } from "../../../utils/categoryutils.ts";

// Pure logic of the "Categories" screen: what to show for the chosen category and month.
// No React, no formatting for display. The component only picks colours, labels and layout.

type OutcomeCategory = MonthlyAnalyticsItem["outcomeCategories"][number];
type SubTotal = NonNullable<OutcomeCategory["subCategories"]>[number];

export interface TrendPoint {
    monthStr: string;
    total: number;
    subCategories: SubTotal[];
}

export interface SubcategoryRow {
    /** null for spending without a subcategory. */
    code: string | null;
    name: string;
    total: number;
    /** Fraction of the denominator passed to buildCategoryView (0..1). */
    share: number;
}

export interface CategorySelection {
    categoryCode: string | null;
    monthStr: string | null;
}

export interface CategoryView {
    /** Categories that have data (all of them when none has). */
    availableCategories: Category[];
    activeCode: string | null;
    /** One point per month, in the order of the input. */
    trend: TrendPoint[];
    /** Total of the category over the whole period. */
    grandTotal: number;
    /** Index of the selected month in `trend`, -1 when no month is selected. */
    selectedIndex: number;
    /** Total of the category over the selected month, or over the whole period. */
    activeTotal: number;
    /** Subcategories of the active scope, biggest first. */
    subcategories: SubcategoryRow[];
}

/** Category codes are compared case-insensitively everywhere. */
export const sameCode = (a: string | null | undefined, b: string | null | undefined): boolean =>
    a != null && b != null && a.toLowerCase() === b.toLowerCase();

export const uniqueOutcomeCodes = (months: MonthlyAnalyticsItem[]): string[] =>
    Array.from(new Set(months.flatMap((m) => m.outcomeCategories.map((c) => c.category))));

export const categoriesWithData = (categories: Category[], codes: string[]): Category[] => {
    const matching = categories.filter((c) => codes.some((code) => sameCode(code, c.code)));
    return matching.length > 0 ? matching : categories;
};

export const resolveActiveCode = (selected: string | null, available: Category[], codes: string[]): string | null =>
    selected || available[0]?.code || codes[0] || null;

export const categoryTrend = (months: MonthlyAnalyticsItem[], code: string | null): TrendPoint[] =>
    months.map((m) => {
        const category = m.outcomeCategories.find((c) => sameCode(c.category, code));
        return { monthStr: m.month, total: category?.total || 0, subCategories: category?.subCategories || [] };
    });

export const sumTotals = (points: TrendPoint[]): number => points.reduce((acc, p) => acc + p.total, 0);

/** Sums subcategories over the given months. Spending without a subcategory is one "other" row. */
export const aggregateSubcategories = (
    points: TrendPoint[],
    resolveName: (subCode: string | null) => string | null,
    denominator: number
): SubcategoryRow[] => {
    const rows = new Map<string, Omit<SubcategoryRow, "share">>();

    points.forEach((p) =>
        p.subCategories.forEach((sc) => {
            const code = sc.subCategory;
            const key = code ? code.toLowerCase() : "other";
            const current = rows.get(key) || { code, name: resolveName(code) ?? "other", total: 0 };
            rows.set(key, { ...current, total: current.total + sc.total });
        })
    );

    return Array.from(rows.values())
        .sort((a, b) => b.total - a.total)
        .map((r) => ({ ...r, share: denominator > 0 ? r.total / denominator : 0 }));
};

/** Tapping the selected month clears the selection, tapping another month selects it. */
export const toggleMonth = (current: string | null, clicked: string): string | null => (current === clicked ? null : clicked);

export const buildCategoryView = (
    months: MonthlyAnalyticsItem[],
    categories: Category[],
    selection: CategorySelection
): CategoryView => {
    const codes = uniqueOutcomeCodes(months);
    const availableCategories = categoriesWithData(categories, codes);
    const activeCode = resolveActiveCode(selection.categoryCode, availableCategories, codes);

    const trend = categoryTrend(months, activeCode);
    const scope = selection.monthStr ? trend.filter((p) => p.monthStr === selection.monthStr) : trend;
    const activeTotal = sumTotals(scope);

    return {
        availableCategories,
        activeCode,
        trend,
        grandTotal: sumTotals(trend),
        selectedIndex: selection.monthStr ? trend.findIndex((p) => p.monthStr === selection.monthStr) : -1,
        activeTotal,
        subcategories: aggregateSubcategories(scope, (sub) => getSubCategoryName(categories, activeCode, sub), activeTotal),
    };
};
