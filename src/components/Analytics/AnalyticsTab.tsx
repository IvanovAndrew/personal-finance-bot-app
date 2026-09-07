import {
    AlertCircle,
    Loader2,
    RefreshCw,
    RotateCcw
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { appStyles, commonStyles, receiptStyles, theme } from '../../App.styles';
import { EARLIEST_DATA_DATE } from "../../constants/data.ts";
import {
    type DailyAnalyticsResponse,
    financeApi,
    type MonthlyAnalyticsResponse,
    type SaveTransactionPayload,
    type SummaryResponse } from "../../services/api.ts";
import type { Category, Currency } from '../../types/finance';
import { CategoryAnalyticsGrid } from "./CategoryAnalyticsGrid.tsx";
import { DayAnalyticsGrid } from "./DayAnalyticsGrid.tsx";
import { MonthAnalyticsGrid } from "./MonthAnalyticsGrid.tsx";
import { SubCategoryAnalyticsGrid } from "./SubCategoryAnalyticsGrid.tsx";
import { SummaryAnalyticsGrid } from "./SummaryAnalyticsGrid.tsx";
import {AnalyticsHeader} from "./AnalyticsHeader.tsx";
import {AnalyticsSegmentedControl} from "../SegmentedControl.tsx";

interface AnalyticsTabProps {
    outcomeCategories: Category[];
    incomeCategories: Category[];
    currencies: Currency[];
}

export interface DailyGroup {
    date: Date;
    items: SaveTransactionPayload[];
}

type ViewMode = 'summary' | 'days' | 'months' | 'categories' | 'subcategories';

const STORAGE_KEYS = {
    CURRENCY: 'analytics_selected_currency',
    MONTH: 'analytics_selected_month',
};

const mapDailyResponseToGroups = (response: DailyAnalyticsResponse): DailyGroup[] => {
    if (!response || !Array.isArray(response.days)) {
        return [];
    }

    // Сортируем дни по убыванию (от свежих к старым)
    const sortedDays = [...response.days].sort(
        (a, b) => new Date(b.day).getTime() - new Date(a.day).getTime()
    );

    return sortedDays.map((dayItem) => {
        const items: SaveTransactionPayload[] = [];

        dayItem.shops?.forEach((shop) => {
            shop.categories?.forEach((cat) => {
                cat.subCategories?.forEach((sub) => {
                    items.push({
                        isOutcome: true,
                        date: dayItem.day,
                        category: cat.category,
                        subCategory: sub.subCategory,
                        shop: shop.name,
                        amount: sub.total,
                        currency: response.currency,
                    });
                });
            });
        });

        return {
            date: new Date(dayItem.day),
            items,
        };
    });
};

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

    // ----------------------------------------------------
    // Data states
    // ----------------------------------------------------
    const [summary, setSummary] = useState<SummaryResponse | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyAnalyticsResponse | null>(null);
    const [dailyAnchorDate, setDailyAnchorDate] = useState<Date>(new Date());

    // Infinite scroll
    const [dailyGroups, setDailyGroups] = useState<DailyGroup[]>([]);
    const [isFetchingMoreDays, setIsFetchingMoreDays] = useState<boolean>(false);
    const [hasMoreDays, setHasMoreDays] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Cache
    const summaryCache = useRef<Record<string, SummaryResponse>>({});
    const monthlyCache = useRef<Record<string, MonthlyAnalyticsResponse>>({});
    const dailyCache = useRef<Record<string, DailyGroup[]>>({});

    const abortControllerRef = useRef<AbortController | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const isToday = (day: Date) => day.toDateString() === new Date().toDateString();

    const handleCurrencyChange = (currency: Currency) => {
        setCurrencyCode(currency.name);
        localStorage.setItem(STORAGE_KEYS.CURRENCY, currency.name);
        setDailyGroups([]);
        setHasMoreDays(true);
    };

    const handleMonthChange = (newMonth: Date) => {
        setSelectedMonth(newMonth);
        localStorage.setItem(STORAGE_KEYS.MONTH, newMonth.toISOString());
    };

    const resetDailyToToday = () => {
        setDailyGroups([]);
        setDailyAnchorDate(new Date());
        setHasMoreDays(true);
    };

    // ----------------------------------------------------
    // Загрузка стартовых данных для режимов
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
                // Запрашиваем батч в 7 дней назад от dailyAnchorDate
                const endDate = dailyAnchorDate;
                const startDate = new Date(dailyAnchorDate);
                startDate.setDate(startDate.getDate() - 6);

                const rangeKey = `${currencyCode}_${startDate.toISOString().slice(0, 10)}_${endDate.toISOString().slice(0, 10)}`;

                if (!forceRefresh && dailyCache.current[rangeKey]) {
                    setDailyGroups(dailyCache.current[rangeKey]);
                    setError(null);
                    setIsLoading(false);
                    return;
                }

                const response = await financeApi.getDailyAnalytics({
                    startDate,
                    endDate,
                    currency: currencyCode,
                }, controller.signal);

                if (!controller.signal.aborted) {
                    const mappedGroups = mapDailyResponseToGroups(response);
                    dailyCache.current[rangeKey] = mappedGroups;
                    setDailyGroups(mappedGroups);
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

    // ----------------------------------------------------
    // Подгрузка следующего недельного блока (7 дней)
    // ----------------------------------------------------
    const fetchNextChunk = useCallback(async () => {
        if (isFetchingMoreDays || isLoading || viewMode !== 'days' || dailyGroups.length === 0) {
            return;
        }

        // Берём самую последнюю группу из массива (это самая старая загруженная дата благодаря сортировке)
        const lastGroup = dailyGroups[dailyGroups.length - 1];
        const lastDate = new Date(lastGroup.date);

        if (lastDate <= EARLIEST_DATA_DATE) {
            setHasMoreDays(false);
            return;
        }

        // Новая верхняя граница = 1 день ДО самой старой даты из текущего списка
        const endDate = new Date(lastDate);
        endDate.setDate(endDate.getDate() - 1);

        // Ниже граница = ещё минус 6 дней (итого 7 дней)
        let startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);

        if (startDate < EARLIEST_DATA_DATE) {
            startDate = new Date(EARLIEST_DATA_DATE);
        }

        // Если диапазон схлопнулся или вышел за границы
        if (endDate < startDate) {
            setHasMoreDays(false);
            return;
        }

        const startKey = startDate.toISOString().slice(0, 10);
        const endKey = endDate.toISOString().slice(0, 10);
        const cacheKey = `${currencyCode}_${startKey}_${endKey}`;

        const requestCurrency = currencyCode;
        const requestAnchorKey = dailyAnchorDate.toISOString().slice(0, 10);

        if (dailyCache.current[cacheKey]) {
            setDailyGroups(prev => [...(Array.isArray(prev) ? prev : []), ...dailyCache.current[cacheKey]]);
            return;
        }

        setIsFetchingMoreDays(true);

        try {
            const response = await financeApi.getDailyAnalytics({
                startDate,
                endDate,
                currency: requestCurrency,
            });

            const stillRelevant =
                requestCurrency === currencyCode &&
                requestAnchorKey === dailyAnchorDate.toISOString().slice(0, 10);

            if (stillRelevant) {
                const newGroups = mapDailyResponseToGroups(response);

                // Если API вернул пустой массив дней за период — останавливаем подгрузку дальше
                if (newGroups.length === 0 && startDate <= EARLIEST_DATA_DATE) {
                    setHasMoreDays(false);
                }

                dailyCache.current[cacheKey] = newGroups;

                setDailyGroups(prev => [...(Array.isArray(prev) ? prev : []), ...newGroups]);

                if (startDate <= EARLIEST_DATA_DATE) {
                    setHasMoreDays(false);
                }
            }
        } catch (err) {
            console.error('Failed to fetch next week analytics:', err);
        } finally {
            setIsFetchingMoreDays(false);
        }
    }, [dailyGroups, isFetchingMoreDays, isLoading, viewMode, currencyCode, dailyAnchorDate]);

    useEffect(() => {
        fetchAnalytics();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchAnalytics]);

    useEffect(() => {
        if (viewMode !== 'days' || !hasMoreDays) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextChunk();
                }
            },
            { rootMargin: '400px' }
        );

        const currentTarget = loadMoreRef.current;
        if (currentTarget) observer.observe(currentTarget);

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [viewMode, fetchNextChunk, hasMoreDays]);

    return (
        <div style={appStyles.tabContent}>

            <AnalyticsHeader 
                selectedCurrency={selectedCurrency} 
                currencies={currencies} 
                onCurrencyChange={handleCurrencyChange}
                selectedDate={selectedMonth} 
                onDateChange={handleMonthChange} />

            <AnalyticsSegmentedControl value={viewMode} onChange={setViewMode} />

            {/* Content Display */}
            {error && !isLoading ? (
                <div style={{
                    ...commonStyles.card,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '28px 16px',
                    textAlign: 'center',
                    gap: '12px',
                    borderColor: theme.colors.danger,
                }}>
                    <AlertCircle size={36} color={theme.colors.danger} />
                    <span style={{ fontSize: '14px', color: theme.colors.textPrimary, fontWeight: '600' }}>
                        {error}
                    </span>
                    <button
                        onClick={() => fetchAnalytics(true)}
                        style={{
                            ...receiptStyles.subChip,
                            padding: '8px 16px',
                            backgroundColor: theme.colors.bgElement,
                            borderColor: theme.colors.border,
                            color: theme.colors.textPrimary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                        }}
                    >
                        <RefreshCw size={14} />
                        <span>Retry</span>
                    </button>
                </div>
            ) : (
                <div style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.2s ease' }}>
                    {viewMode === 'summary' && (
                        <SummaryAnalyticsGrid currency={selectedCurrency} summary={summary} categories={outcomeCategories} isLoading={isLoading} />
                    )}

                    {/* Endless timeline */}
                    {viewMode === 'days' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {(dailyGroups || []).map((group) => (
                                <DayAnalyticsGrid
                                    key={group.date instanceof Date ? group.date.toISOString() : String(group.date)}
                                    startDate={new Date(group.date)}
                                    currency={selectedCurrency}
                                    categories={outcomeCategories}
                                    items={group.items || []}
                                    isLoading={false}
                                />
                            ))}

                            <div
                                ref={loadMoreRef}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '16px 0',
                                    minHeight: '40px',
                                }}
                            >
                                {isFetchingMoreDays && (
                                    <Loader2
                                        size={20}
                                        color={theme.colors.primary}
                                        style={{ animation: 'spin 1s linear infinite' }}
                                    />
                                )}
                                {!hasMoreDays && !isFetchingMoreDays && (
                                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>No earlier data</span>
                                )}
                            </div>
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
                            categories={outcomeCategories.filter(x => x.subCategories.length > 0)}
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
                        color: '#fff',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '10px 18px',
                        fontSize: '13px',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
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