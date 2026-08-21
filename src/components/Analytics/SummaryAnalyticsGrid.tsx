import {type FC, useCallback} from "react";
import { commonStyles, theme } from "../../App.styles.ts";
import type { SummaryResponse } from "../../services/api.ts";
import { formatDateDMMMMYYYY } from "../../utils/dateformatter.ts";
import { LoadingData } from "../LoadingData.tsx";
import { NoAvailableData } from "../NoAvailableData.tsx";
import type { Currency } from "../../types/finance.ts";

interface SummaryAnalyticsGridProps {
    currency: Currency;
    summary: SummaryResponse | null;
    isLoading: boolean;
}

export const SummaryAnalyticsGrid: FC<SummaryAnalyticsGridProps> = ({
                                                                        currency,
                                                                        summary,
                                                                        isLoading
                                                                    }) => {
    if (isLoading) {
        return <LoadingData text={"Loading data..."} />;
    }

    if (!summary) {
        return <NoAvailableData />;
    }

    const {
        totalIncome,
        totalOutcome,
        totalBalance,
        futureExpenses,
        realFreeMoney,
        dailyBudgetLimit,
        payday,
        daysUntilPayday,
    } = summary;

    const formatAmount = useCallback(
        (val: number) => `${val.toLocaleString('ru-RU')} ${currency.symbol}`,
        [currency.symbol]
    );

    return (
        <div style={{ ...commonStyles.column12, gap: '12px' }}>

            {/* HERO CARD: Clear Daily Budget */}
            <div
                style={{
                    backgroundColor: theme.colors.bgCard,
                    borderRadius: theme.radius.lg || '16px',
                    padding: '20px 16px',
                    border: `1px solid ${theme.colors.border}`,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                }}
            >
                <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: theme.colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                }}>
                    Daily Budget Limit
                </span>

                <div style={{ fontSize: '28px', fontWeight: '800', color: theme.colors.primary, margin: '2px 0' }}>
                    {formatAmount(dailyBudgetLimit)}
                </div>

                <div style={{ fontSize: '12px', color: theme.colors.textSecondary, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div>
                        ⏱ <b>{daysUntilPayday} days</b> (including today) until Payday
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.7 }}>
                        Payday: {formatDateDMMMMYYYY(new Date(payday))}
                    </div>
                </div>
            </div>

            {/* 2. DUAL CARDS: Spengings and Income are close (T-Bank Style) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ ...commonStyles.card, padding: '12px 14px' }}>
                    <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                        Income
                    </div>
                    <div style={{ color: theme.colors.success, fontWeight: '700', fontSize: '15px' }}>
                        +{formatAmount(totalIncome)}
                    </div>
                </div>

                <div style={{ ...commonStyles.card, padding: '12px 14px' }}>
                    <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                        Expenses
                    </div>
                    <div style={{ color: theme.colors.danger, fontWeight: '700', fontSize: '15px' }}>
                        -{formatAmount(totalOutcome)}
                    </div>
                </div>
            </div>

            {/* 3. BALANCE & SAFE TO SPEND: the main block */}
            <div style={{ ...commonStyles.card, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={commonStyles.rowSpaceBetween}>
                    <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                        Net Balance
                    </span>
                    <span style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: '14px' }}>
                        {formatAmount(totalBalance)}
                    </span>
                </div>

                <div style={commonStyles.rowSpaceBetween}>
                    <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                        Upcoming Payments
                    </span>
                    <span style={{ color: theme.colors.textSecondary, fontWeight: '600', fontSize: '14px' }}>
                        -{formatAmount(futureExpenses)}
                    </span>
                </div>

                <div style={{ height: '1px', backgroundColor: theme.colors.border }} />

                <div style={commonStyles.rowSpaceBetween}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: theme.colors.textPrimary }}>
                        Safe to Spend
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: theme.colors.success }}>
                        {formatAmount(realFreeMoney)}
                    </span>
                </div>
            </div>
        </div>
    );
};