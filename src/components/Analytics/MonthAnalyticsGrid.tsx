import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";

import { theme } from "../../App.styles.ts";
import { NOT_EVERYDAY_OUTCOME_CATEGORIES, SALARY_CATEGORY_CODE, SAVINGS_CATEGORY_CODE } from "../../constants/categories.ts";
import { terms } from "../../constants/strings.ts";
import type { MonthlyAnalyticsItem, MonthlyAnalyticsResponse } from "../../services/api.ts";
import type { Category, Currency } from "../../types/finance.ts";
import { formatDateMMMMYYYY, formatMonth } from "../../utils/dateformatter.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import { parseMonthString } from "../../utils/dateparser.ts";
import { formatPeriod } from "../../utils/period.ts";
import { Amount } from "../Amount.tsx";
import { Avatar } from "../Avatar.tsx";
import { BottomSheet } from "../BottomSheet.tsx";
import { Button } from "../Button.tsx";
import { Card, Divider } from "../Card.tsx";
import { ChartComponent, type ChartDataItem } from "../ChartComponent.tsx";
import { ExpensesBreakdownGrid } from "../ExpensesBreakdownGrid.tsx";
import { HeroNumber } from "../HeroNumber.tsx";
import { ListRow } from "../ListRow.tsx";
import { LoadingData } from "../LoadingData.tsx";
import { NoAvailableData } from "../NoAvailableData.tsx";
import { SegmentedControl } from "../SegmentedControl.tsx";
import { StatTile } from "../StatTile.tsx";

interface MonthAnalyticsGridProps {
    outcomeCategories?: Category[];
    incomeCategories?: Category[];
    currency: Currency;
    monthlyData: MonthlyAnalyticsResponse | null;
    isLoading?: boolean;
}

export type MonthAnalyticsView = "total" | "real" | "everyday";

const MODE_OPTIONS: { value: MonthAnalyticsView; label: string }[] = [
    { value: "total", label: "Total" },
    { value: "real", label: "Real" },
    { value: "everyday", label: "Everyday" },
];

interface MonthNavButtonProps {
    direction: "prev" | "next";
    disabled: boolean;
    onClick: () => void;
}

const MonthNavButton: FC<MonthNavButtonProps> = ({ direction, disabled, onClick }) => {
    const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            aria-label={direction === "prev" ? terms.previousMonth : terms.nextMonth}
            style={{
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                borderRadius: "50%",
                background: "transparent",
                color: theme.colors.textPrimary,
                opacity: disabled ? 0.3 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
            }}
        >
            <Icon size={20} />
        </button>
    );
};

export const MonthAnalyticsGrid: FC<MonthAnalyticsGridProps> = ({
                                                                    outcomeCategories = [],
                                                                    incomeCategories = [],
                                                                    currency,
                                                                    monthlyData,
                                                                    isLoading,
                                                                }) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<MonthAnalyticsView>("real");

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

    const periodLabel = useMemo(() => formatPeriod(sortedMonths.map((m) => m.month)), [sortedMonths]);

    const getCalculatedMonthValues = useCallback(
        (m: MonthlyAnalyticsItem) => {
            if (viewMode === "total") {
                return { income: m.totalIncome ?? 0, outcome: m.totalOutcome ?? 0 };
            }

            if (viewMode === "real") {
                return {
                    income: m.totalIncome ?? 0,
                    outcome: (m.outcomeCategories ?? [])
                        .filter((cat) => cat.category !== SAVINGS_CATEGORY_CODE)
                        .reduce((sum, cat) => sum + cat.total, 0),
                };
            }

            const everydayIncome = (m.incomeCategories ?? [])
                .filter((cat) => cat.category === SALARY_CATEGORY_CODE)
                .reduce((sum, cat) => sum + cat.total, 0);

            const everydayOutcome = (m.outcomeCategories ?? [])
                .filter((cat) => !NOT_EVERYDAY_OUTCOME_CATEGORIES.has(cat.category))
                .reduce((sum, cat) => sum + cat.total, 0);

            return { income: everydayIncome, outcome: everydayOutcome };
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

    const chartData = useMemo<ChartDataItem[]>(() => {
        return sortedMonths.map((m) => {
            const date = parseMonthString(m.month);
            const { income, outcome } = getCalculatedMonthValues(m);
            return {
                id: m.month,
                label: formatMonth(date),
                subLabel: date.getFullYear().toString(),
                fullName: formatDateMMMMYYYY(date),
                value1: income,
                value2: outcome,
            };
        });
    }, [sortedMonths, getCalculatedMonthValues]);

    const activeMonthValues = useMemo(() => {
        if (!activeMonth) return { income: 0, outcome: 0 };
        return getCalculatedMonthValues(activeMonth);
    }, [activeMonth, getCalculatedMonthValues]);

    const closeModal = useCallback(() => setIsModalOpen(false), []);

    if (isLoading) {
        return <LoadingData text="Loading monthly data..." />;
    }

    if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
        return <NoAvailableData />;
    }

    const activeMonthTitle = activeMonth ? formatDateMMMMYYYY(parseMonthString(activeMonth.month)) : "";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <HeroNumber
                heroLabel={`${terms.cashFlow} · ${periodLabel}`}
                heroValue={totals.net}
                currency={currency}
                signed
            />

            <SegmentedControl options={MODE_OPTIONS} selectedValue={viewMode} onChange={setViewMode} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <StatTile label={terms.income} value={totals.income} currency={currency} color={theme.colors.success} />
                <StatTile label={terms.expenses} value={-totals.outcome} currency={currency} color={theme.colors.danger} />
            </div>

            <Card padding={12}>
                <ChartComponent
                    data={chartData}
                    selectedIndex={selectedIndex}
                    onSelect={setSelectedIndex}
                    showDualBar={true}
                    formatAmount={(val) => `${formatCurrencyValue(val, currency.format)} ${currency.symbol}`}
                />
            </Card>

            {activeMonth && (
                <Card padding={0} style={{ overflow: "hidden" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 8px",
                        }}
                    >
                        <MonthNavButton
                            direction="prev"
                            disabled={selectedIndex === 0}
                            onClick={() => setSelectedIndex((prev) => Math.max(prev - 1, 0))}
                        />
                        <span style={{ fontSize: 15, fontWeight: 600, color: theme.colors.textPrimary }}>
                            {activeMonthTitle}
                        </span>
                        <MonthNavButton
                            direction="next"
                            disabled={selectedIndex === sortedMonths.length - 1}
                            onClick={() => setSelectedIndex((prev) => Math.min(prev + 1, sortedMonths.length - 1))}
                        />
                    </div>

                    <Divider />

                    <ListRow
                        avatar={
                            <Avatar
                                name={terms.income}
                                color={theme.colors.success}
                                background={theme.colors.surfacePressed}
                                icon={<ArrowDownLeft size={18} color={theme.colors.success} />}
                            />
                        }
                        title={terms.income}
                        right={<Amount value={activeMonthValues.income} currency={currency} size={15} signed color={theme.colors.success} />}
                    />
                    <Divider inset={68} />
                    <ListRow
                        avatar={
                            <Avatar
                                name={terms.expenses}
                                color={theme.colors.danger}
                                background={theme.colors.surfacePressed}
                                icon={<ArrowUpRight size={18} color={theme.colors.danger} />}
                            />
                        }
                        title={terms.expenses}
                        right={<Amount value={-activeMonthValues.outcome} currency={currency} size={15} signed color={theme.colors.danger} />}
                    />

                    <div style={{ padding: 16 }}>
                        <Button onClick={() => setIsModalOpen(true)}>{terms.categoriesBreakdown}</Button>
                    </div>
                </Card>
            )}

            {isModalOpen && activeMonth && (
                <BottomSheet title={`${terms.breakdownFor} · ${activeMonthTitle}`} onClose={closeModal}>
                    <ExpensesBreakdownGrid
                        activeMonth={activeMonth}
                        viewMode={viewMode}
                        outcomeCategories={outcomeCategories}
                        incomeCategories={incomeCategories}
                        activeMonthValues={activeMonthValues}
                        currency={currency}
                    />
                </BottomSheet>
            )}
        </div>
    );
};
