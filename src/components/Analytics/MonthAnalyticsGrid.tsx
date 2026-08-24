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
import { commonStyles, theme, receiptStyles } from "../../App.styles.ts";
import { formatDateMMMMYYYY } from "../../utils/dateformatter.ts";
import type { Category, Currency } from "../../types/finance.ts";
import type { MonthlyAnalyticsResponse, MonthlyAnalyticsItem } from "../../services/api.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { LoadingData } from "../LoadingData.tsx";
import { NoAvailableData } from "../NoAvailableData.tsx";
import { getCategoryMeta } from "../../utils/categoryutils.ts";

interface MonthAnalyticsGridProps {
    outcomeCategories?: Category[];
    incomeCategories?: Category[];
    currency: Currency;
    monthlyData: MonthlyAnalyticsResponse | null;
    isLoading?: boolean;
}

export const MonthAnalyticsGrid: FC<MonthAnalyticsGridProps> = ({
                                                                    outcomeCategories = [],
                                                                    incomeCategories = [],
                                                                    currency,
                                                                    monthlyData,
                                                                    isLoading,
                                                                }) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [showRealOnly, setShowRealOnly] = useState<boolean>(false);

    const sortedMonths = useMemo(() => {
        if (!monthlyData?.months) return [];
        return [...monthlyData.months].sort((a, b) => a.month.localeCompare(b.month));
    }, [monthlyData]);

    // При загрузке данных устанавливаем выделение на последний (самый свежий) месяц
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

    const getOutcome = useCallback(
        (m: MonthlyAnalyticsItem) =>
            showRealOnly ? (m.realOutcomeTotal ?? m.totalOutcome ?? 0) : (m.totalOutcome ?? 0),
        [showRealOnly]
    );

    const totals = useMemo(() => {
        if (!monthlyData?.months) return { income: 0, outcome: 0, net: 0 };
        const income = monthlyData.months.reduce((acc, m) => acc + (m.totalIncome ?? 0), 0);
        const outcome = monthlyData.months.reduce((acc, m) => acc + getOutcome(m), 0);
        return { income, outcome, net: income - outcome };
    }, [monthlyData, getOutcome]);

    const chartData = useMemo(() => {
        if (!sortedMonths.length) return [];
        return sortedMonths.map((m) => {
            const date = parseMonthString(m.month);
            return {
                name: formatDateMMMMYYYY(date),
                shortName: date.toLocaleDateString('en-US', { month: 'short' }),
                income: m.totalIncome ?? 0,
                outcome: getOutcome(m),
            };
        });
    }, [sortedMonths, getOutcome]);

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
                            Cash Flow ({sortedMonths.length} Months)
                        </span>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: totals.net >= 0 ? theme.colors.success : theme.colors.danger, marginTop: '2px' }}>
                            {totals.net >= 0 ? '+' : ''}{formatAmount(totals.net)}
                        </div>
                    </div>

                    {/* Filter Chip */}
                    <div
                        style={{
                            display: 'flex',
                            backgroundColor: theme.colors.bgElement,
                            borderRadius: '20px',
                            padding: '3px',
                            border: `1px solid ${theme.colors.border}`,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setShowRealOnly(false)}
                            style={{
                                padding: '4px 12px',
                                borderRadius: '16px',
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
                                padding: '4px 12px',
                                borderRadius: '16px',
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
                            <strong style={{ fontSize: '13px', color: theme.colors.success }}>+{formatAmount(activeMonth.totalIncome ?? 0)}</strong>
                        </div>
                        <div>
                            <span style={{ fontSize: '11px', color: theme.colors.textSecondary, display: 'block' }}>Expenses</span>
                            <strong style={{ fontSize: '13px', color: theme.colors.danger }}>-{formatAmount(getOutcome(activeMonth))}</strong>
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
                        {activeMonth.outcomeCategories && activeMonth.outcomeCategories.length > 0 && (() => {
                            const filteredCategories = activeMonth.outcomeCategories
                                .filter((cat) => !showRealOnly || !cat.category.toLowerCase().includes('savings'))
                                .sort((a, b) => b.total - a.total);

                            const modalTotalOutcome = getOutcome(activeMonth);

                            return (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: theme.colors.danger, marginBottom: '8px', textTransform: 'uppercase' }}>
                                        Expenses ({formatAmount(modalTotalOutcome)})
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {filteredCategories.map((cat) => {
                                            const meta = getCategoryMeta(outcomeCategories, cat.category);
                                            const pct = modalTotalOutcome > 0 ? (cat.total / modalTotalOutcome) * 100 : 0;

                                            return (
                                                <div key={cat.category} style={{ ...receiptStyles.subChip, flexDirection: 'column', alignItems: 'stretch', padding: '8px 10px', backgroundColor: theme.colors.bgElement }}>
                                                    <div style={commonStyles.rowBetween}>
                                                        <div style={commonStyles.rowStart}>
                                                            <span style={{ fontSize: '14px' }}>{meta.icon}</span>
                                                            <span style={{ fontWeight: '600', fontSize: '12px', color: theme.colors.textPrimary }}>{meta.name}</span>
                                                        </div>
                                                        <span style={{ fontWeight: '700', fontSize: '12px', color: theme.colors.textPrimary }}>
                                                            {formatAmount(cat.total)}
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

                        {/* Income Breakdown */}
                        {activeMonth.incomeCategories && activeMonth.incomeCategories.length > 0 && (
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: theme.colors.success, marginBottom: '8px', textTransform: 'uppercase' }}>
                                    Income ({formatAmount(activeMonth.totalIncome ?? 0)})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {[...activeMonth.incomeCategories].sort((a, b) => b.total - a.total).map((cat) => {
                                        const meta = getCategoryMeta(incomeCategories, cat.category);
                                        const totalInc = activeMonth.totalIncome ?? 0;
                                        const pct = totalInc > 0 ? (cat.total / totalInc) * 100 : 0;

                                        return (
                                            <div key={cat.category} style={{ ...receiptStyles.subChip, flexDirection: 'column', alignItems: 'stretch', padding: '8px 10px', backgroundColor: theme.colors.bgElement }}>
                                                <div style={commonStyles.rowBetween}>
                                                    <div style={commonStyles.rowStart}>
                                                        <span style={{ fontSize: '14px' }}>{meta.icon}</span>
                                                        <span style={{ fontWeight: '600', fontSize: '12px', color: theme.colors.textPrimary }}>{meta.name}</span>
                                                    </div>
                                                    <span style={{ fontWeight: '700', fontSize: '12px', color: theme.colors.success }}>
                                                        +{formatAmount(cat.total)}
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