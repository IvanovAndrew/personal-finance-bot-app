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
    const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);
    const [selectedSubCatId, setSelectedSubCatId] = useState<string | null>(null);
    const [subCatViewType, setSubCatViewType] = useState<'total' | 'monthly'>('total');

    const subCategoryTotalsMap = useMemo(() => {
        const map = new Map<string, number>();
        if (!monthlyData?.months) return map;

        const catCode = selectedCategory?.code?.toLowerCase();

        monthlyData.months.forEach((m) => {
            const catData = m.categories.find((c) => c.category.toLowerCase() === catCode);
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

    // Хелпер для получения суммы подкатегории за конкретный месяц
    const getSubcategoryMonthlyTotal = (monthStr: string, subCode: string | null): number => {
        if (!subCode || !monthlyData?.months) return 0;

        const monthData = monthlyData.months.find((m) => m.month === monthStr);
        if (!monthData) return 0;

        const catData = monthData.categories.find(
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

    const categoryMonthlyTrend = monthlyData.months.map((m) => {
        const catData = m.categories.find((c) => c.category.toLowerCase() === selectedCategory.code?.toLowerCase());
        return {
            monthStr: m.month,
            total: catData?.total || 0,
            subCategories: catData?.subCategories || [],
        };
    });

    const categoryGrandTotal = categoryMonthlyTrend.reduce((acc, curr) => acc + curr.total, 0);

    // Авто-выбор первой подкатегории, если ни одна не выбрана при переходе в 'monthly'
    const activeSubCatCode = selectedSubCatId || selectedCategory?.subCategories?.[0]?.code || null;

    return (
        <div style={commonStyles.card}>
            <span style={commonStyles.cardTitle}>Subcategory analytics</span>

            <CategorySwitcherModal
                categories={categories}
                availableCategories={categories}
                selectedCategoryCode={selectedCategory.code}
                onSelectCategory={(code) => {
                    const category = categories.find((c) => c.code === code);
                    if (category) {
                        setSelectedCategory(category);
                        setSelectedSubCatId(null); // Сбрасываем выбранную подкатегорию
                    }
                }}
                totalAmount={categoryGrandTotal}
                currency={currency.symbol}
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

            {/* Total View */}
            {subCatViewType === 'total' && (
                <div style={receiptStyles.manualList}>
                    {(selectedCategory?.subCategories || []).map((sub) => {
                        const total = getSubcategoryTotal(sub.code);
                        return (
                            <div key={sub.code} style={{ ...receiptStyles.subChip, justifyContent: 'space-between', padding: '12px' }}>
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
                        {(selectedCategory?.subCategories || []).map((sub) => (
                            <button
                                key={sub.code}
                                onClick={() => setSelectedSubCatId(sub.code)}
                                style={{
                                    ...receiptStyles.subChip,
                                    ...(activeSubCatCode === sub.code ? receiptStyles.subChipActive : {}),
                                }}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>

                    <div style={receiptStyles.manualList}>
                        {monthlyData?.months?.map((m) => {
                            const monthDate = new Date(m.month);
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