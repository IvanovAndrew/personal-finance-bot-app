import { useMemo, useState, type FC } from "react";
import type { Category, Currency } from "../../types/finance.ts";
import type { MonthlyAnalyticsResponse } from "../../services/api.ts";
import { commonStyles, receiptStyles, theme } from "../../App.styles.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import { formatDateMMMMYYYY } from "../../utils/dateformatter.ts";
import { getCategoryMeta, getSubCategoryName } from "../../utils/categoryutils.ts";
import { CategorySwitcherModal } from "../CategorySwitcherModal.tsx";
import { NoAvailableData } from "../NoAvailableData.tsx";
import { LoadingData } from "../LoadingData.tsx";

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

    if (isLoading) {
        return <LoadingData text={"Loading data..."} />;
    }

    if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
        return <NoAvailableData />;
    }

    const parseMonthString = (monthStr: string): Date => {
        const parts = monthStr.split('-');
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    };

    const activeCode = selectedCategoryCode || availableCategories[0]?.code || allUniqueCategoryCodes[0] || null;
    const activeMeta = activeCode ? getCategoryMeta(categories, activeCode) : null;

    const categoryMonthlyTrend = monthlyData.months.map((m) => {
        const catData = m.outcomeCategories.find((c) => c.category.toLowerCase() === activeCode?.toLowerCase());
        return {
            monthStr: m.month,
            total: catData?.total || 0,
            subCategories: catData?.subCategories || [],
        };
    });

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
    const maxTotal = Math.max(...categoryMonthlyTrend.map((item) => item.total), 1);

    return (
        <div style={commonStyles.column12}>
            {/* Unified Header Card: Свитчер категории слева + Сумма справа */}
            <div style={{ ...commonStyles.card, padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                    {/* Свитчер категории (слева) */}
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

                    {/* Сумма трат (справа) */}
                    <div style={{ textAlign: 'center', marginLeft: '16px' }}>
                        <div style={{ fontSize: '10px', color: theme.colors.textSecondary, fontWeight: '700', letterSpacing: '0.5px' }}>
                            {selectedMonthStr ? 'FILTERED TOTAL' : 'TOTAL'}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: theme.colors.textPrimary, marginTop: '2px' }}>
                            {formatCurrencyValue(selectedMonthStr ? activeSubcategoryTotal : categoryGrandTotal)} {currency.symbol}
                        </div>
                    </div>

                </div>
            </div>

            {activeMeta && (
                <>
                    {/* Interactive Monthly Trend Bar Chart */}
                    <div style={commonStyles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={commonStyles.cardTitle}>Monthly Trend</span>
                            {selectedMonthStr && (
                                <button
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

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '12px',
                                height: '110px',
                                paddingTop: '0px',
                                overflowX: 'auto',
                                WebkitOverflowScrolling: 'touch',
                            }}
                        >
                            {categoryMonthlyTrend.map((m) => {
                                const parsedDate = parseMonthString(m.monthStr);
                                const heightPercent = m.total > 0 ? Math.max((m.total / maxTotal) * 100, 8) : 4;

                                const isBarSelected = selectedMonthStr === m.monthStr;
                                const isAnySelected = selectedMonthStr !== null;

                                return (
                                    <div
                                        key={m.monthStr}
                                        onClick={() => {
                                            setSelectedMonthStr((prev) => (prev === m.monthStr ? null : m.monthStr));
                                        }}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            flex: '1 0 48px',
                                            height: '100%',
                                            justifyContent: 'flex-end',
                                            gap: '6px',
                                            cursor: 'pointer',
                                            opacity: isAnySelected && !isBarSelected ? 0.45 : 1,
                                            transition: 'opacity 0.2s ease',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: '10px',
                                                fontWeight: '700',
                                                color: isBarSelected
                                                    ? theme.colors.primary
                                                    : (m.total > 0 ? theme.colors.textPrimary : theme.colors.textSecondary),
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {m.total > 0 ? formatCurrencyValue(m.total) : '—'}
                                        </span>

                                        <div style={{
                                            flex: 1,
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'flex-end'
                                        }}>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '24px',
                                                    height: `${heightPercent}%`,
                                                    backgroundColor: isBarSelected
                                                        ? theme.colors.primary
                                                        : (m.total > 0 ? theme.colors.primary : theme.colors.bgElement),
                                                    borderRadius: '4px 4px 0 0',
                                                    boxShadow: isBarSelected ? `0 0 8px ${theme.colors.primary}` : 'none',
                                                    transition: 'all 0.2s ease',
                                                }}
                                            />
                                        </div>

                                        <span style={{
                                            fontSize: '10px',
                                            color: isBarSelected ? theme.colors.primary : theme.colors.textSecondary,
                                            fontWeight: isBarSelected ? '700' : '400',
                                            textAlign: 'center',
                                        }}>
                                            {formatDateMMMMYYYY(parsedDate).slice(0, 3)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
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
                                                        {formatCurrencyValue(sc.total)} {currency.symbol}
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