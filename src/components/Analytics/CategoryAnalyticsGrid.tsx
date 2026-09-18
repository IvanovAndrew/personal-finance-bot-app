import { type FC, useMemo, useState } from "react";

import { commonStyles, receiptStyles, theme } from "../../App.styles.ts";
import type { MonthlyAnalyticsResponse } from "../../services/api.ts";
import type { Category, Currency } from "../../types/finance.ts";
import { getCategoryMeta, getSubCategoryName } from "../../utils/categoryutils.ts";
import { formatDateMMMMYYYY } from "../../utils/dateformatter.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import { CategorySwitcherModal } from "../CategorySwitcherModal.tsx";
import { ChartComponent, type ChartDataItem } from "../ChartComponent.tsx"; // Import chart component
import { LoadingData } from "../LoadingData.tsx";
import { NoAvailableData } from "../NoAvailableData.tsx";

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

    const allUniqueCategoryCodes = Array.from(
        new Set((monthlyData?.months || []).flatMap((m) => m.outcomeCategories.map((c) => c.category)))
    );

    const availableCategories = useMemo(() => {
        const matching = categories.filter((c) =>
            allUniqueCategoryCodes.some((code) => code.toLowerCase() === c.code.toLowerCase())
        );
        return matching.length > 0 ? matching : categories;
    }, [categories, allUniqueCategoryCodes]);

    const parseMonthString = (monthStr: string): Date => {
        const parts = monthStr.split('-');
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    };

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

    // 1. Преобразуем данные в формат ChartDataItem для ChartComponent
    const chartData = useMemo<ChartDataItem[]>(() => {
        return categoryMonthlyTrend.map((m) => {
            const date = parseMonthString(m.monthStr);
            return {
                id: m.monthStr,
                label: date.toLocaleDateString('en-US', { month: 'short' }), // "Jan"
                subLabel: date.getFullYear().toString(),                   // "2026"
                fullName: formatDateMMMMYYYY(date),                         // "January 2026"
                value1: m.total,
            };
        });
    }, [categoryMonthlyTrend]);

    // Определяем выбранный индекс для подсвечивания в графике (-1, если фильтр не выбран)
    const selectedChartIndex = useMemo(() => {
        if (!selectedMonthStr) return -1;
        return categoryMonthlyTrend.findIndex((m) => m.monthStr === selectedMonthStr);
    }, [categoryMonthlyTrend, selectedMonthStr]);

    const categoryGrandTotal = categoryMonthlyTrend.reduce((acc, curr) => acc + curr.total, 0);

    const targetMonthsForSubcategories = selectedMonthStr
        ? categoryMonthlyTrend.filter((m) => m.monthStr === selectedMonthStr)
        : categoryMonthlyTrend;

    const activeSubcategoryTotal = targetMonthsForSubcategories.reduce((acc, curr) => acc + curr.total, 0);

    const subCategoryTotalsMap = new Map<string, { code: string | null; name: string; total: number }>();

    targetMonthsForSubcategories.forEach((m) => {
        m.subCategories.forEach((sc) => {
            const rawCode = sc.subCategory;
            const key = rawCode ? rawCode.toLowerCase() : 'other';
            const displayName = getSubCategoryName(categories, activeCode, rawCode) ?? 'other';

            const current = subCategoryTotalsMap.get(key) || { code: rawCode, name: displayName, total: 0 };
            subCategoryTotalsMap.set(key, { ...current, total: current.total + sc.total });
        });
    });

    const subCategoryList = Array.from(subCategoryTotalsMap.values())
        .sort((a, b) => b.total - a.total);

    const selectedMonthDate = selectedMonthStr ? parseMonthString(selectedMonthStr) : null;

    if (isLoading) {
        return <LoadingData text={"Loading data..."} />;
    }

    if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
        return <NoAvailableData />;
    }

    return (
        <div style={commonStyles.column12}>
            {/* Header Card: Category Switcher + Total */}
            <div style={{ ...commonStyles.card, padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <CategorySwitcherModal
                            categories={categories}
                            availableCategories={availableCategories}
                            selectedCategoryCode={activeCode}
                            enableSubCategorySelection={false}
                            onSelectCategory={(code) => {
                                setSelectedCategoryCode(code);
                                setSelectedMonthStr(null);
                            }}
                        />
                    </div>

                    <div style={{ textAlign: 'center', marginLeft: '16px' }}>
                        <div style={{ fontSize: '10px', color: theme.colors.textSecondary, fontWeight: '700', letterSpacing: '0.5px' }}>
                            {selectedMonthStr ? 'FILTERED TOTAL' : 'TOTAL'}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: theme.colors.textPrimary, marginTop: '2px' }}>
                            {formatCurrencyValue(selectedMonthStr ? activeSubcategoryTotal : categoryGrandTotal, currency.format)} {currency.symbol}
                        </div>
                    </div>
                </div>
            </div>

            {activeMeta && (
                <>
                    {/* 2. Внедренный переиспользуемый график */}
                    <div style={commonStyles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={commonStyles.cardTitle}>Monthly Trend</span>
                            {selectedMonthStr && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedMonthStr(null)}
                                    style={{
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        color: theme.colors.primary,
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        padding: '0',
                                    }}
                                >
                                    Reset filter
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
                                    // Клик по выбранному бару сбрасывает фильтр, по новому — выбирает
                                    setSelectedMonthStr((prev) => (prev === clickedMonth ? null : clickedMonth));
                                }
                            }}
                        />
                    </div>

                    {/* Subcategories Breakdown */}
                    {subCategoryList.length > 0 && (
                        <div style={commonStyles.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={commonStyles.cardTitle}>Subcategories Breakdown</span>
                                <span style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '600' }}>
                                    {selectedMonthDate ? formatDateMMMMYYYY(selectedMonthDate) : 'All Months'}
                                </span>
                            </div>

                            <div style={commonStyles.column8}>
                                {subCategoryList.map((sc) => {
                                    const percentage = activeSubcategoryTotal > 0 ? (sc.total / activeSubcategoryTotal) * 100 : 0;

                                    return (
                                        <div
                                            key={sc.code || 'other'}
                                            style={{
                                                ...receiptStyles.subChip,
                                                flexDirection: 'column',
                                                alignItems: 'stretch',
                                                padding: '10px 12px',
                                                gap: '6px',
                                                backgroundColor: theme.colors.bgElement,
                                            }}
                                        >
                                            <div style={commonStyles.rowBetween}>
                                                <span style={{ fontWeight: '600', fontSize: '13px', color: theme.colors.textPrimary }}>
                                                    {sc.name}
                                                </span>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '13px', color: theme.colors.textPrimary, marginRight: '6px' }}>
                                                        {formatCurrencyValue(sc.total, currency.format)} {currency.symbol}
                                                    </span>
                                                    <span style={{ fontSize: '10px', color: theme.colors.textSecondary }}>
                                                        ({percentage.toFixed(1)}%)
                                                    </span>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: '4px',
                                                    backgroundColor: theme.colors.bgCard,
                                                    borderRadius: '2px',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${Math.min(percentage, 100)}%`,
                                                        height: '100%',
                                                        backgroundColor: theme.colors.primary,
                                                        borderRadius: '2px',
                                                        transition: 'width 0.3s ease',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};