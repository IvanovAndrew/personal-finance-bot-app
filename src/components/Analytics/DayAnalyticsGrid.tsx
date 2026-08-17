import { type FC, useMemo, useState } from "react";
import { commonStyles, theme } from "../../App.styles.ts";
import { type SaveTransactionPayload } from "../../services/api.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import type { Category, Currency } from "../../types/finance.ts";
import { getCategoryMeta } from "../../utils/categoryutils.ts";
import { LoadingData } from "../LoadingData.tsx";
import { TransactionRow } from "../TransactionRow.tsx";
import {ShopLogo} from "../ShopLogo.tsx";

interface DayAnalyticsGridProps {
    startDate: Date;
    currency: Currency;
    categories?: Category[];
    items: SaveTransactionPayload[] | null;
    isLoading: boolean;
}

interface CategoryGroup {
    category: string;
    total: number;
    items: SaveTransactionPayload[];
}

interface ShopGroup {
    shop: string;
    total: number;
    categories: CategoryGroup[];
}

export const DayAnalyticsGrid: FC<DayAnalyticsGridProps> = ({
                                                                startDate,
                                                                currency,
                                                                categories = [],
                                                                items,
                                                                isLoading,
                                                            }) => {
    // Состояние развернутых магазинов (ключ - имя магазина)
    const [expandedShops, setExpandedShops] = useState<Record<string, boolean>>({});

    const toggleShop = (shopName: string) => {
        setExpandedShops((prev) => ({
            ...prev,
            [shopName]: !prev[shopName],
        }));
    };

    const dayTotal = useMemo(() => {
        return (items ?? []).reduce((acc, curr) => acc + curr.amount, 0);
    }, [items]);

    // Двухуровневая группировка: Магазин -> Категории -> Покупки
    const groupedByShop = useMemo<ShopGroup[]>(() => {
        if (!items) return [];

        const shopMap = new Map<
            string,
            {
                shop: string;
                total: number;
                categoryMap: Map<string, { category: string; total: number; items: SaveTransactionPayload[] }>;
            }
        >();

        items.forEach((item) => {
            const shopKey = item.shop?.trim() || "Unspecified Shop";
            const catKey = item.category?.trim() || "Others";

            if (!shopMap.has(shopKey)) {
                shopMap.set(shopKey, { shop: shopKey, total: 0, categoryMap: new Map() });
            }

            const shopData = shopMap.get(shopKey)!;
            shopData.total += item.amount;

            if (!shopData.categoryMap.has(catKey)) {
                shopData.categoryMap.set(catKey, { category: catKey, total: 0, items: [] });
            }

            const categoryData = shopData.categoryMap.get(catKey)!;
            categoryData.total += item.amount;
            categoryData.items.push(item);
        });

        return Array.from(shopMap.values())
            .sort((a, b) => b.total - a.total)
            .map((shopData) => ({
                shop: shopData.shop,
                total: shopData.total,
                categories: Array.from(shopData.categoryMap.values()).sort((a, b) => b.total - a.total),
            }));
    }, [items]);

    if (isLoading) {
        return <LoadingData text={"Loading expenses..."} />;
    }

    const formattedDayStr = startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div style={commonStyles.column12}>
            {/* Header / Day Summary Card */}
            <div style={{ ...commonStyles.card, padding: '14px 16px' }}>
                <div style={commonStyles.rowBetween}>
                    <div>
                        <div style={{ fontSize: '10px', color: theme.colors.textSecondary, fontWeight: '700', letterSpacing: '0.5px' }}>
                            TOTAL FOR DAY
                        </div>
                        <div style={{ fontSize: '13px', color: theme.colors.textPrimary, fontWeight: '700', marginTop: '2px' }}>
                            {formattedDayStr}
                        </div>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: theme.colors.textPrimary }}>
                        {formatCurrencyValue(dayTotal)} {currency.symbol}
                    </span>
                </div>
            </div>

            {/* List of Shops */}
            {groupedByShop.length === 0 ? (
                <div style={{ ...commonStyles.card, textAlign: 'center', padding: '24px', color: theme.colors.textSecondary }}>
                    No expenses recorded for this day
                </div>
            ) : (
                groupedByShop.map((shopGroup) => {
                    const isExpanded = !!expandedShops[shopGroup.shop];

                    return (
                        <div key={shopGroup.shop} style={{ ...commonStyles.card, padding: '0', overflow: 'hidden' }}>
                            {/* Кликабельный заголовок Магазина */}
                            <div
                                onClick={() => toggleShop(shopGroup.shop)}
                                style={{
                                    ...commonStyles.rowBetween,
                                    padding: '14px 16px',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    backgroundColor: isExpanded ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                                    transition: 'background-color 0.15s ease',
                                }}
                            >
                                <div style={commonStyles.rowStart}>
                                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary, marginRight: '4px' }}>
                                        {isExpanded ? '▼' : '►'}
                                    </span>
                                    <ShopLogo shopName={shopGroup.shop} />
                                    <span style={{ ...commonStyles.cardTitle, fontSize: '15px' }}>
                                        {shopGroup.shop}
                                    </span>
                                </div>
                                <span style={{ fontSize: '15px', fontWeight: '700', color: theme.colors.primary }}>
                                    {formatCurrencyValue(shopGroup.total)} {currency.symbol}
                                </span>
                            </div>

                            {/* Содержимое Магазина (Категории + Покупки) */}
                            {isExpanded && (
                                <div style={{ padding: '0 16px 14px 16px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                                    {shopGroup.categories.map((catGroup) => {
                                        const meta = getCategoryMeta(categories, catGroup.category);

                                        return (
                                            <div
                                                key={catGroup.category}
                                                style={{
                                                    backgroundColor: 'rgba(0, 0, 0, 0.015)',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    borderLeft: `3px solid ${theme.colors.primary}`,
                                                }}
                                            >
                                                {/* Заголовок Категории */}
                                                <div style={{ ...commonStyles.rowBetween, marginBottom: '8px' }}>
                                                    <div style={commonStyles.rowStart}>
                                                        <span style={{ fontSize: '14px' }}>{meta.icon}</span>
                                                        <span style={{ fontWeight: '600', fontSize: '13px', color: theme.colors.textPrimary }}>
                                                            {meta.name}
                                                        </span>
                                                    </div>
                                                    <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textSecondary }}>
                                                        {formatCurrencyValue(catGroup.total)} {currency.symbol}
                                                    </span>
                                                </div>

                                                {/* Список покупок внутри Категории */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {catGroup.items.map((item, idx) => (
                                                        <TransactionRow
                                                            key={idx}
                                                            transaction={{
                                                                shop: item.shop,
                                                                category: item.category,
                                                                subcategory: item.subCategory,
                                                                description: item.description,
                                                                amount: item.amount,
                                                                isOutcome: true,
                                                            }}
                                                            categories={categories}
                                                            currency={currency}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};