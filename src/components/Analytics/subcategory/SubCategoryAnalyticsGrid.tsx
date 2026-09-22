import { type FC, useCallback, useMemo, useState } from "react";

import { SUBCATEGORY_PALETTE } from "../../../constants/palette.ts";
import { terms } from "../../../constants/strings.ts";
import type { MonthlyAnalyticsResponse } from "../../../services/api.ts";
import type { Category, Currency } from "../../../types/finance.ts";
import { formatDateMMMMYYYY, formatMonth } from "../../../utils/dateformatter.ts";
import { parseMonthString } from "../../../utils/dateparser.ts";
import { formatCurrencyValue } from "../../../utils/numberformatter.ts";
import { formatPeriod } from "../../../utils/period.ts";

import { AnalyticsRow } from "../../AnalyticsRow.tsx";
import { Card, ListGroup } from "../../../shared/ui/Card.tsx";
import { CategorySwitcherModal } from "../../CategorySwitcherModal.tsx";
import { ChartComponent, type ChartDataItem } from "../../ChartComponent.tsx";
import { HeroNumber } from "../../HeroNumber.tsx";
import { LoadingData } from "../../../shared/ui/LoadingData.tsx";
import { NoAvailableData } from "../../../shared/ui/NoAvailableData.tsx";
import { SegmentedControl } from "../../SegmentedControl.tsx";
import { ShareBar } from "../../ShareBar.tsx";
import { buildSubcategoryView } from "./subcategoryAnalytics.ts";

interface SubCategoryAnalyticsGridProps {
    categories: Category[];
    currency: Currency;
    monthlyData: MonthlyAnalyticsResponse | null;
    isLoading: boolean;
}

export const SubCategoryAnalyticsGrid: FC<SubCategoryAnalyticsGridProps> = ({
                                                                                categories,
                                                                                currency,
                                                                                monthlyData,
                                                                                isLoading,
                                                                            }) => {
    const [selectedCategoryCode, setSelectedCategoryCode] = useState<string | null>(null);

    const [selectedSubCatId, setSelectedSubCatId] = useState<string | null>(null);
    const [subCatViewType, setSubCatViewType] = useState<"total" | "monthly">("total");
    const [selectedChartIndex, setSelectedChartIndex] = useState<number>(-1);

    const formatAmount = useCallback(
        (val: number) => `${formatCurrencyValue(val, currency.format)} ${currency.symbol}`,
        [currency]
    );

    const view = useMemo(
        () =>
            buildSubcategoryView(monthlyData?.months ?? [], categories, {
                categoryCode: selectedCategoryCode,
                subCode: selectedSubCatId,
            }),
        [monthlyData, categories, selectedCategoryCode, selectedSubCatId]
    );
    const { category: selectedCategory, grandTotal, activeSub, sortedMonths, series } = view;

    // View concern: a colour per row.
    const rows = useMemo(
        () => view.rows.map((r, i) => ({ ...r, color: SUBCATEGORY_PALETTE[i % SUBCATEGORY_PALETTE.length] })),
        [view.rows]
    );

    const periodLabel = useMemo(() => formatPeriod(sortedMonths.map((m) => m.month)), [sortedMonths]);

    // View concern: labels for the chart.
    const chartData: ChartDataItem[] = useMemo(
        () =>
            series.map((p) => {
                const date = parseMonthString(p.monthStr);
                return {
                    id: p.monthStr,
                    label: formatMonth(date),
                    subLabel: String(date.getFullYear()),
                    fullName: formatDateMMMMYYYY(date),
                    value1: p.total,
                };
            }),
        [series]
    );

    if (isLoading) {
        return <LoadingData text={"Loading data..."} />;
    }

    if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
        return <NoAvailableData />;
    }

    if (categories.length === 0) {
        return <NoAvailableData text="No categories with subcategories available" />;
    }

    const handleSelectSubCategory = (subCode: string) => {
        setSelectedSubCatId(subCode);
        setSelectedChartIndex(-1);
        setSubCatViewType("monthly");
    };

    const selectedBar = selectedChartIndex >= 0 ? chartData[selectedChartIndex] : undefined;
    const heroValue =
        subCatViewType === "total"
            ? grandTotal
            : selectedBar
                ? selectedBar.value1
                : chartData.reduce((s, d) => s + d.value1, 0);

    const heroLabel =
        subCatViewType === "total"
            ? `${terms.expenses} · ${periodLabel}`
            : selectedBar
                ? `${activeSub?.name ?? ""} · ${selectedBar.fullName}`
                : `${activeSub?.name ?? ""} · ${periodLabel}`;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <CategorySwitcherModal
                variant="chip"
                categories={categories}
                availableCategories={categories}
                selectedCategoryCode={selectedCategory?.code ?? null}
                enableSubCategorySelection={false}
                onSelectCategory={(code) => {
                    setSelectedCategoryCode(code);
                    setSelectedSubCatId(null);
                    setSelectedChartIndex(-1);
                }}
            />

            <HeroNumber heroLabel={heroLabel} heroValue={heroValue} currency={currency} />

            <SegmentedControl
                options={[
                    { value: "total", label: terms.total },
                    { value: "monthly", label: terms.monthly },
                ]}
                selectedValue={subCatViewType}
                onChange={setSubCatViewType}
            />

            {subCatViewType === "total" && (
                <>
                    <ShareBar items={rows.map((r) => ({ id: r.sub.code, total: r.total, color: r.color }))} />

                    <ListGroup>
                        {rows
                            .filter((r) => r.total > 0)
                            .map((r) => (
                                <AnalyticsRow
                                    key={r.sub.code}
                                    name={r.sub.name}
                                    color={r.color}
                                    share={r.share}
                                    total={r.total}
                                    currency={currency}
                                    onClick={() => handleSelectSubCategory(r.sub.code)}
                                />
                            ))}
                    </ListGroup>
                </>
            )}

            {subCatViewType === "monthly" && (
                <>
                    {chartData.length > 0 && (
                        <Card padding={12}>
                            <ChartComponent
                                data={chartData}
                                selectedIndex={selectedChartIndex}
                                onSelect={setSelectedChartIndex}
                                showDualBar={false}
                                formatAmount={formatAmount}
                            />
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};
