import {type FC, useCallback, useState} from "react";
import { commonStyles, theme } from "../../App.styles.ts";
import type {FutureExpense, SummaryResponse} from "../../services/api.ts";
import { formatDateDMMMMYYYY } from "../../utils/dateformatter.ts";
import { LoadingData } from "../LoadingData.tsx";
import { NoAvailableData } from "../NoAvailableData.tsx";
import type {Category, Currency} from "../../types/finance.ts";
import {getCategoryMeta, getSubCategoryName} from "../../utils/categoryutils.ts";

interface SummaryAnalyticsGridProps {
    currency: Currency;
    summary: SummaryResponse | null;
    categories: Category[];
    isLoading: boolean;
}

export const SummaryAnalyticsGrid: FC<SummaryAnalyticsGridProps> = ({
                                                                        currency,
                                                                        summary,
                                                                        categories,
                                                                        isLoading
                                                                    }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatAmount = useCallback(
        (val: number) => `${val.toLocaleString('ru-RU')} ${currency.symbol}`,
        [currency.symbol]
    );
    
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
        futureExpensesTotal,
        futureExpenses = [],
        realFreeMoney,
        dailyBudgetLimit,
        startPeriod,
        payday,
        daysUntilPayday,
    } = summary;

    

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
                        ⏱ <b>{daysUntilPayday} budget days</b> ({formatDateDMMMMYYYY(new Date(startPeriod))} to {formatDateDMMMMYYYY(new Date(payday))})
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

                <div
                    onClick={() => futureExpenses.length > 0 && setIsModalOpen(true)}
                    style={{
                        ...commonStyles.rowSpaceBetween,
                        cursor: futureExpenses.length > 0 ? 'pointer' : 'default',
                        padding: '4px 0',
                        borderRadius: '6px',
                        transition: 'opacity 0.2s',
                        userSelect: 'none'
                    }}
                >
                    <span style={{
                        fontSize: '13px',
                        color: theme.colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: futureExpenses.length > 0 ? 'underline' : 'none',
                        textDecorationStyle: 'dotted'
                    }}>
                        Upcoming Payments
                        {futureExpenses.length > 0 && (
                            <span style={{ fontSize: '11px', opacity: 0.7 }}>ⓘ</span>
                        )}
                    </span>
                    <span style={{ color: theme.colors.textSecondary, fontWeight: '600', fontSize: '14px' }}>
                        -{formatAmount(futureExpensesTotal)}
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

            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '16px'
                    }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        style={{
                            backgroundColor: theme.colors.bgCard,
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '360px',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Хедер модалки */}
                        <div style={{
                            padding: '16px',
                            borderBottom: `1px solid ${theme.colors.border}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontWeight: '700', fontSize: '16px', color: theme.colors.textPrimary }}>
                                Upcoming Payments
                            </span>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: theme.colors.textSecondary,
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    padding: '0 4px'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Список трат */}
                        <div style={{ overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {futureExpenses.map((exp: FutureExpense, idx: number) => {
                                const meta = getCategoryMeta(categories, exp.category || '');
                                const subName = exp.subCategory
                                    ? getSubCategoryName(categories, exp.category || '', exp.subCategory)
                                    : null;

                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 0',
                                            borderBottom: idx < futureExpenses.length - 1 ? `1px solid ${theme.colors.border}40` : 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                        {exp.name}
                    </span>
                                            <span style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
                        {meta?.name}{subName ? ` • ${subName}` : ''}
                    </span>
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.colors.danger }}>
                    -{formatAmount(exp.amount)}
                </span>
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