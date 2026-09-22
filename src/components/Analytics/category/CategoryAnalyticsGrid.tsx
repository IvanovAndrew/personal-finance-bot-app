import { type FC, useMemo, useState } from "react";

import { theme } from "../../../App.styles.ts";
import { SUBCATEGORY_PALETTE } from "../../../constants/palette.ts";
import { terms } from "../../../constants/strings.ts";
import type { MonthlyAnalyticsResponse } from "../../../services/api.ts";
import type { Category, Currency } from "../../../types/finance.ts";
import { getCategoryMeta } from "../../../utils/categoryutils.ts";
import { formatDateMMMMYYYY, formatMonth } from "../../../utils/dateformatter.ts";
import { parseMonthString } from "../../../utils/dateparser.ts";
import { formatCurrencyValue } from "../../../utils/numberformatter.ts";
import { formatPeriod } from "../../../utils/period.ts";
import { buildCategoryView, toggleMonth } from "./categoryAnalytics.ts";
import { AnalyticsRow } from "../../AnalyticsRow.tsx";
import { Card, ListGroup } from "../../../shared/ui/Card.tsx";
import { CategorySwitcherModal } from "../../CategorySwitcherModal.tsx";
import { ChartComponent, type ChartDataItem } from "../../ChartComponent.tsx";
import { HeroNumber } from "../../HeroNumber.tsx";
import { LoadingData } from "../../../shared/ui/LoadingData.tsx";
import { NoAvailableData } from "../../../shared/ui/NoAvailableData.tsx";
import { ShareBar } from "../../ShareBar.tsx";

interface CategoryAnalyticsGridProps {
    categories: Category[];
    startMonth: Date;
    currency: Currency;
    monthlyData: MonthlyAnalyticsResponse | null;
    isLoading: boolean;
}

export const CategoryAnalyticsGrid: FC<CategoryAnalyticsGridProps> = ({
                                                                          categories,
                                                                          currency,
                                                                          monthlyData,
                                                                          isLoading,
                                                                      }) => {
    const [selectedCategoryCode, setSelectedCategoryCode] = useState<string | null>(null);
    const [selectedMonthStr, setSelectedMonthStr] = useState<string | null>(null);

    const view = useMemo(
        () =>
            buildCategoryView(monthlyData?.months ?? [], categories, {
                categoryCode: selectedCategoryCode,
                monthStr: selectedMonthStr,
            }),
        [monthlyData, categories, selectedCategoryCode, selectedMonthStr]
    );
    const { availableCategories, activeCode, trend, grandTotal, selectedIndex, activeTotal } = view;

    const activeMeta = activeCode ? getCategoryMeta(categories, activeCode) : null;

    // View concerns: labels for the chart and a colour per row.
    const chartData = useMemo<ChartDataItem[]>(
        () =>
            trend.map((p) => {
                const date = parseMonthString(p.monthStr);
                return {
                    id: p.monthStr,
                    label: formatMonth(date),
                    subLabel: date.getFullYear().toString(),
                    fullName: formatDateMMMMYYYY(date),
                    value1: p.total,
                };
            }),
        [trend]
    );

    const subCategoryList = useMemo(
        () => view.subcategories.map((sc, i) => ({ ...sc, color: SUBCATEGORY_PALETTE[i % SUBCATEGORY_PALETTE.length] })),
        [view.subcategories]
    );

    const periodLabel = useMemo(() => formatPeriod(trend.map((p) => p.monthStr)), [trend]);

    if (isLoading) {
        return <LoadingData text={"Loading data..."} />;
    }

    if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
        return <NoAvailableData />;
    }

    const selectedMonthDate = selectedMonthStr ? parseMonthString(selectedMonthStr) : null;
    const scopeLabel = selectedMonthDate ? formatDateMMMMYYYY(selectedMonthDate) : periodLabel;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <CategorySwitcherModal
                variant="chip"
                categories={categories}
                availableCategories={availableCategories}
                selectedCategoryCode={activeCode}
                enableSubCategorySelection={false}
                onSelectCategory={(code) => {
                    setSelectedCategoryCode(code);
                    setSelectedMonthStr(null);
                }}
            />

            <HeroNumber
                heroLabel={`${terms.expenses} · ${scopeLabel}`}
                heroValue={selectedMonthStr ? activeTotal : grandTotal}
                currency={currency}
            />

            {activeMeta && (
                <>
                    <Card padding={12}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                minHeight: 24,
                                padding: "0 4px",
                            }}
                        >
                            <span style={{ fontSize: 15, fontWeight: 600, color: theme.colors.textPrimary }}>
                                {terms.monthlyTrend}
                            </span>
                            {selectedMonthStr && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedMonthStr(null)}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        color: theme.colors.primary,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        padding: 0,
                                    }}
                                >
                                    {terms.reset}
                                </button>
                            )}
                        </div>

                        <ChartComponent
                            data={chartData}
                            selectedIndex={selectedIndex}
                            showDualBar={false}
                            formatAmount={(val) => `${formatCurrencyValue(val, currency.format)} ${currency.symbol}`}
                            onSelect={(index) => {
                                const clickedMonth = trend[index]?.monthStr;
                                if (clickedMonth) setSelectedMonthStr((prev) => toggleMonth(prev, clickedMonth));
                            }}
                        />
                    </Card>

                    {subCategoryList.length > 0 && (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    justifyContent: "space-between",
                                    padding: "0 4px",
                                }}
                            >
                                <span style={{ fontSize: 15, fontWeight: 600, color: theme.colors.textPrimary }}>
                                    {terms.subcategories}
                                </span>
                                <span style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                                    {selectedMonthDate ? formatDateMMMMYYYY(selectedMonthDate) : terms.allMonths}
                                </span>
                            </div>

                            <ShareBar items={subCategoryList.map((sc) => ({ id: sc.code || "other", total: sc.total, color: sc.color }))} />

                            <ListGroup>
                                {subCategoryList.map((sc) => (
                                    <AnalyticsRow
                                        key={sc.code || "other"}
                                        name={sc.name}
                                        color={sc.color}
                                        share={sc.share}
                                        total={sc.total}
                                        currency={currency}
                                    />
                                ))}
                            </ListGroup>
                        </>
                    )}
                </>
            )}
        </div>
    );
};
