import { type FC, useMemo, useState } from "react";
import { commonStyles, theme } from "../../App.styles.ts";
import { type SaveTransactionPayload } from "../../services/api.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import type { Category, Currency } from "../../types/finance.ts";
import { LoadingData } from "../LoadingData.tsx";
import { TransactionRow } from "../TransactionRow.tsx";
import {ShopLogo} from "../ShopLogo.tsx";
import {ChevronDown, ChevronRight} from "lucide-react";

interface DayAnalyticsGridProps {
    startDate: Date;
    currency: Currency;
    categories?: Category[];
    items: SaveTransactionPayload[] | null;
    isLoading: boolean;
}

interface ShopGroup {
    shop: string;
    total: number;
    items: SaveTransactionPayload[];
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

    const groupedByShop = useMemo<ShopGroup[]>(() => {
        if (!items) return [];

        const shopMap = new Map<string, { shop: string; total: number; items: SaveTransactionPayload[] }>();

        items.forEach((item) => {
            const catKey = item.category?.trim() || "Others";
            const shopKey = item.shop?.trim() || catKey;

            if (!shopMap.has(shopKey)) {
                shopMap.set(shopKey, { shop: shopKey, total: 0, items: [] });
            }

            const shopData = shopMap.get(shopKey)!;
            shopData.total += item.amount;
            shopData.items.push(item);
        });

        return Array.from(shopMap.values()).sort((a, b) => b.total - a.total);
    }, [items]);

    if (isLoading) {
        return <LoadingData text={"Loading expenses..."} />;
    }

    const formattedDayStr = startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div style={commonStyles.column12}>
            {/* Header / Sticky Day Summary */}
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: theme.colors.bgElement || '#000',
                    padding: '10px 4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: `1px solid ${theme.colors.border || 'rgba(255,255,255,0.08)'}`,
                }}
            >
                <div style={{ fontSize: '14px', fontWeight: '700', color: theme.colors.textPrimary }}>
                    {formattedDayStr}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: theme.colors.textSecondary }}>
                    {formatCurrencyValue(dayTotal)} {currency.symbol}
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
                                        {isExpanded ? <ChevronDown/> : <ChevronRight/>}
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

                            {isExpanded && (
                                <div style={{ padding: '4px 16px 12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {shopGroup.items.map((item, idx) => (
                                        <TransactionRow
                                            key={`${item.shop}-${item.category}-${item.amount}-${idx}`}
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
                                            isLast={idx === shopGroup.items.length - 1}
                                            variant={"flat"}
                                            isInsideGroup={true}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};