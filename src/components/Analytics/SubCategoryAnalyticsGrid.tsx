import { type FC, useMemo, useState } from "react";
import { commonStyles, theme, receiptStyles, appStyles } from "../../App.styles.ts";
import type { Category, Currency } from "../../types/finance.ts";
import { formatDateMMMMYYYY } from "../../utils/dateformatter.ts";
import type { MonthlyAnalyticsResponse } from "../../services/api.ts";
import { CategorySwitcherModal } from "../CategorySwitcherModal.tsx";
import { LoadingData } from "../LoadingData.tsx";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";

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
                                                                                isLoading
                                                                            }) => {
    const [selectedCategoryCode, setSelectedCategoryCode] = useState<string | null>(null);

    const selectedCategory = useMemo(
        () => categories.find(c => c.code === selectedCategoryCode) || categories[0] || null,
        [categories, selectedCategoryCode]
    );
    const [selectedSubCatId, setSelectedSubCatId] = useState<string | null>(null);
    const [subCatViewType, setSubCatViewType] = useState<'total' | 'monthly'>('total');

    const parseMonthString = (monthStr: string): Date => {
        const parts = monthStr.split('-');
        if (parts.length >= 2) {
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
        }
        return new Date(monthStr);
    };

    const subCategoryTotalsMap = useMemo(() => {
        const map = new Map<string, number>();
        if (!monthlyData?.months) return map;

        const catCode = selectedCategory?.code?.toLowerCase();

        monthlyData.months.forEach((m) => {
            const catData = m.outcomeCategories.find((c) => c.category.toLowerCase() === catCode);
            if (catData?.subCategories) {
                catData.subCategories.forEach((sc) => {
                    const key = (sc.subCategory || 'other').toLowerCase();
                    const current = map.get(key) || 0;
                    map.set(key, current + sc.total);
                });
            }
        });

        return map;
    }, [monthlyData, selectedCategory]);

    const getSubcategoryTotal = (subCode: string): number => {
        return subCategoryTotalsMap.get(subCode.toLowerCase()) || 0;
    };

    // Сортировка подкатегорий по убыванию суммы
    const sortedSubCategories = useMemo(() => {
        const list = selectedCategory?.subCategories || [];
        return [...list].sort((a, b) => getSubcategoryTotal(b.code) - getSubcategoryTotal(a.code));
    }, [selectedCategory, subCategoryTotalsMap]);

    const getSubcategoryMonthlyTotal = (monthStr: string, subCode: string | null): number => {
        if (!subCode || !monthlyData?.months) return 0;

        const monthData = monthlyData.months.find((m) => m.month === monthStr);
        if (!monthData) return 0;

        const catData = monthData.outcomeCategories.find(
            (c) => c.category.toLowerCase() === selectedCategory?.code?.toLowerCase()
        );

        const subData = catData?.subCategories?.find(
            (sc) => (sc.subCategory || 'other').toLowerCase() === subCode.toLowerCase()
        );

        return subData?.total || 0;
    };

    if (isLoading) {
        return <LoadingData text={"Loading data..."} />;
    }

    if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
        return (
            <div style={{ ...commonStyles.card, textAlign: 'center', padding: '20px', color: theme.colors.textSecondary }}>
                No analytics data available
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div style={{ ...commonStyles.card, textAlign: 'center', padding: '20px', color: theme.colors.textSecondary }}>
                No categories with subcategories available
            </div>
        );
    }

    const activeSubCatCode = selectedSubCatId || sortedSubCategories[0]?.code || null;

    const handleSelectSubCategory = (subCode: string) => {
        setSelectedSubCatId(subCode);
        setSubCatViewType('monthly');
    };

    return (
        <div style={commonStyles.card}>
            <span style={commonStyles.cardTitle}>Subcategory analytics</span>

            <CategorySwitcherModal
                categories={categories}
                availableCategories={categories}
                selectedCategoryCode={selectedCategory?.code}
                enableSubCategorySelection={true}
                onSelectCategory={(code) => {
                    setSelectedCategoryCode(code);
                    setSelectedSubCatId(null);
                }}
            />

            <div style={appStyles.typeToggleGroup}>
                <button
                    onClick={() => setSubCatViewType('total')}
                    style={{
                        ...appStyles.typeBtn,
                        ...(subCatViewType === 'total' ? { backgroundColor: theme.colors.bgElement, color: theme.colors.primary } : {}),
                    }}
                >
                    Total
                </button>
                <button
                    onClick={() => setSubCatViewType('monthly')}
                    style={{
                        ...appStyles.typeBtn,
                        ...(subCatViewType === 'monthly' ? { backgroundColor: theme.colors.bgElement, color: theme.colors.primary } : {}),
                    }}
                >
                    Monthly
                </button>
            </div>

            {/* Total View — отсортированный список */}
            {subCatViewType === 'total' && (
                <div style={receiptStyles.manualList}>
                    {sortedSubCategories.map((sub) => {
                        const total = getSubcategoryTotal(sub.code);
                        return (
                            <div
                                key={sub.code}
                                onClick={() => handleSelectSubCategory(sub.code)}
                                style={{
                                    ...receiptStyles.subChip,
                                    justifyContent: 'space-between',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease',
                                }}
                            >
                                <span style={{ color: theme.colors.textPrimary, fontWeight: '500' }}>{sub.name}</span>
                                <span style={{ fontWeight: '700', color: theme.colors.textPrimary }}>
                                    {formatCurrencyValue(total)} {currency.symbol}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Monthly View */}
            {subCatViewType === 'monthly' && (
                <div style={commonStyles.column10}>
                    <label style={commonStyles.label}>Choose a subcategory</label>
                    <div style={receiptStyles.subSelector}>
                        {sortedSubCategories.map((sub) => (
                            <button
                                key={sub.code}
                                onClick={() => setSelectedSubCatId(sub.code)}
                                style={{
                                    ...receiptStyles.subChip,
                                    ...(activeSubCatCode === sub.code ? receiptStyles.subChipActive : {}),
                                    cursor: 'pointer',
                                }}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>

                    <div style={receiptStyles.manualList}>
                        {monthlyData?.months?.map((m) => {
                            const monthDate = parseMonthString(m.month);
                            const monthAmount = getSubcategoryMonthlyTotal(m.month, activeSubCatCode);

                            return (
                                <div key={m.month} style={{ ...receiptStyles.subChip, justifyContent: 'space-between', padding: '10px 12px' }}>
                                    <span style={{ color: theme.colors.textSecondary }}>{formatDateMMMMYYYY(monthDate)}</span>
                                    <span style={{ fontWeight: '700', color: monthAmount > 0 ? theme.colors.primary : theme.colors.textSecondary }}>
                                        {formatCurrencyValue(monthAmount)} {currency.symbol}
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