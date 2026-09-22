import { NOT_EVERYDAY_OUTCOME_CATEGORIES, SALARY_CATEGORY_CODE, SAVINGS_CATEGORY_CODE } from "../constants/categories.ts";
import type { MonthlyAnalyticsItem } from "../services/api.ts";

// The single definition of the Total / Real / Everyday modes of the monthly analytics.
// Used by the monthly screen and by the category breakdown (donut): change a rule here, both follow.

export type MonthMode = "total" | "real" | "everyday";

export type MonthAmounts = Pick<MonthlyAnalyticsItem, "totalIncome" | "totalOutcome" | "incomeCategories" | "outcomeCategories">;

export interface Amounts {
    income: number;
    outcome: number;
}

const sum = (list: { total: number }[]): number => list.reduce((acc, c) => acc + c.total, 0);

/** Does this expense category count in the given mode? Real: all but savings. Everyday: not the "not everyday" ones. */
export const isOutcomeCounted = (categoryCode: string, mode: MonthMode): boolean => {
    if (mode === "real") return categoryCode !== SAVINGS_CATEGORY_CODE;
    if (mode === "everyday") return !NOT_EVERYDAY_OUTCOME_CATEGORIES.has(categoryCode);
    return true;
};

export const countedOutcomeCategories = <T extends { category: string }>(categories: T[], mode: MonthMode): T[] =>
    categories.filter((c) => isOutcomeCounted(c.category, mode));

/**
 * Income and expenses of one month in the given mode.
 * Total: the totals from the API. Real: income as is, expenses without savings.
 * Everyday: income is the salary only, expenses without the "not everyday" categories.
 */
export const monthValues = (m: MonthAmounts, mode: MonthMode): Amounts => {
    if (mode === "total") {
        return { income: m.totalIncome ?? 0, outcome: m.totalOutcome ?? 0 };
    }

    const outcome = sum(countedOutcomeCategories(m.outcomeCategories ?? [], mode));

    if (mode === "real") {
        return { income: m.totalIncome ?? 0, outcome };
    }

    return { income: sum((m.incomeCategories ?? []).filter((c) => c.category === SALARY_CATEGORY_CODE)), outcome };
};

/** Sums over the months, in the order given (that keeps floating-point sums identical to a plain loop). */
export const periodTotals = (months: MonthAmounts[], mode: MonthMode): Amounts & { net: number } =>
    months.reduce(
        (acc, m) => {
            const { income, outcome } = monthValues(m, mode);
            acc.income += income;
            acc.outcome += outcome;
            acc.net += income - outcome;
            return acc;
        },
        { income: 0, outcome: 0, net: 0 }
    );

/** Copy sorted by month ("2026-01" < "2026-02"). */
export const sortMonths = <T extends { month: string }>(months: T[]): T[] =>
    [...months].sort((a, b) => a.month.localeCompare(b.month));
