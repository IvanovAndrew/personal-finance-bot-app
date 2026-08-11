import type {FC} from "react";
import {commonStyles, theme} from "../../App.styles.ts";
import type {SummaryResponse} from "../../services/api.ts";
import {formatDateDMMMMYYYY} from "../../utils/dateformatter.ts";
import {LoadingData} from "../LoadingData.tsx";
import {NoAvailableData} from "../NoAvailableData.tsx";

interface SummaryAnalyticsGridProps {
    summary: SummaryResponse | null;
    isLoading: boolean;
}

export const SummaryAnalyticsGrid: FC<SummaryAnalyticsGridProps> = ({ summary, isLoading }) => {
    if (isLoading) {
        return <LoadingData text={"Loading data..."}/>;
    }
    
    if (!summary){
        return <NoAvailableData/>
    }

    const formatAmount = (val: number) =>
        `${val.toLocaleString('ru-RU')} ${summary.currency}`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={commonStyles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={commonStyles.label}>Income</span>
                    <span style={{ color: theme.colors.success, fontWeight: '700' }}>
                        {formatAmount(summary.totalIncome)}
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={commonStyles.label}>Outcome</span>
                    <span style={{ color: theme.colors.danger, fontWeight: '700' }}>
                        {formatAmount(summary.totalOutcome)}
                    </span>
                </div>

                <div style={{ height: '1px', backgroundColor: theme.colors.border, margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ ...commonStyles.label, fontWeight: '600', color: theme.colors.textPrimary }}>
                        Total balance
                    </span>
                    <span style={{ color: theme.colors.textPrimary, fontWeight: '800' }}>
                        {formatAmount(summary.totalBalance)}
                    </span>
                </div>
            </div>

            <div style={commonStyles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={commonStyles.label}>Future expenses</span>
                    <span style={{ fontWeight: '600', color: theme.colors.textPrimary }}>
                        {formatAmount(summary.futureExpenses)}
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: theme.colors.textPrimary }}>
                        Real free money
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: theme.colors.success }}>
                        {formatAmount(summary.realFreeMoney)}
                    </span>
                </div>
            </div>

            <div
                style={{
                    backgroundColor: theme.colors.bgCard,
                    borderRadius: theme.radius.lg,
                    padding: '16px',
                    border: `1px solid ${theme.colors.border}`,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}
            >
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                    📅 {formatDateDMMMMYYYY(new Date(summary.startPeriod))} —— [{summary.daysUntilPayday} days] —— 💰 {formatDateDMMMMYYYY(new Date(summary.payday))} Payday
                </div>

                <div style={{ fontSize: '18px', fontWeight: '800', color: theme.colors.primary }}>
                    {formatAmount(summary.dailyBudgetLimit)}{' '}
                    <span style={{ fontSize: '13px', fontWeight: 'normal', color: theme.colors.textSecondary }}>
                        / day
                    </span>
                </div>
            </div>
        </div>
    );
}