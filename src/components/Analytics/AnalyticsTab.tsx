import {
    AlertCircle,
    RefreshCw,
    RotateCcw
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { appStyles, theme } from '../../App.styles';
import {
    type DailyExpensesResponse,
    financeApi,
    type MonthlyAnalyticsResponse, type ShopExpensesDto,
    type SummaryResponse
} from "../../services/api.ts";
import type { Category, Currency } from '../../types/finance';
import { CategoryAnalyticsGrid } from "./category/CategoryAnalyticsGrid.tsx";
import { MonthAnalyticsGrid } from "./monthly/MonthAnalyticsGrid.tsx";
import { SubCategoryAnalyticsGrid } from "./subcategory/SubCategoryAnalyticsGrid.tsx";
import { SummaryAnalyticsGrid } from "./summary/SummaryAnalyticsGrid.tsx";
import { AnalyticsHeader } from "./AnalyticsHeader.tsx";
import { AnalyticsSegmentedControl, type ViewMode } from "../AnalyticsSegmentedControl.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { Card } from "../../shared/ui/Card.tsx";
import { STORAGE_KEYS } from "../../constants/storageKeys.ts";
import { terms } from "../../constants/strings.ts";
import {TransactionsGrid} from "./daily/TransactionGrid.tsx";
import {useDailyTimeline} from "./daily/useDailyTimeline.ts";

export interface DailyGroup {
    date: Date;
    items: ShopExpensesDto[];
}

/**
 * Maps the API dictionary response Record<string, ShopExpensesDto[]>
 * into a sorted array of DailyGroup objects (ordered from newest to oldest date).
 */
const mapDailyResponseToGroups = (response: DailyExpensesResponse): DailyGroup[] => {
    if (!response) return [];

    return Object.entries(response)
        .map(([dateStr, items]) => ({
            date: new Date(dateStr),
            items,
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
};

interface AnalyticsTabProps {
    outcomeCategories: Category[];
    incomeCategories: Category[];
    currencies: Currency[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ outcomeCategories, incomeCategories, currencies }) => {

    const [currencyCode, setCurrencyCode] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEYS.CURRENCY) || currencies[0]?.name || 'AMD';
    });

    const selectedCurrency = useMemo(() => {
        const found = currencies.find(c => c.name === currencyCode);
        return found || currencies[0] || {
            name: 'AMD',
            symbol: '֏',
            format: 'С0',
            isPopular: true,
        };
    }, [currencies, currencyCode]);

    const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
        const savedMonth = localStorage.getItem(STORAGE_KEYS.MONTH);
        return savedMonth ? new Date(savedMonth) : new Date();
    });

    const [viewMode, setViewMode] = useState<ViewMode>('summary');

    const categoriesWithSubs = useMemo(
        () => outcomeCategories.filter((x) => x.subCategories.length > 0),
        [outcomeCategories]
    );

    // ----------------------------------------------------
    // Data states
    // ----------------------------------------------------
    const [summary, setSummary] = useState<SummaryResponse | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyAnalyticsResponse | null>(null);
    const [dailyAnchorDate, setDailyAnchorDate] = useState<Date>(new Date());

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Cache
    const summaryCache = useRef<Record<string, SummaryResponse>>({});
    const monthlyCache = useRef<Record<string, MonthlyAnalyticsResponse>>({});
    const dailyCache = useRef<Record<string, DailyGroup[]>>({});

    const abortControllerRef = useRef<AbortController | null>(null);

    const isToday = (day: Date) => day.toDateString() === new Date().toDateString();

    // The Daily timeline owns its data: it restarts by itself when the currency or the anchor day changes.
    const dailyTimeline = useDailyTimeline({ enabled: viewMode === 'days', currency: currencyCode, anchorDate: dailyAnchorDate });

    const handleCurrencyChange = (currency: Currency) => {
        setCurrencyCode(currency.name);
        localStorage.setItem(STORAGE_KEYS.CURRENCY, currency.name);
    };

    const handleMonthChange = (newDate: Date) => {
        
        if (viewMode === 'days') {
            setDailyAnchorDate(newDate)
        } else {
            setSelectedMonth(newDate);
            localStorage.setItem(STORAGE_KEYS.MONTH, newDate.toISOString());
        }
    };

    const resetDailyToToday = () => {
        setDailyAnchorDate(new Date());
    };

    // ----------------------------------------------------
    // Initial data fetch per view mode
    // ----------------------------------------------------
    const fetchAnalytics = useCallback(async (forceRefresh = false) => {
        const monthKey = `${selectedMonth.getFullYear()}-${selectedMonth.getMonth() + 1}`;
        const cacheKey = `${currencyCode}_${monthKey}`;

        if (!forceRefresh) {
            if (viewMode === 'summary' && summaryCache.current[cacheKey]) {
                setSummary(summaryCache.current[cacheKey]);
                setError(null);
                setIsLoading(false);
                return;
            }
            if (viewMode !== 'summary' && viewMode !== 'days' && monthlyCache.current[cacheKey]) {
                setMonthlyData(monthlyCache.current[cacheKey]);
                setError(null);
                setIsLoading(false);
                return;
            }
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        setError(null);

        try {
            if (viewMode === 'summary') {
                const data = await financeApi.getSummary({
                    monthDate: selectedMonth,
                    currency: currencyCode,
                }, controller.signal);

                if (!controller.signal.aborted) {
                    summaryCache.current[cacheKey] = data;
                    setSummary(data);
                }
            } else if (viewMode === 'days') {
                // Request a 7-day batch backwards starting from dailyAnchorDate
                const endDate = dailyAnchorDate;
                const startDate = new Date(dailyAnchorDate);
                startDate.setDate(startDate.getDate() - 6);

                const rangeKey = `${currencyCode}_${startDate.toISOString().slice(0, 10)}_${endDate.toISOString().slice(0, 10)}`;

                if (!forceRefresh && dailyCache.current[rangeKey]) {
                    setError(null);
                    setIsLoading(false);
                    return;
                }

                const response: DailyExpensesResponse = await financeApi.getDailyExpenses({
                    startDate,
                    endDate,
                    currency: currencyCode,
                }, controller.signal);

                if (!controller.signal.aborted) {
                    const mappedGroups = mapDailyResponseToGroups(response);
                    dailyCache.current[rangeKey] = mappedGroups;
                }
            } else {
                const data = await financeApi.getMonthlyAnalytics({
                    startMonth: selectedMonth,
                    currency: currencyCode,
                }, controller.signal);

                if (!controller.signal.aborted) {
                    monthlyCache.current[cacheKey] = data;
                    setMonthlyData(data);
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error && (err.name === 'AbortError' || err.message === 'Request was canceled.')) {
                return;
            }

            if (abortControllerRef.current === controller) {
                setError('Failed to load analytics');
                console.error('Analytics fetch error:', err);
            }
        } finally {
            if (abortControllerRef.current === controller) {
                setIsLoading(false);
            }
        }
    }, [viewMode, currencyCode, selectedMonth, dailyAnchorDate]);

    useEffect(() => {
        fetchAnalytics();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchAnalytics]);

    return (
        <div style={appStyles.tabContent}>

            <AnalyticsHeader
                selectedCurrency={selectedCurrency}
                currencies={currencies}
                onCurrencyChange={handleCurrencyChange}
                selectedDate={viewMode !== 'days' ? selectedMonth : dailyAnchorDate}
                onDateChange={handleMonthChange}
                showMonthPicker={viewMode !== 'days'}
            />

            <AnalyticsSegmentedControl value={viewMode} onChange={setViewMode} />

            {/* Content Display */}
            {error && !isLoading ? (
                <Card
                    padding="28px 16px"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}
                >
                    <AlertCircle size={36} color={theme.colors.danger} />
                    <span style={{ fontSize: '14px', color: theme.colors.textPrimary, fontWeight: '600' }}>
                        {error}
                    </span>
                    <Button variant="secondary" fullWidth={false} icon={<RefreshCw size={14} />} onClick={() => fetchAnalytics(true)}>
                        {terms.retry}
                    </Button>
                </Card>
            ) : (
                <div style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.2s ease' }}>
                    {viewMode === 'summary' && (
                        <SummaryAnalyticsGrid currency={selectedCurrency} summary={summary} categories={outcomeCategories} isLoading={isLoading} />
                    )}

                    {/* Endless timeline */}
                    {viewMode === 'days' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <TransactionsGrid
                                timeline={dailyTimeline}
                                currency={selectedCurrency}
                                categories={outcomeCategories}
                                anchorDate={dailyAnchorDate}
                            />
                        </div>
                    )}

                    {viewMode === 'months' && (
                        <MonthAnalyticsGrid
                            outcomeCategories={outcomeCategories}
                            incomeCategories={incomeCategories}
                            currency={selectedCurrency}
                            isLoading={isLoading}
                            monthlyData={monthlyData}
                        />
                    )}

                    {viewMode === 'categories' && (
                        <CategoryAnalyticsGrid
                            categories={outcomeCategories}
                            startMonth={selectedMonth}
                            monthlyData={monthlyData}
                            currency={selectedCurrency}
                            isLoading={isLoading}
                        />
                    )}

                    {viewMode === 'subcategories' && (
                        <SubCategoryAnalyticsGrid
                            categories={categoriesWithSubs}
                            monthlyData={monthlyData}
                            currency={selectedCurrency}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            )}

            {/* Sticky Reset Pill */}
            {viewMode === 'days' && !isToday(dailyAnchorDate) && (
                <button
                    onClick={resetDailyToToday}
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: theme.colors.primary,
                        color: theme.colors.onPrimary,
                        border: 'none',
                        borderRadius: theme.colors.radiusPill,
                        padding: '10px 18px',
                        fontSize: '13px',
                        fontWeight: '600',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        zIndex: 100,
                    }}
                >
                    <RotateCcw size={14} />
                    <span>Jump to Today</span>
                </button>
            )}
        </div>
    );
};