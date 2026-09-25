import { type FC, useMemo, useState } from "react";

import { NOT_EVERYDAY_OUTCOME_CATEGORIES, SAVINGS_CATEGORY_CODE } from "../constants/categories.ts";
import type { MonthlyAnalyticsItem } from "../services/api.ts";
import type { Category, Currency } from "../types/finance.ts";
import { getCategoryMeta } from "../utils/categoryutils.ts";
import { formatCurrencyValue } from "../utils/numberformatter.ts";
import { AnalyticsRow } from "./AnalyticsRow.tsx";
import { ListGroup } from "../shared/ui/Card.tsx";
import { DonutChart } from "./DonutChart.tsx";
import type {MonthMode} from "../utils/analyticUtils.ts";

interface ExpensesBreakdownGridProps {
    activeMonth: MonthlyAnalyticsItem;
    viewMode: MonthMode;
    outcomeCategories?: Category[];
    incomeCategories?: Category[];
    activeMonthValues: { income: number; outcome: number };
    currency: Currency;
}

export const ExpensesBreakdownGrid: FC<ExpensesBreakdownGridProps> = ({
                                                                          activeMonth,
                                                                          viewMode,
                                                                          outcomeCategories,
                                                                          activeMonthValues,
                                                                          currency,
                                                                      }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const formatAmount = (val: number) => `${formatCurrencyValue(val, 'round')} ${currency.symbol}`;

    const filteredCategories = useMemo(
        () =>
            activeMonth.outcomeCategories
                .filter((cat) => {
                    if (viewMode === "real") return cat.category !== SAVINGS_CATEGORY_CODE;
                    if (viewMode === "everyday") return !NOT_EVERYDAY_OUTCOME_CATEGORIES.has(cat.category);
                    return true;
                })
                .sort((a, b) => b.total - a.total),
        [activeMonth, viewMode]
    );

    const rows = filteredCategories.map((cat) => {
        const meta = getCategoryMeta(outcomeCategories, cat.category);
        const percent = activeMonthValues.outcome > 0 ? (cat.total / activeMonthValues.outcome) * 100 : 0;
        return { cat, meta, percent, color: meta.color || "#9E9E9E" };
    });

    const segments = rows.map((r) => ({ code: r.meta.code, percent: r.percent, color: r.color }));

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

    const donutTitle = selectedMeta ? selectedMeta.name : "Total";
    const donutAmount = selectedCat ? formatAmount(selectedCat.total) : formatAmount(activeMonthValues.outcome);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <DonutChart
                segments={segments}
                totalText={donutAmount}
                titleText={donutTitle}
                selectedCode={selectedCat?.category}
                onSelectSegment={setSelectedCategory}
                onPrevSegment={handlePrev}
                onNextSegment={handleNext}
            />

            <ListGroup>
                {rows.map((r) => (
                    <AnalyticsRow
                        key={r.cat.category}
                        name={r.meta.name}
                        icon={r.meta.icon}
                        color={r.color}
                        share={r.percent / 100}
                        total={r.cat.total}
                        currency={currency}
                        onClick={() =>
                            setSelectedCategory((prev) => (prev === r.cat.category ? null : r.cat.category))
                        }
                    />
                ))}
            </ListGroup>
        </div>
    );
};
