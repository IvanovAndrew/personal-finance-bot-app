import { type FC, useMemo, useState } from "react";

import { theme } from "../../App.styles.ts";
import { SUBCATEGORY_PALETTE } from "../../constants/palette.ts";
import { terms } from "../../constants/strings.ts";
import type { MonthlyAnalyticsResponse } from "../../services/api.ts";
import type { Category, Currency } from "../../types/finance.ts";
import { getCategoryMeta, getSubCategoryName } from "../../utils/categoryutils.ts";
import { formatDateMMMMYYYY, formatMonth } from "../../utils/dateformatter.ts";
import { parseMonthString } from "../../utils/dateparser.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import { formatPeriod } from "../../utils/period.ts";
import { AnalyticsRow } from "../AnalyticsRow.tsx";
import { Card, ListGroup } from "../Card.tsx";
import { CategorySwitcherModal } from "../CategorySwitcherModal.tsx";
import { ChartComponent, type ChartDataItem } from "../ChartComponent.tsx";
import { HeroNumber } from "../HeroNumber.tsx";
import { LoadingData } from "../LoadingData.tsx";
import { NoAvailableData } from "../NoAvailableData.tsx";
import { ShareBar } from "../ShareBar.tsx";

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

    const allUniqueCategoryCodes = useMemo(
        () => Array.from(new Set((monthlyData?.months || []).flatMap((m) => m.outcomeCategories.map((c) => c.category)))),
        [monthlyData]
    );

    const availableCategories = useMemo(() => {
        const matching = categories.filter((c) =>
            allUniqueCategoryCodes.some((code) => code.toLowerCase() === c.code.toLowerCase())
        );
        return matching.length > 0 ? matching : categories;
    }, [categories, allUniqueCategoryCodes]);

    const activeCode = selectedCategoryCode || availableCategories[0]?.code || allUniqueCategoryCodes[0] || null;
    const activeMeta = activeCode ? getCategoryMeta(categories, activeCode) : null;

    const categoryMonthlyTrend = useMemo(() => {
        if (!monthlyData?.months) return [];
        return monthlyData.months.map((m) => {
            const catData = m.outcomeCategories.find((c) => c.category.toLowerCase() === activeCode?.toLowerCase());
            return {
                monthStr: m.month,
                total: catData?.total || 0,
                subCategories: catData?.subCategories || [],
            };
        });
    }, [monthlyData, activeCode]);

    const chartData = useMemo<ChartDataItem[]>(() => {
        return categoryMonthlyTrend.map((m) => {
            const date = parseMonthString(m.monthStr);
            return {
                id: m.monthStr,
                label: formatMonth(date),
                subLabel: date.getFullYear().toString(),
                fullName: formatDateMMMMYYYY(date),
                value1: m.total,
            };
        });
    }, [categoryMonthlyTrend]);

    // Index of the highlighted bar (-1 when no month filter is applied)
    const selectedChartIndex = useMemo(() => {
        if (!selectedMonthStr) return -1;
        return categoryMonthlyTrend.findIndex((m) => m.monthStr === selectedMonthStr);
    }, [categoryMonthlyTrend, selectedMonthStr]);

    const periodLabel = useMemo(() => formatPeriod(categoryMonthlyTrend.map((m) => m.monthStr)), [categoryMonthlyTrend]);

    const categoryGrandTotal = categoryMonthlyTrend.reduce((acc, curr) => acc + curr.total, 0);

    const targetMonthsForSubcategories = useMemo(
        () => (selectedMonthStr ? categoryMonthlyTrend.filter((m) => m.monthStr === selectedMonthStr) : categoryMonthlyTrend),
        [categoryMonthlyTrend, selectedMonthStr]
    );

    const activeTotal = targetMonthsForSubcategories.reduce((acc, curr) => acc + curr.total, 0);

    const subCategoryList = useMemo(() => {
        const totals = new Map<string, { code: string | null; name: string; total: number }>();

        targetMonthsForSubcategories.forEach((m) => {
            m.subCategories.forEach((sc) => {
                const rawCode = sc.subCategory;
                const key = rawCode ? rawCode.toLowerCase() : "other";
                const displayName = getSubCategoryName(categories, activeCode, rawCode) ?? "other";

                const current = totals.get(key) || { code: rawCode, name: displayName, total: 0 };
                totals.set(key, { ...current, total: current.total + sc.total });
            });
        });

        return Array.from(totals.values())
            .sort((a, b) => b.total - a.total)
            .map((sc, i) => ({
                ...sc,
                color: SUBCATEGORY_PALETTE[i % SUBCATEGORY_PALETTE.length],
                share: activeTotal > 0 ? sc.total / activeTotal : 0,
            }));
    }, [targetMonthsForSubcategories, categories, activeCode, activeTotal]);

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
                heroValue={selectedMonthStr ? activeTotal : categoryGrandTotal}
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
                            selectedIndex={selectedChartIndex}
                            showDualBar={false}
                            formatAmount={(val) => `${formatCurrencyValue(val, currency.format)} ${currency.symbol}`}
                            onSelect={(index) => {
                                const clickedMonth = categoryMonthlyTrend[index]?.monthStr;
                                if (clickedMonth) {
                                    // Tapping the selected bar clears the filter, tapping another one selects it
                                    setSelectedMonthStr((prev) => (prev === clickedMonth ? null : clickedMonth));
                                }
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
