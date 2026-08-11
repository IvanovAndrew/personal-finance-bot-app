import { type FC, useEffect, useState, useMemo } from "react";
import { commonStyles, theme, receiptStyles } from "../../App.styles.ts";
import { financeApi, type SaveTransactionPayload } from "../../services/api.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import type {Category, Currency} from "../../types/finance.ts";
import {getCategoryMeta, getSubCategoryName} from "../../utils/categoryutils.ts";
import {LoadingData} from "../LoadingData.tsx";
import {ErrorData} from "../Error.tsx";

interface DayAnalyticsGridProps {
    startDate: Date;
    currency: Currency;
    categories?: Category[];
}

export const DayAnalyticsGrid: FC<DayAnalyticsGridProps> = ({
                                                                startDate,
                                                                currency,
                                                                categories = [],
                                                            }) => {
    const [items, setItems] = useState<SaveTransactionPayload[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadDailyData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await financeApi.getDailyAnalytics({
                    date: startDate,
                    currency: currency.name,
                });
                if (isMounted) {
                    setItems(data || []);
                }
            } catch (err) {
                if (isMounted) {
                    setError("Failed to load daily expenses");
                    console.error("Daily analytics fetch error:", err);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadDailyData();

        return () => {
            isMounted = false;
        };
    }, [startDate, currency]);

    const dayTotal = useMemo(() => {
        return items.reduce((acc, curr) => acc + curr.amount, 0);
    }, [items]);

    const groupedByCategory = useMemo(() => {
        const map = new Map<string, { category: string; total: number; items: SaveTransactionPayload[] }>();

        items.forEach((item) => {
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

    if (error) {
        return <ErrorData error={error} />;
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
                            {/* Category Header */}
                            <div style={commonStyles.rowBetween}>
                                <div style={commonStyles.rowStart}>
                                    <span style={{ fontSize: '16px' }}>{meta.icon}</span>
                                    <span style={commonStyles.cardTitle}>{meta.name}</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '700', color: theme.colors.primary }}>
                                    {formatCurrencyValue(group.total)} {currency.symbol}
                                </span>
                            </div>

                            {/* Items inside this Category */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {group.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            ...receiptStyles.subChip,
                                            justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            backgroundColor: theme.colors.bgElement,
                                            borderRadius: theme.radius.md,
                                            border: `1px solid ${theme.colors.border}`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '70%' }}>
                                            <span style={{
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: theme.colors.textPrimary,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {item.description}
                                            </span>
                                            {item.subCategory && (
                                                <span style={{ fontSize: '10px', color: theme.colors.textSecondary }}>
                                                    {getSubCategoryName(categories, item.category, item.subCategory)}
                                                </span>
                                            )}
                                        </div>

                                        <span style={{ fontSize: '12px', fontWeight: '700', color: theme.colors.textPrimary }}>
                                            {formatCurrencyValue(item.amount)} {currency.symbol}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};