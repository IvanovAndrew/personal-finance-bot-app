import { type FC, useState } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { commonStyles, theme, receiptStyles } from "../../App.styles.ts";
import { formatDateMMMMYYYY } from "../../utils/dateformatter.ts";
import type { Category, Currency } from "../../types/finance.ts";
import type { MonthlyAnalyticsResponse, MonthlyAnalyticsItem } from "../../services/api.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { LoadingData } from "../LoadingData.tsx";
import { NoAvailableData } from "../NoAvailableData.tsx";
import { getCategoryMeta } from "../../utils/categoryutils.ts";

interface MonthAnalyticsGridProps {
    categories?: Category[];
    currency: Currency;
    monthlyData: MonthlyAnalyticsResponse | null;
    isLoading?: boolean;
}

export const MonthAnalyticsGrid: FC<MonthAnalyticsGridProps> = ({
                                                                    categories = [],
                                                                    currency,
                                                                    monthlyData,
                                                                    isLoading,
                                                                }) => {
    const [selectedMonth, setSelectedMonth] = useState<MonthlyAnalyticsItem | null>(null);
    const [showRealOnly, setShowRealOnly] = useState<boolean>(false);

    if (isLoading) {
        return <LoadingData text="Loading monthly data..." />;
    }

    if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
        return <NoAvailableData />;
    }

    const parseMonthString = (monthStr: string): Date => {
        const parts = monthStr.split('-');
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    };

    // Хелпер для получения нужной суммы расходов с учётом флага showRealOnly
    const getOutcome = (m: MonthlyAnalyticsItem) =>
        showRealOnly ? (m.realOutcomeTotal ?? m.totalOutcome ?? 0) : (m.totalOutcome ?? 0);

    // Общие итоги за весь период
    const grandTotalOutcome = monthlyData.months.reduce((acc, m) => acc + getOutcome(m), 0);
    const grandTotalIncome = monthlyData.months.reduce((acc, m) => acc + (m.totalIncome ?? 0), 0);
    const grandNetBalance = grandTotalIncome - grandTotalOutcome;

    // Максимальное значение для масштабирования прогресс-баров в списке
    const maxVal = Math.max(
        ...monthlyData.months.map((m) => Math.max(getOutcome(m), m.totalIncome ?? 0)),
        1
    );

    // Подготовка данных для Recharts (сортируем по возрастанию даты для корректного отображения тренда)
    const chartData = [...monthlyData.months]
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((m) => {
            const date = parseMonthString(m.month);
            return {
                name: formatDateMMMMYYYY(date),
                shortName: date.toLocaleDateString('en-US', { month: 'short' }),
                income: m.totalIncome ?? 0,
                outcome: getOutcome(m),
            };
        });

    return (
        <div style={commonStyles.column12}>

            {/* 1. Блок SVG Графика Recharts с Переключателем */}
            <div style={commonStyles.card}>
                <div style={commonStyles.rowBetween}>
                    <div>
                        <span style={commonStyles.cardTitle}>Income vs Expense Trend</span>
                        <div style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '600', marginTop: '2px' }}>
                            {monthlyData.months.length} months
                        </div>
                    </div>

                    {/* Переключатель Total / Real */}
                    <div
                        style={{
                            display: 'flex',
                            backgroundColor: theme.colors.bgElement,
                            borderRadius: '8px',
                            padding: '2px',
                            border: `1px solid ${theme.colors.border}`,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setShowRealOnly(false)}
                            style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                backgroundColor: !showRealOnly ? theme.colors.primary : 'transparent',
                                color: !showRealOnly ? '#ffffff' : theme.colors.textSecondary,
                            }}
                        >
                            Total
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowRealOnly(true)}
                            style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                backgroundColor: showRealOnly ? theme.colors.primary : 'transparent',
                                color: showRealOnly ? '#ffffff' : theme.colors.textSecondary,
                            }}
                        >
                            Real
                        </button>
                    </div>
                </div>

                <div style={{ width: '100%', height: 180, marginTop: '8px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.colors.success} stopOpacity={0.35} />
                                    <stop offset="95%" stopColor={theme.colors.success} stopOpacity={0.0} />
                                </linearGradient>
                                <linearGradient id="outcomeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.colors.danger} stopOpacity={0.35} />
                                    <stop offset="95%" stopColor={theme.colors.danger} stopOpacity={0.0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />

                            <XAxis
                                dataKey="shortName"
                                stroke={theme.colors.textSecondary}
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />

                            <YAxis
                                stroke={theme.colors.textSecondary}
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                            />

                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const incomeVal = (payload.find((p) => p.dataKey === 'income')?.value as number) || 0;
                                        const outcomeVal = (payload.find((p) => p.dataKey === 'outcome')?.value as number) || 0;

                                        return (
                                            <div
                                                style={{
                                                    backgroundColor: theme.colors.bgCard,
                                                    border: `1px solid ${theme.colors.border}`,
                                                    borderRadius: theme.radius.md,
                                                    padding: '8px 12px',
                                                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                                                }}
                                            >
                                                <div style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '700', marginBottom: '4px' }}>
                                                    {payload[0]?.payload?.name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: theme.colors.success, fontWeight: '700' }}>
                                                    Income: +{formatCurrencyValue(incomeVal)} {currency.symbol}
                                                </div>
                                                <div style={{ fontSize: '12px', color: theme.colors.danger, fontWeight: '700' }}>
                                                    Expense ({showRealOnly ? 'Real' : 'Total'}): -{formatCurrencyValue(outcomeVal)} {currency.symbol}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke={theme.colors.success}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#incomeGradient)"
                            />

                            <Area
                                type="monotone"
                                dataKey="outcome"
                                stroke={theme.colors.danger}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#outcomeGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Легенда */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.colors.success }} />
                        <span style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '600' }}>Income</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.colors.danger }} />
                        <span style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '600' }}>
                            Expense ({showRealOnly ? 'Real' : 'Total'})
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Общая сводка за период */}
            <div style={{ ...commonStyles.card, padding: '14px 16px' }}>
                <div style={commonStyles.column10}>
                    <div style={commonStyles.label}>
                        PERIOD SUMMARY ({showRealOnly ? 'REAL EXPENSES' : 'TOTAL EXPENSES'})
                    </div>

                    <div style={commonStyles.rowBetween}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <TrendingUp size={16} color={theme.colors.success} />
                            <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Total Income</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: theme.colors.success }}>
                            +{formatCurrencyValue(grandTotalIncome)} {currency.symbol}
                        </span>
                    </div>

                    <div style={commonStyles.rowBetween}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <TrendingDown size={16} color={theme.colors.danger} />
                            <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                                {showRealOnly ? 'Real Expense' : 'Total Expense'}
                            </span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: theme.colors.danger }}>
                            -{formatCurrencyValue(grandTotalOutcome)} {currency.symbol}
                        </span>
                    </div>

                    <div style={{ height: '1px', backgroundColor: theme.colors.border, margin: '2px 0' }} />

                    <div style={commonStyles.rowBetween}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: theme.colors.textPrimary }}>Net Balance</span>
                        <span
                            style={{
                                fontSize: '15px',
                                fontWeight: '800',
                                color: grandNetBalance >= 0 ? theme.colors.success : theme.colors.danger,
                            }}
                        >
                            {grandNetBalance >= 0 ? '+' : ''}{formatCurrencyValue(grandNetBalance)} {currency.symbol}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. Список месяцев */}
            <div style={commonStyles.card}>
                <span style={{ ...commonStyles.cardTitle, marginBottom: '8px', display: 'block' }}>
                    Monthly Details
                </span>

                <div style={commonStyles.column10}>
                    {monthlyData.months.map((m) => {
                        const parsedDate = parseMonthString(m.month);
                        const currentOutcome = getOutcome(m);
                        const incomePct = ((m.totalIncome ?? 0) / maxVal) * 100;
                        const outcomePct = (currentOutcome / maxVal) * 100;
                        const isSelected = selectedMonth?.month === m.month;

                        return (
                            <div
                                key={m.month}
                                onClick={() => setSelectedMonth(m)}
                                style={{
                                    ...receiptStyles.subChip,
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                    padding: '12px',
                                    gap: '8px',
                                    backgroundColor: isSelected ? theme.colors.bgElement : theme.colors.bgCard,
                                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <div style={commonStyles.rowBetween}>
                                    <span style={{ fontWeight: '700', fontSize: '14px', color: theme.colors.textPrimary }}>
                                        {formatDateMMMMYYYY(parsedDate)}
                                    </span>
                                    <span style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
                                        Net: <strong style={{ color: (m.totalIncome - currentOutcome) >= 0 ? theme.colors.success : theme.colors.danger }}>
                                            {formatCurrencyValue(m.totalIncome - currentOutcome)} {currency.symbol}
                                        </strong>
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {/* Income bar */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '10px', color: theme.colors.success, fontWeight: '700', width: '50px' }}>
                                            INCOME
                                        </span>
                                        <div style={{ flex: 1, height: '6px', backgroundColor: theme.colors.bgCard, borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min(incomePct, 100)}%`, height: '100%', backgroundColor: theme.colors.success, borderRadius: '3px' }} />
                                        </div>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: theme.colors.success, width: '75px', textAlign: 'right' }}>
                                            +{formatCurrencyValue(m.totalIncome)}
                                        </span>
                                    </div>

                                    {/* Outcome bar */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '10px', color: theme.colors.danger, fontWeight: '700', width: '50px' }}>
                                            EXPENSE
                                        </span>
                                        <div style={{ flex: 1, height: '6px', backgroundColor: theme.colors.bgCard, borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min(outcomePct, 100)}%`, height: '100%', backgroundColor: theme.colors.danger, borderRadius: '3px' }} />
                                        </div>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: theme.colors.danger, width: '75px', textAlign: 'right' }}>
                                            -{formatCurrencyValue(currentOutcome)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 4. Модальное окно категорий выбранного месяца */}
            {selectedMonth && (
                <div
                    onClick={() => setSelectedMonth(null)}
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
                            maxWidth: '400px',
                            position: 'relative',
                            padding: '16px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        }}
                    >
                        <button
                            onClick={() => setSelectedMonth(null)}
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

                        <div style={{ marginBottom: '14px' }}>
                            <span style={commonStyles.cardTitle}>
                                Breakdown for {formatDateMMMMYYYY(parseMonthString(selectedMonth.month))}
                            </span>
                        </div>

                        {/* Секция расходов */}
                        {selectedMonth.outcomeCategories && selectedMonth.outcomeCategories.length > 0 && (() => {
                            const filteredCategories = selectedMonth.outcomeCategories
                                .filter((cat) => !showRealOnly || !cat.category.toLowerCase().includes('savings'))
                                .sort((a, b) => b.total - a.total);

                            const modalTotalOutcome = showRealOnly
                                ? (selectedMonth.realOutcomeTotal ?? getOutcome(selectedMonth))
                                : selectedMonth.totalOutcome;

                            return (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: theme.colors.danger }}>
                                            EXPENSES ({formatCurrencyValue(modalTotalOutcome)} {currency.symbol})
                                        </span>
                                    </div>
                                    <div style={commonStyles.column8}>
                                        {filteredCategories.map((cat) => {
                                            const meta = getCategoryMeta(categories, cat.category);
                                            const pct = modalTotalOutcome > 0 ? (cat.total / modalTotalOutcome) * 100 : 0;

                                            return (
                                                <div key={cat.category} style={{ ...receiptStyles.subChip, flexDirection: 'column', alignItems: 'stretch', padding: '8px 10px', backgroundColor: theme.colors.bgElement }}>
                                                    <div style={commonStyles.rowBetween}>
                                                        <div style={commonStyles.rowStart}>
                                                            <span style={{ fontSize: '14px' }}>{meta.icon}</span>
                                                            <span style={{ fontWeight: '600', fontSize: '12px', color: theme.colors.textPrimary }}>{meta.name}</span>
                                                        </div>
                                                        <span style={{ fontWeight: '700', fontSize: '12px', color: theme.colors.textPrimary }}>
                                                            {formatCurrencyValue(cat.total)} {currency.symbol}
                                                        </span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '3px', backgroundColor: theme.colors.bgCard, borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                                                        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', backgroundColor: theme.colors.danger }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Секция доходов */}
                        {selectedMonth.incomeCategories && selectedMonth.incomeCategories.length > 0 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: theme.colors.success }}>
                                        INCOMES ({formatCurrencyValue(selectedMonth.totalIncome)} {currency.symbol})
                                    </span>
                                </div>
                                <div style={commonStyles.column8}>
                                    {[...selectedMonth.incomeCategories].sort((a, b) => b.total - a.total).map((cat) => {
                                        const meta = getCategoryMeta(categories, cat.category);
                                        const pct = selectedMonth.totalIncome > 0 ? (cat.total / selectedMonth.totalIncome) * 100 : 0;

                                        return (
                                            <div key={cat.category} style={{ ...receiptStyles.subChip, flexDirection: 'column', alignItems: 'stretch', padding: '8px 10px', backgroundColor: theme.colors.bgElement }}>
                                                <div style={commonStyles.rowBetween}>
                                                    <div style={commonStyles.rowStart}>
                                                        <span style={{ fontSize: '14px' }}>{meta.icon}</span>
                                                        <span style={{ fontWeight: '600', fontSize: '12px', color: theme.colors.textPrimary }}>{meta.name}</span>
                                                    </div>
                                                    <span style={{ fontWeight: '700', fontSize: '12px', color: theme.colors.success }}>
                                                        +{formatCurrencyValue(cat.total)} {currency.symbol}
                                                    </span>
                                                </div>
                                                <div style={{ width: '100%', height: '3px', backgroundColor: theme.colors.bgCard, borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                                                    <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', backgroundColor: theme.colors.success }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};