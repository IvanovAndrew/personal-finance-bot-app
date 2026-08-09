import { type FC, useState } from "react";
import { commonStyles, theme, receiptStyles } from "../../App.styles.ts";
import type { Category } from "../../types/finance.ts";
import { formatDateMMMMYYYY } from "../../utils/dateformatter.ts";
import type { MonthlyAnalyticsResponse } from "../../services/api.ts";

interface CategoryAnalyticsGridProps {
    categories: Category[];
    startMonth: Date;
    currency: string;
    monthlyData: MonthlyAnalyticsResponse | null;
}

type SubViewMode = 'month' | 'total';

export const CategoryAnalyticsGrid: FC<CategoryAnalyticsGridProps> = ({
                                                                          categories,
                                                                          currency,
                                                                          monthlyData,
                                                                      }) => {
    const [subView, setSubView] = useState<SubViewMode>('month');
    const [selectedCategoryCode, setSelectedCategoryCode] = useState<string | null>(null);
    const [activeMonthStr, setActiveMonthStr] = useState<string | null>(null);

    if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
        return (
            <div style={{ ...commonStyles.card, textAlign: 'center', padding: '20px', color: theme.colors.textSecondary }}>
                No analytics data available
            </div>
        );
    }

    // Helper to safely parse "YYYY-MM-DD" or "YYYY-MM" string into local Date without timezone offset issues
    const parseMonthString = (monthStr: string): Date => {
        const parts = monthStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        return new Date(year, month, 1);
    };

    // Active single month calculation for 'month' mode
    const currentActiveMonthStr = activeMonthStr || monthlyData.months[0].month;
    const targetMonthData = monthlyData.months.find(m => m.month === currentActiveMonthStr) || monthlyData.months[0];
    const targetMonthDate = parseMonthString(targetMonthData.month);

    // Calculate aggregated totals across ALL months for 'total' mode
    const grandTotal = monthlyData.months.reduce((acc, m) => acc + m.total, 0);

    const aggregatedCategoriesMap = new Map<string, number>();
    monthlyData.months.forEach(m => {
        m.categories.forEach(c => {
            const current = aggregatedCategoriesMap.get(c.category) || 0;
            aggregatedCategoriesMap.set(c.category, current + c.total);
        });
    });

    // Convert aggregated map to sorted array
    const aggregatedCategories = Array.from(aggregatedCategoriesMap.entries())
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);

    // Active items depending on current sub-view mode
    const activeCategoriesList = subView === 'month' ? targetMonthData.categories : aggregatedCategories;
    const activeTotalAmount = subView === 'month' ? targetMonthData.total : grandTotal;

    // Helper to resolve category metadata (icon and display name)
    const getCategoryMeta = (code: string) => {
        return (
            categories.find((c) => c.code.toLowerCase() === code.toLowerCase()) || {
                code,
                name: code,
                icon: '📁',
            }
        );
    };

    const activeCategoryCode = selectedCategoryCode || activeCategoriesList[0]?.category || null;
    const activeCategoryMeta = activeCategoryCode ? getCategoryMeta(activeCategoryCode) : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Sub-tabs selector: Month vs Total */}
            <div style={{
                display: 'flex',
                backgroundColor: theme.colors.bgCard,
                borderRadius: theme.radius.md,
                padding: '3px',
                border: `1px solid ${theme.colors.border}`,
            }}>
                <button
                    onClick={() => {
                        setSubView('month');
                        setSelectedCategoryCode(null);
                    }}
                    style={{
                        flex: 1,
                        padding: '6px',
                        border: 'none',
                        borderRadius: theme.radius.sm,
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        backgroundColor: subView === 'month' ? theme.colors.bgElement : 'transparent',
                        color: subView === 'month' ? theme.colors.textPrimary : theme.colors.textSecondary,
                    }}
                >
                    Month
                </button>
                <button
                    onClick={() => {
                        setSubView('total');
                        setSelectedCategoryCode(null);
                    }}
                    style={{
                        flex: 1,
                        padding: '6px',
                        border: 'none',
                        borderRadius: theme.radius.sm,
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        backgroundColor: subView === 'total' ? theme.colors.bgElement : 'transparent',
                        color: subView === 'total' ? theme.colors.textPrimary : theme.colors.textSecondary,
                    }}
                >
                    Total
                </button>
            </div>

            {/* Total outcome card */}
            <div style={{ ...commonStyles.card, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '700' }}>
                            {subView === 'month' ? 'TOTAL OUTCOME' : 'GRAND TOTAL OUTCOME'}
                        </div>
                        <div style={{ fontSize: '13px', color: theme.colors.textPrimary, fontWeight: '600', marginTop: '2px' }}>
                            {subView === 'month'
                                ? formatDateMMMMYYYY(targetMonthDate)
                                : `All ${monthlyData.months.length} months`}
                        </div>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: theme.colors.textPrimary }}>
                        {activeTotalAmount.toLocaleString()} {currency}
                    </span>
                </div>

                {/* Monthly trend selector (shown in 'month' mode) */}
                {subView === 'month' && monthlyData.months.length > 1 && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: `1px solid ${theme.colors.border}` }}>
                        <span style={{ fontSize: '10px', color: theme.colors.textSecondary, fontWeight: '700' }}>
                            TOTAL MONTHLY TREND
                        </span>
                        <div
                            style={{
                                display: 'flex',
                                gap: '6px',
                                marginTop: '6px',
                                overflowX: 'auto',
                                paddingBottom: '4px',
                                WebkitOverflowScrolling: 'touch',
                            }}
                        >
                            {monthlyData.months.map((m) => {
                                const parsedDate = parseMonthString(m.month);
                                const isSelected = m.month === currentActiveMonthStr;

                                return (
                                    <button
                                        key={m.month}
                                        onClick={() => {
                                            setActiveMonthStr(m.month);
                                            setSelectedCategoryCode(null);
                                        }}
                                        style={{
                                            ...receiptStyles.subChip,
                                            flex: '0 0 auto',
                                            flexDirection: 'column',
                                            padding: '6px 10px',
                                            alignItems: 'flex-start',
                                            backgroundColor: isSelected ? theme.colors.bgElement : 'transparent',
                                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <span style={{ fontSize: '9px', color: isSelected ? theme.colors.primary : theme.colors.textSecondary }}>
                                            {formatDateMMMMYYYY(parsedDate)}
                                        </span>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: theme.colors.textPrimary }}>
                                            {m.total.toLocaleString()} {currency}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Categories breakdown */}
            <div style={commonStyles.card}>
                <span style={{ ...commonStyles.cardTitle, marginBottom: '12px', display: 'block' }}>
                    {subView === 'month' ? 'Categories Breakdown' : 'Total Categories Breakdown'}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeCategoriesList.map((catItem) => {
                        const meta = getCategoryMeta(catItem.category);
                        const isSelected = activeCategoryCode?.toLowerCase() === catItem.category.toLowerCase();
                        const percentage = activeTotalAmount > 0 ? (catItem.total / activeTotalAmount) * 100 : 0;

                        return (
                            <div
                                key={catItem.category}
                                onClick={() => setSelectedCategoryCode(catItem.category)}
                                style={{
                                    ...receiptStyles.subChip,
                                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                                    backgroundColor: isSelected ? theme.colors.bgElement : 'transparent',
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                    padding: '10px 12px',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', fontSize: '13px', color: theme.colors.textPrimary }}>
                                        {meta.icon} {meta.name}
                                    </span>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontWeight: '700', fontSize: '13px', color: theme.colors.textPrimary, marginRight: '6px' }}>
                                            {catItem.total.toLocaleString()} {currency}
                                        </span>
                                        <span style={{ fontSize: '10px', color: theme.colors.textSecondary }}>
                                            ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div
                                    style={{
                                        width: '100%',
                                        height: '4px',
                                        backgroundColor: theme.colors.bgElement,
                                        borderRadius: '2px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${Math.min(percentage, 100)}%`,
                                            height: '100%',
                                            backgroundColor: isSelected ? theme.colors.primary : theme.colors.border,
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

            {/* Selected category dynamic history across months */}
            {activeCategoryMeta && (
                <div style={commonStyles.card}>
                    <span style={{ ...commonStyles.cardTitle, fontSize: '13px' }}>
                        Dynamic: {activeCategoryMeta.icon} {activeCategoryMeta.name}
                    </span>
                    <p style={{ ...commonStyles.cardSub, marginBottom: '8px' }}>History across months</p>

                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            overflowX: 'auto',
                            paddingBottom: '6px',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {monthlyData.months.map((m) => {
                            const parsedDate = parseMonthString(m.month);
                            const catInMonth = m.categories.find(
                                (c) => c.category.toLowerCase() === activeCategoryMeta.code.toLowerCase()
                            );
                            const amount = catInMonth?.total || 0;

                            return (
                                <div
                                    key={m.month}
                                    style={{
                                        ...receiptStyles.subChip,
                                        flex: '1 0 85px',
                                        flexDirection: 'column',
                                        padding: '8px 6px',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        backgroundColor: theme.colors.bgElement,
                                    }}
                                >
                                    <span style={{ fontSize: '10px', color: theme.colors.textSecondary, marginBottom: '2px' }}>
                                        {formatDateMMMMYYYY(parsedDate)}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            color: amount > 0 ? theme.colors.primary : theme.colors.textSecondary,
                                        }}
                                    >
                                        {amount > 0 ? `${amount.toLocaleString()}` : '—'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};