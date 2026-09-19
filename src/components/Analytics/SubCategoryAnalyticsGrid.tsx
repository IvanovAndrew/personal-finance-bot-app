import { ChevronRight } from "lucide-react";
import { type CSSProperties, type FC, useCallback, useMemo, useState } from "react";

import { commonStyles, theme } from "../../App.styles.ts";
import type { MonthlyAnalyticsResponse } from "../../services/api.ts";
import type { Category, Currency } from "../../types/finance.ts";
import {formatDateMMMMYYYY, formatMonth, formatMonthYear} from "../../utils/dateformatter.ts";
import { parseMonthString } from "../../utils/dateparser.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import { NBSP, terms } from "../../constants/strings.ts";
import { CategorySwitcherModal } from "../CategorySwitcherModal.tsx";
import { ChartComponent, type ChartDataItem } from "../ChartComponent.tsx";
import { LoadingData } from "../LoadingData.tsx";
import {Avatar} from "../Avatar.tsx";

// Muted multi-hue palette for subcategories. Turquoise is intentionally absent,
// it is reserved for interactive / active states.
const PALETTE = [
    "#F5B942", // amber
    "#EF6C57", // coral
    "#8B7CF6", // violet
    "#5B9DF9", // blue
    "#E879A6", // pink
    "#9BC25A", // lime
    "#F2994A", // orange
    "#7C8CA5", // slate
];

// All new UI strings live here so the language can be switched in one place.

const formatShare = (share: number): string => {
    if (share <= 0) return `0${NBSP}%`;
    if (share < 0.01) return terms.lessThanOne;
    return `${Math.round(share * 100)}${NBSP}%`;
};

// ---------------------------------------------------------------------------
// Small presentational pieces
// ---------------------------------------------------------------------------
const Amount: FC<{ value: number; currency: Currency; size: number; weight?: number }> = ({
                                                                                              value,
                                                                                              currency,
                                                                                              size,
                                                                                              weight = 700,
                                                                                          }) => (
    <span
        style={{
            fontSize: size,
            fontWeight: weight,
            color: theme.colors.textPrimary,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
        }}
    >
        {formatCurrencyValue(value, currency.format)}
        <span style={{ color: theme.colors.textSecondary, fontWeight: 600, marginLeft: NBSP }}>
            {NBSP}{currency.symbol}
        </span>
    </span>
);

interface SubRowProps {
    name: string;
    color: string;
    share: number;
    total: number;
    currency: Currency;
    onClick: () => void;
}

const SubRow: FC<SubRowProps> = ({ name, color, share, total, currency, onClick }) => {
    const [pressed, setPressed] = useState(false);
    return (
        <button
            type="button"
            onClick={onClick}
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => setPressed(false)}
            onPointerLeave={() => setPressed(false)}
            onPointerCancel={() => setPressed(false)}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "12px 16px",
                background: pressed ? theme.colors.surfacePressed : "transparent",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                font: "inherit",
                transition: "background-color 0.15s ease",
            }}
        >
            <Avatar name={name} color={color} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: theme.colors.textPrimary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {name}
                </div>
                <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>
                    {formatShare(share)}
                </div>
            </div>
            <Amount value={total} currency={currency} size={15} />
            <ChevronRight size={16} color={theme.colors.textSecondary} style={{ flex: "0 0 auto" }} />
        </button>
    );
};

const pillStyle = (active: boolean): CSSProperties => ({
    border: "none",
    borderRadius: theme.colors.radiusPill,
    background: active ? theme.colors.primary : "transparent",
    color: active ? theme.colors.onPrimary : theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.2s ease, color 0.2s ease",
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface SubCategoryAnalyticsGridProps {
    categories: Category[];
    currency: Currency;
    monthlyData: MonthlyAnalyticsResponse | null;
    isLoading: boolean;
}

export const SubCategoryAnalyticsGrid: FC<SubCategoryAnalyticsGridProps> = ({
                                                                                categories,
                                                                                currency,
                                                                                monthlyData,
                                                                                isLoading,
                                                                            }) => {
    const [selectedCategoryCode, setSelectedCategoryCode] = useState<string | null>(null);

    const selectedCategory = useMemo(
        () => categories.find((c) => c.code === selectedCategoryCode) || categories[0] || null,
        [categories, selectedCategoryCode]
    );
    const [selectedSubCatId, setSelectedSubCatId] = useState<string | null>(null);
    const [subCatViewType, setSubCatViewType] = useState<"total" | "monthly">("total");
    const [selectedChartIndex, setSelectedChartIndex] = useState<number>(-1);

    const formatAmount = useCallback(
        (val: number) => `${formatCurrencyValue(val, currency.format)} ${currency.symbol}`,
        [currency]
    );

    const subCategoryTotalsMap = useMemo(() => {
        const map = new Map<string, number>();
        if (!monthlyData?.months) return map;

        const catCode = selectedCategory?.code?.toLowerCase();

        monthlyData.months.forEach((m) => {
            const catData = m.outcomeCategories.find((c) => c.category.toLowerCase() === catCode);
            if (catData?.subCategories) {
                catData.subCategories.forEach((sc) => {
                    const key = (sc.subCategory || "other").toLowerCase();
                    map.set(key, (map.get(key) || 0) + sc.total);
                });
            }
        });

        return map;
    }, [monthlyData, selectedCategory]);

    const sortedSubCategories = useMemo(() => {
        const list = selectedCategory?.subCategories || [];
        const totalOf = (code: string) => subCategoryTotalsMap.get(code.toLowerCase()) || 0;
        return [...list].sort((a, b) => totalOf(b.code) - totalOf(a.code));
    }, [selectedCategory, subCategoryTotalsMap]);

    // Rows for the list and the share bar. Shares are relative to the sum of the
    // listed subcategories so that they always add up to 100 %.
    const { rows, grandTotal } = useMemo(() => {
        const raw = sortedSubCategories.map((sub, i) => ({
            sub,
            total: subCategoryTotalsMap.get(sub.code.toLowerCase()) || 0,
            color: PALETTE[i % PALETTE.length],
        }));
        const sum = raw.reduce((s, r) => s + r.total, 0);
        return {
            grandTotal: sum,
            rows: raw.map((r) => ({ ...r, share: sum > 0 ? r.total / sum : 0 })),
        };
    }, [sortedSubCategories, subCategoryTotalsMap]);

    const activeSubCatCode = selectedSubCatId || sortedSubCategories[0]?.code || null;
    const activeSub = sortedSubCategories.find((s) => s.code === activeSubCatCode) || null;

    const getSubcategoryMonthlyTotal = (monthStr: string, subCode: string | null): number => {
        if (!subCode || !monthlyData?.months) return 0;

        const monthData = monthlyData.months.find((m) => m.month === monthStr);
        if (!monthData) return 0;

        const catData = monthData.outcomeCategories.find(
            (c) => c.category.toLowerCase() === selectedCategory?.code?.toLowerCase()
        );

        const subData = catData?.subCategories?.find(
            (sc) => (sc.subCategory || "other").toLowerCase() === subCode.toLowerCase()
        );

        return subData?.total || 0;
    };

    // Months ascending, so the chart reads left to right
    const sortedMonths = useMemo(() => {
        if (!monthlyData?.months) return [];
        return [...monthlyData.months].sort((a, b) => a.month.localeCompare(b.month));
    }, [monthlyData]);

    const periodLabel = useMemo(() => {
        if (!sortedMonths.length) return "";
        const first = formatMonthYear(parseMonthString(sortedMonths[0].month));
        const last = formatMonthYear(parseMonthString(sortedMonths[sortedMonths.length - 1].month));
        return first === last ? first : `${first} — ${last}`;
    }, [sortedMonths]);

    const chartData: ChartDataItem[] = useMemo(() => {
        if (!sortedMonths.length || !activeSubCatCode) return [];
        return sortedMonths.filter(m => getSubcategoryMonthlyTotal(m.month, activeSubCatCode) > 0).map((m) => {
            const date = parseMonthString(m.month);
            const total = getSubcategoryMonthlyTotal(m.month, activeSubCatCode);
            return {
                id: m.month,
                label: formatMonth(date),
                subLabel: String(date.getFullYear()),
                fullName: formatDateMMMMYYYY(date),
                value1: total,
            };
        });
    }, [sortedMonths, activeSubCatCode, selectedCategory]);

    if (isLoading) {
        return <LoadingData text={"Loading data..."} />;
    }

    if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
        return (
            <div style={{ ...commonStyles.card, textAlign: "center", padding: "20px", color: theme.colors.textSecondary }}>
                No analytics data available
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div style={{ ...commonStyles.card, textAlign: "center", padding: "20px", color: theme.colors.textSecondary }}>
                No categories with subcategories available
            </div>
        );
    }

    const handleSelectSubCategory = (subCode: string) => {
        setSelectedSubCatId(subCode);
        setSelectedChartIndex(-1);
        setSubCatViewType("monthly");
    };

    // Hero number: the whole category for "Total", the chosen bar or the sum for "Monthly"
    const selectedBar = selectedChartIndex >= 0 ? chartData[selectedChartIndex] : undefined;
    const heroValue =
        subCatViewType === "total"
            ? grandTotal
            : selectedBar
                ? selectedBar.value1
                : chartData.reduce((s, d) => s + d.value1, 0);
    const heroLabel =
        subCatViewType === "total"
            ? `${terms.expenses} · ${periodLabel}`
            : selectedBar
                ? `${activeSub?.name ?? ""} · ${selectedBar.fullName}`
                : `${activeSub?.name ?? ""} · ${periodLabel}`;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <CategorySwitcherModal
                categories={categories}
                availableCategories={categories}
                selectedCategoryCode={selectedCategory?.code}
                enableSubCategorySelection={false}
                onSelectCategory={(code) => {
                    setSelectedCategoryCode(code);
                    setSelectedSubCatId(null);
                    setSelectedChartIndex(-1);
                }}
            />

            {/* Hero number */}
            <div style={{ padding: "0 4px" }}>
                <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>{heroLabel}</div>
                <div style={{ marginTop: 2, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                    <Amount value={heroValue} currency={currency} size={34} />
                </div>
            </div>

            {/* Segmented control: filled pill, no outline */}
            <div
                style={{
                    display: "flex",
                    padding: 4,
                    gap: 4,
                    background: theme.colors.surface,
                    borderRadius: theme.colors.radiusPill,
                }}
            >
                {(["total", "monthly"] as const).map((mode) => (
                    <button
                        key={mode}
                        type="button"
                        onClick={() => setSubCatViewType(mode)}
                        style={{ ...pillStyle(subCatViewType === mode), flex: 1, padding: "10px 0" }}
                    >
                        {mode === "total" ? terms.total : terms.monthly}
                    </button>
                ))}
            </div>

            {/* TOTAL: share bar + one grouped list */}
            {subCatViewType === "total" && (
                <>
                    {grandTotal > 0 && (
                        <div style={{ display: "flex", gap: 2, height: 8, borderRadius: theme.colors.radiusPill, overflow: "hidden" }}>
                            {rows
                                .filter((r) => r.total > 0)
                                .map((r) => (
                                    <div
                                        key={r.sub.code}
                                        style={{ flex: `${r.total} 1 0`, minWidth: 4, background: r.color }}
                                    />
                                ))}
                        </div>
                    )}

                    <div style={{ background: theme.colors.surface, borderRadius: theme.colors.radiusCard, overflow: "hidden" }}>
                        {rows.filter(r => r.total > 0).map((r, i) => (
                            <div key={r.sub.code}>
                                {i > 0 && (
                                    <div style={{ height: 1, marginLeft: 68, background: theme.colors.border, opacity: 0.6 }} />
                                )}
                                <SubRow
                                    name={r.sub.name}
                                    color={r.color}
                                    share={r.share}
                                    total={r.total}
                                    currency={currency}
                                    onClick={() => handleSelectSubCategory(r.sub.code)}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* MONTHLY: scrolling chips + chart */}
            {subCatViewType === "monthly" && (
                <>
                    {chartData.length > 0 && (
                        <div style={{ background: theme.colors.surface, borderRadius: theme.colors.radiusCard, padding: 12 }}>
                            <ChartComponent
                                data={chartData}
                                selectedIndex={selectedChartIndex}
                                onSelect={setSelectedChartIndex}
                                showDualBar={false}
                                formatAmount={formatAmount}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
