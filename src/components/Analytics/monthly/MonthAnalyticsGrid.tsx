import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { type FC, useCallback, useMemo, useState } from "react";

import { theme } from "../../../App.styles.ts";
import { terms } from "../../../constants/strings.ts";
import type { MonthlyAnalyticsResponse } from "../../../services/api.ts";
import type { Category, Currency } from "../../../types/finance.ts";
import { formatDateMMMMYYYY, formatMonth } from "../../../utils/dateformatter.ts";
import { formatCurrencyValue } from "../../../utils/numberformatter.ts";
import { parseMonthString } from "../../../utils/dateparser.ts";
import { type MonthMode } from "../../../utils/analyticUtils.ts";
import { formatPeriod } from "../../../utils/period.ts";
import { Amount } from "../../Amount.tsx";
import { Avatar } from "../../Avatar.tsx";
import { BottomSheet } from "../../../shared/ui/BottomSheet.tsx";
import { Button } from "../../../shared/ui/Button.tsx";
import { Card, Divider } from "../../../shared/ui/Card.tsx";
import { ChartComponent, type ChartDataItem } from "../../ChartComponent.tsx";
import { ExpensesBreakdownGrid } from "../../ExpensesBreakdownGrid.tsx";
import { HeroNumber } from "../../HeroNumber.tsx";
import { ListRow } from "../../ListRow.tsx";
import { LoadingData } from "../../../shared/ui/LoadingData.tsx";
import { NoAvailableData } from "../../../shared/ui/NoAvailableData.tsx";
import { SegmentedControl } from "../../SegmentedControl.tsx";
import { StatTile } from "../../StatTile.tsx";
import { buildMonthView, shiftMonth } from "./monthAnalytics.ts";

interface MonthAnalyticsGridProps {
    outcomeCategories?: Category[];
    incomeCategories?: Category[];
    currency: Currency;
    monthlyData: MonthlyAnalyticsResponse | null;
    isLoading?: boolean;
}

const MODE_OPTIONS: { value: MonthMode; label: string }[] = [
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
    // null = the latest month. Storing the month (not an index) keeps the selection valid when the data changes.
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<MonthMode>("real");

    const view = useMemo(
        () => buildMonthView(monthlyData?.months ?? [], viewMode, selectedMonth),
        [monthlyData, viewMode, selectedMonth]
    );
    const { sortedMonths, totals, points, activeIndex, activeMonth, activeValues: activeMonthValues } = view;

    const periodLabel = useMemo(() => formatPeriod(sortedMonths.map((m) => m.month)), [sortedMonths]);

    // View concern: labels for the chart.
    const chartData = useMemo<ChartDataItem[]>(
        () =>
            points.map((p) => {
                const date = parseMonthString(p.monthStr);
                return {
                    id: p.monthStr,
                    label: formatMonth(date),
                    subLabel: date.getFullYear().toString(),
                    fullName: formatDateMMMMYYYY(date),
                    value1: p.income,
                    value2: p.outcome,
                };
            }),
        [points]
    );

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
                    selectedIndex={activeIndex}
                    onSelect={(index) => setSelectedMonth(sortedMonths[index]?.month ?? null)}
                    showDualBar={true}
                    formatAmount={(val) => `${formatCurrencyValue(val, 'round')} ${currency.symbol}`}
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
                            disabled={activeIndex === 0}
                            onClick={() => setSelectedMonth(shiftMonth(sortedMonths, selectedMonth, -1))}
                        />
                        <span style={{ fontSize: 15, fontWeight: 600, color: theme.colors.textPrimary }}>
                            {activeMonthTitle}
                        </span>
                        <MonthNavButton
                            direction="next"
                            disabled={activeIndex === sortedMonths.length - 1}
                            onClick={() => setSelectedMonth(shiftMonth(sortedMonths, selectedMonth, 1))}
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
