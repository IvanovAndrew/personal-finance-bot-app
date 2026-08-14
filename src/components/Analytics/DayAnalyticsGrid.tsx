import { type FC, useMemo } from "react";
import { commonStyles, theme } from "../../App.styles.ts";
import { type SaveTransactionPayload } from "../../services/api.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import type {Category, Currency} from "../../types/finance.ts";
import {getCategoryMeta} from "../../utils/categoryutils.ts";
import {LoadingData} from "../LoadingData.tsx";
import {TransactionRow} from "../TransactionRow.tsx";

interface DayAnalyticsGridProps {
    startDate: Date;
    currency: Currency;
    categories?: Category[];
    items: SaveTransactionPayload[] | null;
    isLoading: boolean;
}

export const DayAnalyticsGrid: FC<DayAnalyticsGridProps> = ({
                                                                startDate,
                                                                currency,
                                                                categories = [],
                                                                items,
                                                                isLoading,
                                                            }) => {

    const dayTotal = useMemo(() => {
        return (items?? []).reduce((acc, curr) => acc + curr.amount, 0);
    }, [items]);

    const groupedByCategory = useMemo(() => {
        const map = new Map<string, { category: string; total: number; items: SaveTransactionPayload[] }>();

        (items?? []).forEach((item) => {
            const key = item.category || 'Others';
            const current = map.get(key) || { category: key, total: 0, items: [] };
            current.total += item.amount;
            current.items.push(item);
            map.set(key, current);
        });

        return Array.from(map.values()).sort((a, b) => b.total - a.total);
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

            {/* List of Transactions grouped by Category */}
            {groupedByCategory.length === 0 ? (
                <div style={{ ...commonStyles.card, textAlign: 'center', padding: '24px', color: theme.colors.textSecondary }}>
                    No expenses recorded for this day
                </div>
            ) : (
                groupedByCategory.map((group) => {
                    const meta = getCategoryMeta(categories, group.category);

                    return (
                        <div key={group.category} style={commonStyles.card}>
                            <div style={commonStyles.rowBetween}>
                                <div style={commonStyles.rowStart}>
                                    <span style={{ fontSize: '16px' }}>{meta.icon}</span>
                                    <span style={commonStyles.cardTitle}>{meta.name}</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '700', color: theme.colors.primary }}>
                                    {formatCurrencyValue(group.total)} {currency.symbol}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {group.items.map((item, idx) => (
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
                })
            )}
        </div>
    );
};