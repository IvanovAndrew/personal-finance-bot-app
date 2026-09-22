import type { MonthlyAnalyticsItem } from "../../../services/api.ts";
import { type Amounts, type MonthMode, monthValues, periodTotals, sortMonths } from "../../../utils/analyticUtils.ts";

// Selectors of the monthly screen. No React, no formatting for display.

export interface MonthPoint extends Amounts {
    monthStr: string;
}

export interface MonthView {
    /** Months, ascending. */
    sortedMonths: MonthlyAnalyticsItem[];
    /** Over the whole period. */
    totals: Amounts & { net: number };
    /** One point per month, ascending: what the chart draws. */
    points: MonthPoint[];
    /** Index of the month in the details card: the selected one, or the latest. -1 when there are no months. */
    activeIndex: number;
    activeMonth: MonthlyAnalyticsItem | undefined;
    activeValues: Amounts;
}

/** Index of the selected month in `sortedMonths`. No selection (null), or a month that is not there: the latest. */
export const resolveActiveIndex = (sortedMonths: { month: string }[], selectedMonth: string | null): number => {
    const index = selectedMonth ? sortedMonths.findIndex((m) => m.month === selectedMonth) : -1;
    return index >= 0 ? index : sortedMonths.length - 1;
};

/** The month `delta` steps away from the active one, stopping at both ends. */
export const shiftMonth = (sortedMonths: { month: string }[], selectedMonth: string | null, delta: number): string | null => {
    if (sortedMonths.length === 0) return null;
    const target = Math.min(Math.max(resolveActiveIndex(sortedMonths, selectedMonth) + delta, 0), sortedMonths.length - 1);
    return sortedMonths[target].month;
};

export const buildMonthView = (months: MonthlyAnalyticsItem[], mode: MonthMode, selectedMonth: string | null): MonthView => {
    const sortedMonths = sortMonths(months);
    const activeIndex = resolveActiveIndex(sortedMonths, selectedMonth);
    const activeMonth = sortedMonths[activeIndex];

    return {
        sortedMonths,
        totals: periodTotals(months, mode),
        points: sortedMonths.map((m) => ({ monthStr: m.month, ...monthValues(m, mode) })),
        activeIndex,
        activeMonth,
        activeValues: activeMonth ? monthValues(activeMonth, mode) : { income: 0, outcome: 0 },
    };
};
