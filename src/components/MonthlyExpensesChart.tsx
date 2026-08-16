import React, { useState } from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';
import { theme } from '../App.styles';
import { formatDateMMMMYYYY } from '../utils/dateformatter';
import { formatCurrencyValue } from '../utils/numberformatter';
import type { MonthlyAnalyticsItem } from '../services/api';
import type { Currency } from '../types/finance';

interface ChartProps {
    months: MonthlyAnalyticsItem[];
    currency: Currency;
}

export const MonthlyExpensesChart: React.FC<ChartProps> = ({ months, currency }) => {
    const [showRealOnly, setShowRealOnly] = useState<boolean>(false);

    // Хелпер для определения суммы расходов
    const getOutcome = (m: MonthlyAnalyticsItem) =>
        showRealOnly ? (m.realOutcomeTotal ?? m.totalOutcome ?? 0) : (m.totalOutcome ?? 0);

    // Подготавливаем данные для Recharts
    const data = months.map((m) => {
        const parts = m.month.split('-');
        const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);

        return {
            name: formatDateMMMMYYYY(date),
            shortName: date.toLocaleDateString('en-US', { month: 'short' }),
            income: m.totalIncome ?? 0,
            outcome: getOutcome(m),
        };
    });

    return (
        <div style={{ width: '100%', marginTop: '8px' }}>
            {/* Переключатель режимов Total / Real */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
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

            <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            {/* Градиент для Доходов */}
                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.colors.success} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={theme.colors.success} stopOpacity={0.0} />
                            </linearGradient>

                            {/* Градиент для Расходов */}
                            <linearGradient id="outcomeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.colors.danger} stopOpacity={0.4} />
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
                            tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                        />

                        {/* Кастомный Tooltip */}
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

                        {/* Линия и Заливка Доходов */}
                        <Area
                            type="monotone"
                            dataKey="income"
                            stroke={theme.colors.success}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#incomeGradient)"
                        />

                        {/* Линия и Заливка Расходов */}
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
        </div>
    );
};