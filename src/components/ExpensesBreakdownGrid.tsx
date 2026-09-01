import {type FC, useCallback, useState} from "react";
import type {MonthAnalyticsView} from "./Analytics/MonthAnalyticsGrid.tsx";
import {NOT_EVERYDAY_OUTCOME_CATEGORIES, SAVINGS_CATEGORY_CODE} from "../constants/categories.ts";
import type {MonthlyAnalyticsItem} from "../services/api.ts";
import type {Category, Currency} from "../types/finance.ts";
import {getCategoryMeta} from "../utils/categoryutils.ts";
import {formatCurrencyValue} from "../utils/numberformatter.ts";
import {DonutChart} from "./DonutChart.tsx";

interface ExpensesBreakdownGridProps {
    activeMonth: MonthlyAnalyticsItem;
    viewMode: MonthAnalyticsView;
    outcomeCategories?: Category[];
    incomeCategories?: Category[];
    activeMonthValues: {income: number, outcome: number};
    currency: Currency;
}

export const ExpensesBreakdownGrid: FC<ExpensesBreakdownGridProps>  = ({activeMonth, viewMode, outcomeCategories, activeMonthValues, currency}) => {

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    
    const formatAmount = useCallback(
        (val: number) => `${formatCurrencyValue(val)} ${currency.symbol}`,
        [currency.symbol]
    );

    const filteredCategories = activeMonth.outcomeCategories
        .filter((cat) => {
            if (viewMode === 'real') return cat.category !== SAVINGS_CATEGORY_CODE;
            if (viewMode === 'everyday') return !NOT_EVERYDAY_OUTCOME_CATEGORIES.has(cat.category);
            return true;
        })
        .sort((a, b) => b.total - a.total);

    const segments = filteredCategories.map((cat) => {
        
        const meta = getCategoryMeta(outcomeCategories, cat.category);
        const percent = activeMonthValues.outcome > 0 ? (cat.total / activeMonthValues.outcome) * 100 : 0;

        return {
            code: meta.code,
            percent,
            color: meta.color || '#9E9E9E'
        };
    });

    const handlePrev = () => {
        if (filteredCategories.length === 0) return;
        const currentIndex = filteredCategories.findIndex((c) => c.category === selectedCategory);

        if (currentIndex === -1 || currentIndex === 0) {
            setSelectedCategory(filteredCategories[filteredCategories.length - 1].category);
        } else {
            setSelectedCategory(filteredCategories[currentIndex - 1].category);
        }
    };

    const handleNext = () => {
        if (filteredCategories.length === 0) return;
        const currentIndex = filteredCategories.findIndex((c) => c.category === selectedCategory);

        if (currentIndex === -1 || currentIndex === filteredCategories.length - 1) {
            setSelectedCategory(filteredCategories[0].category);
        } else {
            setSelectedCategory(filteredCategories[currentIndex + 1].category);
        }
    };

    const selectedCat = filteredCategories.find((cat) => cat.category === selectedCategory);
    const selectedMeta = selectedCat ? getCategoryMeta(outcomeCategories, selectedCat.category) : null;

    const donutTitle = selectedMeta ? selectedMeta.name : 'Total';

    const donutAmount = selectedCat
        ? formatAmount(selectedCat.total)
        : formatAmount(activeMonthValues.outcome);

    return <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '20px 0' }}>
        <DonutChart 
            segments={segments} 
            totalText={donutAmount} 
            titleText={donutTitle} 
            selectedCode={selectedCat?.category} 
            onSelectSegment={setSelectedCategory}
            onPrevSegment={handlePrev}
            onNextSegment={handleNext}
        />
    </div>;
}