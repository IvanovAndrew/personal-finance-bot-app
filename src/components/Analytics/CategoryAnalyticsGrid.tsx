import {useMemo, useState, type FC } from "react";
import type { Category } from "../../types/finance.ts";
import type { MonthlyAnalyticsResponse } from "../../services/api.ts";
import {commonStyles, receiptStyles, theme} from "../../App.styles.ts";
import {ChevronDown, X} from "lucide-react";
import {formatCurrencyValue} from "../../utils/numberformatter.ts";
import {CategoryGrid} from "../CategoryGrid.tsx";
import {formatDateMMMMYYYY} from "../../utils/dateformatter.ts";

interface CategoryAnalyticsGridProps {
    categories: Category[];
    startMonth: Date;
    currency: string;
    monthlyData: MonthlyAnalyticsResponse | null;
}

export const CategoryAnalyticsGrid: FC<CategoryAnalyticsGridProps> = ({
                                                                          categories,
                                                                          currency,
                                                                          monthlyData,
                                                                      }) => {
    const [selectedCategoryCode, setSelectedCategoryCode] = useState<string | null>(null);
    const [selectedMonthStr, setSelectedMonthStr] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
        return (
            <div style={{ ...commonStyles.card, textAlign: 'center', padding: '20px', color: theme.colors.textSecondary }}>
                No analytics data available
            </div>
        );
    }

    // Helper to safely parse "YYYY-MM-DD" or "YYYY-MM" string into a local Date
    const parseMonthString = (monthStr: string): Date => {
        const parts = monthStr.split('-');
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    };

    // Aggregate unique category codes across all fetched months
    const allUniqueCategoryCodes = Array.from(
        new Set(monthlyData.months.flatMap((m) => m.categories.map((c) => c.category)))
    );

    // Filter category definitions to those available in analytics or fallback to full list
    const availableCategories = useMemo(() => {
        const matching = categories.filter((c) =>
            allUniqueCategoryCodes.some((code) => code.toLowerCase() === c.code.toLowerCase())
        );
        return matching.length > 0 ? matching : categories;
    }, [categories, allUniqueCategoryCodes]);

    // Resolve category metadata (icon, name, and subcategories list)
    const getCategoryMeta = (code: string) => {
        return (
            categories.find((c) => c.code.toLowerCase() === code.toLowerCase()) || {
                code,
                name: code,
                icon: '📁',
                subCategories: [],
            }
        );
    };

    // Fallback to the first available category if none is selected
    const activeCode = selectedCategoryCode || availableCategories[0]?.code || allUniqueCategoryCodes[0] || null;
    const activeMeta = activeCode ? getCategoryMeta(activeCode) : null;
    const activeCategoryObj = categories.find((c) => c.code.toLowerCase() === activeCode?.toLowerCase()) || null;

    // Calculate monthly trend for the selected category
    const categoryMonthlyTrend = monthlyData.months.map((m) => {
        const catData = m.categories.find((c) => c.category.toLowerCase() === activeCode?.toLowerCase());
        return {
            monthStr: m.month,
            total: catData?.total || 0,
            subCategories: catData?.subCategories || [],
        };
    });

    const categoryGrandTotal = categoryMonthlyTrend.reduce((acc, curr) => acc + curr.total, 0);

    // Helper to resolve human-readable subcategory name from category metadata
    const getSubCategoryName = (subCategoryCode: string | null): string => {
        if (!subCategoryCode) return 'Other';

        const subMeta = activeMeta?.subCategories?.find(
            (sc) => sc.code.toLowerCase() === subCategoryCode.toLowerCase()
        );

        return subMeta?.name || subCategoryCode;
    };

    // Filter target months for subcategory aggregation based on user selection in chart
    const targetMonthsForSubcategories = selectedMonthStr
        ? categoryMonthlyTrend.filter((m) => m.monthStr === selectedMonthStr)
        : categoryMonthlyTrend;

    const activeSubcategoryTotal = targetMonthsForSubcategories.reduce((acc, curr) => acc + curr.total, 0);

    // Aggregate subcategories totals for filtered months
    const subCategoryTotalsMap = new Map<string, { code: string | null; name: string; total: number }>();

    targetMonthsForSubcategories.forEach((m) => {
        m.subCategories.forEach((sc) => {
            const rawCode = sc.subCategory;
            const key = rawCode ? rawCode.toLowerCase() : 'other';
            const displayName = getSubCategoryName(rawCode);

            const current = subCategoryTotalsMap.get(key) || { code: rawCode, name: displayName, total: 0 };
            subCategoryTotalsMap.set(key, { ...current, total: current.total + sc.total });
        });
    });

    const subCategoryList = Array.from(subCategoryTotalsMap.values())
        .sort((a, b) => b.total - a.total);

    const selectedMonthDate = selectedMonthStr ? parseMonthString(selectedMonthStr) : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Compact Header with Category Switcher */}
            <div style={{ ...commonStyles.card, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '10px', color: theme.colors.textSecondary, fontWeight: '700', letterSpacing: '0.5px' }}>
                            TOTAL FOR CATEGORY
                        </div>
                        {activeMeta && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: theme.colors.bgElement,
                                    border: `1px solid ${theme.colors.border}`,
                                    borderRadius: theme.radius.md,
                                    padding: '6px 10px',
                                    marginTop: '6px',
                                    cursor: 'pointer',
                                    color: theme.colors.textPrimary,
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>{activeMeta.icon}</span>
                                <span style={{ fontSize: '13px', fontWeight: '700' }}>{activeMeta.name}</span>
                                <ChevronDown size={14} color={theme.colors.textSecondary} />
                            </button>
                        )}
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: theme.colors.textPrimary }}>
                        {formatCurrencyValue(categoryGrandTotal)} {currency}
                    </span>
                </div>
            </div>

            {/* Modal Dialog with imported CategoryGrid */}
            {isModalOpen && (
                <div
                    onClick={() => setIsModalOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '380px',
                            position: 'relative',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                        }}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '14px',
                                right: '14px',
                                background: 'transparent',
                                border: 'none',
                                color: theme.colors.textSecondary,
                                cursor: 'pointer',
                                padding: '4px',
                                zIndex: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <X size={18} />
                        </button>

                        <CategoryGrid
                            categories={availableCategories}
                            selectedCategory={activeCategoryObj}
                            selectedSubCat={null}
                            onSelectCategory={(cat) => {
                                if (cat) {
                                    setSelectedCategoryCode(cat.code);
                                    setSelectedMonthStr(null); // Reset month filter when switching category
                                }
                                setIsModalOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {activeMeta && (
                <>
                    {/* Interactive Monthly Trend Bar Chart */}
                    <div style={commonStyles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={commonStyles.cardTitle}>
                                Monthly Trend
                            </span>
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
                                const maxTotal = Math.max(...categoryMonthlyTrend.map((item) => item.total), 1);
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

                                        {/* Обертка для правильного расчета процентов высоты */}
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
                                <span style={commonStyles.cardTitle}>
                                    Subcategories Breakdown
                                </span>
                                <span style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '600' }}>
                                    {selectedMonthDate ? formatDateMMMMYYYY(selectedMonthDate) : 'All Months'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '600', fontSize: '13px', color: theme.colors.textPrimary }}>
                                                    {sc.name}
                                                </span>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '13px', color: theme.colors.textPrimary, marginRight: '6px' }}>
                                                        {formatCurrencyValue(sc.total)} {currency}
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