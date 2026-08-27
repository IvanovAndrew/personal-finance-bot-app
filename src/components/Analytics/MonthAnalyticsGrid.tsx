import { type FC, useState, useMemo, useCallback, useEffect } from "react";
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { commonStyles, theme } from "../../App.styles.ts";
import { formatDateMMMMYYYY } from "../../utils/dateformatter.ts";
import type { Category, Currency } from "../../types/finance.ts";
import type { MonthlyAnalyticsResponse, MonthlyAnalyticsItem } from "../../services/api.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { LoadingData } from "../LoadingData.tsx";
import { NoAvailableData } from "../NoAvailableData.tsx";
import {
    NOT_EVERYDAY_OUTCOME_CATEGORIES,
    SALARY_CATEGORY_CODE,
} from "../../constants/categories.ts";
import {ExpensesBreakdownGrid} from "../ExpensesBreakdownGrid.tsx";

interface MonthAnalyticsGridProps {
    outcomeCategories?: Category[];
    incomeCategories?: Category[];
    currency: Currency;
    monthlyData: MonthlyAnalyticsResponse | null;
    isLoading?: boolean;
}

export type MonthAnalyticsView = 'total' | 'real' | 'everyday';

export const MonthAnalyticsGrid: FC<MonthAnalyticsGridProps> = ({
                                                                    outcomeCategories = [],
                                                                    incomeCategories = [],
                                                                    currency,
                                                                    monthlyData,
                                                                    isLoading,
                                                                }) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<MonthAnalyticsView>('real');

    const sortedMonths = useMemo(() => {
        if (!monthlyData?.months) return [];
        return [...monthlyData.months].sort((a, b) => a.month.localeCompare(b.month));
    }, [monthlyData]);

    useEffect(() => {
        if (sortedMonths.length > 0) {
            setSelectedIndex(sortedMonths.length - 1);
        }
    }, [sortedMonths.length]);

    const activeMonth = sortedMonths[selectedIndex] || sortedMonths[sortedMonths.length - 1];

    const formatAmount = useCallback(
        (val: number) => `${formatCurrencyValue(val)} ${currency.symbol}`,
        [currency.symbol]
    );

    const parseMonthString = (monthStr: string): Date => {
        const parts = monthStr.split('-');
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    };

    const getCalculatedMonthValues = useCallback(
        (m: MonthlyAnalyticsItem) => {
            if (viewMode === 'total') {
                return {
                    income: m.totalIncome ?? 0,
                    outcome: m.totalOutcome ?? 0,
                };
            }

            if (viewMode === 'real') {
                return {
                    income: m.totalIncome ?? 0,
                    outcome: (m.outcomeCategories ?? [])
                        .filter((cat) => cat.category !== 'Savings' )
                        .reduce((sum, cat) => sum + cat.total, 0),
                };
            }

            const everydayIncome = (m.incomeCategories ?? [])
                .filter((cat) => cat.category === SALARY_CATEGORY_CODE)
                .reduce((sum, cat) => sum + cat.total, 0);

            const everydayOutcome = (m.outcomeCategories ?? [])
                .filter((cat) => !NOT_EVERYDAY_OUTCOME_CATEGORIES.has(cat.category))
                .reduce((sum, cat) => sum + cat.total, 0);

            return {
                income: everydayIncome,
                outcome: everydayOutcome,
            };
        },
        [viewMode]
    );

    const totals = useMemo(() => {
        if (!monthlyData?.months) return { income: 0, outcome: 0, net: 0 };
        return monthlyData.months.reduce(
            (acc, m) => {
                const { income, outcome } = getCalculatedMonthValues(m);
                acc.income += income;
                acc.outcome += outcome;
                acc.net += income - outcome;
                return acc;
            },
            { income: 0, outcome: 0, net: 0 }
        );
    }, [monthlyData, getCalculatedMonthValues]);

    const chartData = useMemo(() => {
        if (!sortedMonths.length) return [];
        return sortedMonths.map((m) => {
            const date = parseMonthString(m.month);
            const { income, outcome } = getCalculatedMonthValues(m);
            return {
                name: formatDateMMMMYYYY(date),
                shortName: date.toLocaleDateString('en-US', { month: 'short' }),
                income,
                outcome,
            };
        });
    }, [sortedMonths, getCalculatedMonthValues]);

    const activeMonthValues = useMemo(() => {
        if (!activeMonth) return { income: 0, outcome: 0 };
        return getCalculatedMonthValues(activeMonth);
    }, [activeMonth, getCalculatedMonthValues]);

    if (isLoading) {
        return <LoadingData text="Loading monthly data..." />;
    }

    if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
        return <NoAvailableData />;
    }

    return (
        <div style={{ ...commonStyles.column12, gap: '12px' }}>

            {/* 1. HERO GRAPH CARD */}
            <div style={commonStyles.card}>
                <div style={commonStyles.rowBetween}>
                    <div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            Cash Flow
                        </span>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: totals.net >= 0 ? theme.colors.success : theme.colors.danger, marginTop: '2px' }}>
                            {totals.net >= 0 ? '+' : ''}{formatAmount(totals.net)}
                        </div>
                    </div>

                    {/* Filter Chip (Total / Real / Everyday) */}
                    <div
                        style={{
                            display: 'flex',
                            backgroundColor: theme.colors.bgElement,
                            borderRadius: '20px',
                            padding: '3px',
                            border: `1px solid ${theme.colors.border}`,
                        }}
                    >
                        {(['total', 'real', 'everyday'] as const).map((mode) => {
                            const isActive = viewMode === mode;
                            return (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setViewMode(mode)}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: '16px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        textTransform: 'capitalize',
                                        backgroundColor: isActive ? theme.colors.primary : 'transparent',
                                        color: isActive ? '#ffffff' : theme.colors.textSecondary,
                                    }}
                                >
                                    {mode}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sub-totals in Header */}
                <div style={{ display: 'flex', gap: '16px', margin: '12px 0 16px 0', fontSize: '12px' }}>
                    <div>
                        <span style={{ color: theme.colors.textSecondary }}>Income: </span>
                        <strong style={{ color: theme.colors.success }}>+{formatAmount(totals.income)}</strong>
                    </div>
                    <div>
                        <span style={{ color: theme.colors.textSecondary }}>Expenses: </span>
                        <strong style={{ color: theme.colors.danger }}>-{formatAmount(totals.outcome)}</strong>
                    </div>
                </div>

                {/* Scrollable BarChart */}
                <div style={{ width: '100%', overflowX: 'auto', marginTop: '16px', paddingBottom: '8px' }}>
                    <BarChart
                        data={chartData}
                        width={Math.max(chartData.length * 48, 300)}
                        height={180}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
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
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                            wrapperStyle={{ pointerEvents: 'none' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const incomeVal = (payload.find((p) => p.dataKey === 'income')?.value as number) || 0;
                                    const outcomeVal = (payload.find((p) => p.dataKey === 'outcome')?.value as number) || 0;

                                    return (
                                        <div
                                            style={{
                                                backgroundColor: theme.colors.bgCard,
                                                border: `1px solid ${theme.colors.border}`,
                                                borderRadius: theme.radius?.md || '8px',
                                                padding: '8px 12px',
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                                            }}
                                        >
                                            <div style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '700', marginBottom: '4px' }}>
                                                {payload[0]?.payload?.name}
                                            </div>
                                            <div style={{ fontSize: '12px', color: theme.colors.success, fontWeight: '700' }}>
                                                Income: +{formatAmount(incomeVal)}
                                            </div>
                                            <div style={{ fontSize: '12px', color: theme.colors.danger, fontWeight: '700' }}>
                                                Expense: -{formatAmount(outcomeVal)}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="income"
                            radius={[4, 4, 0, 0]}
                            barSize={10}
                            onClick={(_, index) => setSelectedIndex(index)}
                        >
                            {chartData.map((_, index) => (
                                <Cell
                                    key={`inc-${index}`}
                                    fill={theme.colors.success}
                                    opacity={index === selectedIndex ? 1 : 0.35}
                                    cursor="pointer"
                                    onClick={() => setSelectedIndex(index)}
                                />
                            ))}
                        </Bar>
                        <Bar
                            dataKey="outcome"
                            radius={[4, 4, 0, 0]}
                            barSize={10}
                            onClick={(_, index) => setSelectedIndex(index)}
                        >
                            {chartData.map((_, index) => (
                                <Cell
                                    key={`out-${index}`}
                                    fill={theme.colors.danger}
                                    opacity={index === selectedIndex ? 1 : 0.35}
                                    cursor="pointer"
                                    onClick={() => setSelectedIndex(index)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </div>
            </div>

            {/* 2. ACTIVE MONTH CARD WITH CONTROLS */}
            {activeMonth && (
                <div style={commonStyles.card}>
                    <div style={commonStyles.rowBetween}>
                        <button
                            type="button"
                            disabled={selectedIndex === 0}
                            onClick={() => setSelectedIndex((prev) => Math.max(prev - 1, 0))}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: selectedIndex === 0 ? 'not-allowed' : 'pointer',
                                color: selectedIndex === 0 ? theme.colors.border : theme.colors.textPrimary,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.colors.textPrimary }}>
                            {formatDateMMMMYYYY(parseMonthString(activeMonth.month))}
                        </span>

                        <button
                            type="button"
                            disabled={selectedIndex === sortedMonths.length - 1}
                            onClick={() => setSelectedIndex((prev) => Math.min(prev + 1, sortedMonths.length - 1))}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: selectedIndex === sortedMonths.length - 1 ? 'not-allowed' : 'pointer',
                                color: selectedIndex === sortedMonths.length - 1 ? theme.colors.border : theme.colors.textPrimary,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-around', margin: '16px 0', padding: '12px', backgroundColor: theme.colors.bgElement, borderRadius: '8px' }}>
                        <div>
                            <span style={{ fontSize: '11px', color: theme.colors.textSecondary, display: 'block' }}>Income</span>
                            <strong style={{ fontSize: '13px', color: theme.colors.success }}>+{formatAmount(activeMonthValues.income)}</strong>
                        </div>
                        <div>
                            <span style={{ fontSize: '11px', color: theme.colors.textSecondary, display: 'block' }}>Expenses</span>
                            <strong style={{ fontSize: '13px', color: theme.colors.danger }}>-{formatAmount(activeMonthValues.outcome)}</strong>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: theme.colors.primary,
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        View Categories Breakdown
                    </button>
                </div>
            )}

            {/* 3. MODAL BREAKDOWN */}
            {isModalOpen && activeMonth && (
                <div
                    onClick={() => setIsModalOpen(false)}
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
                            padding: '20px 16px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'transparent',
                                border: 'none',
                                color: theme.colors.textSecondary,
                                cursor: 'pointer',
                            }}
                        >
                            <X size={18} />
                        </button>

                        <div style={{ marginBottom: '16px' }}>
                            <span style={{ fontSize: '15px', fontWeight: '700', color: theme.colors.textPrimary }}>
                                Breakdown for {formatDateMMMMYYYY(parseMonthString(activeMonth.month))}
                            </span>
                        </div>

                        {/* Expenses Breakdown */}
                        <ExpensesBreakdownGrid 
                            activeMonth={activeMonth} 
                            viewMode={viewMode} 
                            outcomeCategories={outcomeCategories} 
                            incomeCategories={incomeCategories} 
                            activeMonthValues={activeMonthValues} 
                            currency={currency}/>
                    </div>
                </div>
            )}
        </div>
    );
};