import { type FC, useState } from "react";
import { commonStyles, theme, receiptStyles } from "../../App.styles.ts";
import { formatDateMMMMYYYY } from "../../utils/dateformatter.ts";
import type { Category } from "../../types/finance.ts";
import type { MonthlyAnalyticsResponse } from "../../services/api.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import { X } from "lucide-react";
import {LoadingData} from "../LoadingData.tsx";
import {NoAvailableData} from "../NoAvailableData.tsx";
import {getCategoryMeta} from "../../utils/categoryutils.ts";

interface MonthAnalyticsGridProps {
    categories?: Category[];
    currency: string;
    monthlyData: MonthlyAnalyticsResponse | null;
    isLoading?: boolean;
}

export const MonthAnalyticsGrid: FC<MonthAnalyticsGridProps> = ({
                                                                    categories = [],
                                                                    currency,
                                                                    monthlyData,
                                                                    isLoading,
                                                                }) => {
    const [selectedMonthStr, setSelectedMonthStr] = useState<string | null>(null);

    if (isLoading) {
        return <LoadingData text="Loading monthly data..." />;
    }

    if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
        return <NoAvailableData/>;
    }

    const parseMonthString = (monthStr: string): Date => {
        const parts = monthStr.split('-');
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    };

    const grandTotal = monthlyData.months.reduce((acc, m) => acc + m.total, 0);
    const maxMonthTotal = Math.max(...monthlyData.months.map((m) => m.total), 1);

    const activeMonthData = selectedMonthStr
        ? monthlyData.months.find((m) => m.month === selectedMonthStr)
        : null;

    const activeMonthCategories = activeMonthData
        ? [...activeMonthData.categories].sort((a, b) => b.total - a.total)
        : [];

    return (
        <div style={commonStyles.column12}>
            {/* Grand Total Card */}
            <div style={{ ...commonStyles.card, padding: '14px 16px' }}>
                <div style={commonStyles.rowBetween}>
                    <div>
                        <div style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '700' }}>
                            GRAND TOTAL OUTCOME
                        </div>
                        <div style={{ fontSize: '13px', color: theme.colors.textPrimary, fontWeight: '600', marginTop: '2px' }}>
                            Across all {monthlyData.months.length} months
                        </div>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: theme.colors.textPrimary }}>
                        {formatCurrencyValue(grandTotal)} {currency}
                    </span>
                </div>
            </div>

            {/* Monthly Trend List */}
            <div style={commonStyles.card}>
                <span style={{ ...commonStyles.cardTitle, marginBottom: '12px', display: 'block' }}>
                    Monthly Expenses Trend
                </span>

                <div style={commonStyles.column10}>
                    {monthlyData.months.map((m) => {
                        const parsedDate = parseMonthString(m.month);
                        const percentage = (m.total / maxMonthTotal) * 100;
                        const isSelected = selectedMonthStr === m.month;

                        return (
                            <div
                                key={m.month}
                                onClick={() => setSelectedMonthStr(m.month)}
                                style={{
                                    ...receiptStyles.subChip,
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                    padding: '10px 12px',
                                    gap: '6px',
                                    backgroundColor: isSelected ? theme.colors.bgElement : theme.colors.bgCard,
                                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <div style={commonStyles.rowBetween}>
                                    <span style={{ fontWeight: '700', fontSize: '13px', color: theme.colors.textPrimary }}>
                                        {formatDateMMMMYYYY(parsedDate)}
                                    </span>
                                    <span style={{ fontWeight: '700', fontSize: '13px', color: theme.colors.textPrimary }}>
                                        {formatCurrencyValue(m.total)} {currency}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        width: '100%',
                                        height: '6px',
                                        backgroundColor: theme.colors.bgCard,
                                        borderRadius: '3px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${Math.min(percentage, 100)}%`,
                                            height: '100%',
                                            backgroundColor: theme.colors.primary,
                                            borderRadius: '3px',
                                            transition: 'width 0.3s ease',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal Dialog for Categories Breakdown */}
            {activeMonthData && (
                <div
                    onClick={() => setSelectedMonthStr(null)}
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
                            ...commonStyles.card,
                            width: '100%',
                            maxWidth: '380px',
                            position: 'relative',
                            padding: '16px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        }}
                    >
                        <button
                            onClick={() => setSelectedMonthStr(null)}
                            style={{
                                position: 'absolute',
                                top: '14px',
                                right: '14px',
                                background: 'transparent',
                                border: 'none',
                                color: theme.colors.textSecondary,
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10,
                            }}
                        >
                            <X size={18} />
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingRight: '24px' }}>
                            <span style={commonStyles.cardTitle}>
                                Categories for {formatDateMMMMYYYY(parseMonthString(activeMonthData.month))}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: theme.colors.primary }}>
                                {formatCurrencyValue(activeMonthData.total)} {currency}
                            </span>
                        </div>

                        <div style={commonStyles.column8}>
                            {activeMonthCategories.map((cat) => {
                                const meta = getCategoryMeta(categories, cat.category);
                                const catPercentage = activeMonthData.total > 0 ? (cat.total / activeMonthData.total) * 100 : 0;

                                return (
                                    <div
                                        key={cat.category}
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
                                            <div style={commonStyles.rowStart}>
                                                <span style={{ fontSize: '15px' }}>{meta.icon}</span>
                                                <span style={{ fontWeight: '600', fontSize: '13px', color: theme.colors.textPrimary }}>
                                                    {meta.name}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontWeight: '700', fontSize: '13px', color: theme.colors.textPrimary, marginRight: '6px' }}>
                                                    {formatCurrencyValue(cat.total)} {currency}
                                                </span>
                                                <span style={{ fontSize: '10px', color: theme.colors.textSecondary }}>
                                                    ({catPercentage.toFixed(1)}%)
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
                                                    width: `${Math.min(catPercentage, 100)}%`,
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
                </div>
            )}
        </div>
    );
};