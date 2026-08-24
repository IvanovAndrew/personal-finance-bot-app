import { NOT_EVERYDAY_OUTCOME_CATEGORIES, SALARY_CATEGORY_CODE } from '../constants/categories';
import type { MonthlyAnalyticsItem, CategoryAnalytics } from '../services/api';

export function getEverydayOutcomeTotal(categories: CategoryAnalytics[]): number {
    return categories
        .filter(cat => !NOT_EVERYDAY_OUTCOME_CATEGORIES.has(cat.category))
        .reduce((sum, cat) => sum + cat.total, 0);
}

export function getEverydayIncomeTotal(categories: CategoryAnalytics[]): number {
    return categories
        .filter(cat => cat.category === SALARY_CATEGORY_CODE)
        .reduce((sum, cat) => sum + cat.total, 0);
}

export function getProcessedMonthData(item: MonthlyAnalyticsItem, isRealMode: boolean) {
    if (!isRealMode) {
        return {
            income: item.totalIncome,
            outcome: item.totalOutcome,
            cashFlow: item.totalIncome - item.totalOutcome,
        };
    }

    const income = getEverydayIncomeTotal(item.incomeCategories);
    const outcome = getEverydayOutcomeTotal(item.outcomeCategories);

    return {
        income,
        outcome,
        cashFlow: income - outcome,
    };
}