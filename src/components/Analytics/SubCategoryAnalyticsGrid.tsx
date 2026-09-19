import { type FC, useCallback, useMemo, useState } from "react";

import { SUBCATEGORY_PALETTE } from "../../constants/palette.ts";
import { terms } from "../../constants/strings.ts";
import type { MonthlyAnalyticsResponse } from "../../services/api.ts";
import type { Category, Currency } from "../../types/finance.ts";
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
import { SegmentedControl } from "../SegmentedControl.tsx";
import { ShareBar } from "../ShareBar.tsx";

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

    const selectedCategory = useMemo(
        () => categories.find((c) => c.code === selectedCategoryCode) || categories[0] || null,
        [categories, selectedCategoryCode]
    );

    const [selectedSubCatId, setSelectedSubCatId] = useState<string | null>(null);
    const [subCatViewType, setSubCatViewType] = useState<"total" | "monthly">("total");
    const [selectedChartIndex, setSelectedChartIndex] = useState<number>(-1);

    const formatAmount = useCallback(
        (val: number) => `${formatCurrencyValue(val, currency.format)} ${currency.symbol}`,
        [currency]
    );

    const subCategoryTotalsMap = useMemo(() => {
        const map = new Map<string, number>();
        if (!monthlyData?.months) return map;

        const catCode = selectedCategory?.code?.toLowerCase();

        monthlyData.months.forEach((m) => {
            const catData = m.outcomeCategories.find((c) => c.category.toLowerCase() === catCode);
            if (catData?.subCategories) {
                catData.subCategories.forEach((sc) => {
                    const key = (sc.subCategory || "other").toLowerCase();
                    map.set(key, (map.get(key) || 0) + sc.total);
                });
            }
        });

        return map;
    }, [monthlyData, selectedCategory]);

    const sortedSubCategories = useMemo(() => {
        const list = selectedCategory?.subCategories || [];
        const totalOf = (code: string) => subCategoryTotalsMap.get(code.toLowerCase()) || 0;
        return [...list].sort((a, b) => totalOf(b.code) - totalOf(a.code));
    }, [selectedCategory, subCategoryTotalsMap]);

    const { rows, grandTotal } = useMemo(() => {
        const raw = sortedSubCategories.map((sub, i) => ({
            sub,
            total: subCategoryTotalsMap.get(sub.code.toLowerCase()) || 0,
            color: SUBCATEGORY_PALETTE[i % SUBCATEGORY_PALETTE.length],
        }));
        const sum = raw.reduce((s, r) => s + r.total, 0);
        return {
            grandTotal: sum,
            rows: raw.map((r) => ({ ...r, share: sum > 0 ? r.total / sum : 0 })),
        };
    }, [sortedSubCategories, subCategoryTotalsMap]);

    const activeSubCatCode = selectedSubCatId || sortedSubCategories[0]?.code || null;
    const activeSub = sortedSubCategories.find((s) => s.code === activeSubCatCode) || null;

    const getSubcategoryMonthlyTotal = (monthStr: string, subCode: string | null): number => {
        if (!subCode || !monthlyData?.months) return 0;

        const monthData = monthlyData.months.find((m) => m.month === monthStr);
        if (!monthData) return 0;

        const catData = monthData.outcomeCategories.find(
            (c) => c.category.toLowerCase() === selectedCategory?.code?.toLowerCase()
        );

        const subData = catData?.subCategories?.find(
            (sc) => (sc.subCategory || "other").toLowerCase() === subCode.toLowerCase()
        );

        return subData?.total || 0;
    };

    const sortedMonths = useMemo(() => {
        if (!monthlyData?.months) return [];
        return [...monthlyData.months].sort((a, b) => a.month.localeCompare(b.month));
    }, [monthlyData]);

    const periodLabel = useMemo(() => formatPeriod(sortedMonths.map((m) => m.month)), [sortedMonths]);

    const chartData: ChartDataItem[] = useMemo(() => {
        if (!sortedMonths.length || !activeSubCatCode) return [];
        return sortedMonths
            .filter((m) => getSubcategoryMonthlyTotal(m.month, activeSubCatCode) > 0)
            .map((m) => {
                const date = parseMonthString(m.month);
                const total = getSubcategoryMonthlyTotal(m.month, activeSubCatCode);
                return {
                    id: m.month,
                    label: formatMonth(date),
                    subLabel: String(date.getFullYear()),
                    fullName: formatDateMMMMYYYY(date),
                    value1: total,
                };
            });
    }, [sortedMonths, activeSubCatCode, selectedCategory]);

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
                selectedCategoryCode={selectedCategory?.code}
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