import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Calendar,
    PieChart,
    Layers,
    LayoutDashboard,
    Loader2,
    AlertCircle,
    RefreshCw,
    RotateCcw
} from 'lucide-react';
import { commonStyles, appStyles, receiptStyles, theme } from '../../App.styles';
import type { Category, Currency } from '../../types/finance';
import { DayAnalyticsGrid } from "./DayAnalyticsGrid.tsx";
import { CategoryAnalyticsGrid } from "./CategoryAnalyticsGrid.tsx";
import { CustomDatePicker } from "../CustomDatePicker.tsx";
import { SubCategoryAnalyticsGrid } from "./SubCategoryAnalyticsGrid.tsx";
import {
    financeApi,
    type SummaryResponse,
    type MonthlyAnalyticsResponse,
    type SaveTransactionPayload
} from "../../services/api.ts";
import { SummaryAnalyticsGrid } from "./SummaryAnalyticsGrid.tsx";
import { MonthAnalyticsGrid } from "./MonthAnalyticsGrid.tsx";

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

    // Infinitive scroll
    const [dailyGroups, setDailyGroups] = useState<DailyGroup[]>([]);
    const [isFetchingMoreDays, setIsFetchingMoreDays] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Cache
    const summaryCache = useRef<Record<string, SummaryResponse>>({});
    const monthlyCache = useRef<Record<string, MonthlyAnalyticsResponse>>({});
    const dailyCache = useRef<Record<string, SaveTransactionPayload[]>>({});

    const abortControllerRef = useRef<AbortController | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const isToday = (day: Date) => day.toDateString() === new Date().toDateString();

    const handleCurrencyChange = (currencyName: string) => {
        setCurrencyCode(currencyName);
        localStorage.setItem(STORAGE_KEYS.CURRENCY, currencyName);
        setDailyGroups([]);
    };

    const handleMonthChange = (newMonth: Date) => {
        setSelectedMonth(newMonth);
        localStorage.setItem(STORAGE_KEYS.MONTH, newMonth.toISOString());
    };

    const resetDailyToToday = () => {
        setDailyGroups([]);
        setDailyAnchorDate(new Date());
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
                // В режиме 'days' инициализируем ленту с сегодняшнего дня
                const dayKey = dailyAnchorDate.toISOString().slice(0, 10);
                const dailyKey = `${currencyCode}_${dayKey}`;

                const data = await financeApi.getDailyAnalytics({
                    date: dailyAnchorDate,
                    currency: currencyCode,
                }, controller.signal);

                if (!controller.signal.aborted) {
                    dailyCache.current[dailyKey] = data;
                    setDailyGroups([{ date: dailyAnchorDate, items: data }]);
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
    // Подгрузка следующего (предыдущего по календарю) дня
    // ----------------------------------------------------
    const fetchNextDay = useCallback(async () => {
        if (isFetchingMoreDays || isLoading || viewMode !== 'days' || dailyGroups.length === 0) {
            return;
        }

        const lastGroup = dailyGroups[dailyGroups.length - 1];
        const nextDate = new Date(lastGroup.date);
        nextDate.setDate(nextDate.getDate() - 1); // Шаг назад на 1 день

        const dayKey = nextDate.toISOString().slice(0, 10);
        const cacheKey = `${currencyCode}_${dayKey}`;

        if (dailyCache.current[cacheKey]) {
            setDailyGroups(prev => [...prev, { date: nextDate, items: dailyCache.current[cacheKey] }]);
            return;
        }

        setIsFetchingMoreDays(true);

        try {
            const data = await financeApi.getDailyAnalytics({
                date: nextDate,
                currency: currencyCode,
            });

            dailyCache.current[cacheKey] = data;
            setDailyGroups(prev => [...prev, { date: nextDate, items: data }]);
        } catch (err) {
            console.error('Failed to fetch next day analytics:', err);
        } finally {
            setIsFetchingMoreDays(false);
        }
    }, [dailyGroups, isFetchingMoreDays, isLoading, viewMode, currencyCode]);

    useEffect(() => {
        fetchAnalytics();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchAnalytics]);

    // Observer для подгрузки при прокрутке
    useEffect(() => {
        if (viewMode !== 'days') return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextDay();
                }
            },
            { rootMargin: '300px' }
        );

        const currentTarget = loadMoreRef.current;
        if (currentTarget) observer.observe(currentTarget);

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [viewMode, fetchNextDay]);

    return (
        <div style={appStyles.tabContent}>

            {/* Top Bar: Фильтры */}
            <div style={{ ...commonStyles.card, padding: '14px 16px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    alignItems: 'end',
                    width: '100%',
                }}>
                    {/* Currency Select */}
                    <div style={commonStyles.column6Full}>
                        <div style={commonStyles.rowBetween}>
                            <label style={commonStyles.label}>Currency</label>
                            {isLoading && (
                                <Loader2
                                    size={12}
                                    color={theme.colors.primary}
                                    style={{ animation: 'spin 1s linear infinite' }}
                                />
                            )}
                        </div>
                        <select
                            value={currencyCode}
                            onChange={(e) => handleCurrencyChange(e.target.value)}
                            style={{
                                ...commonStyles.inputControl,
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                paddingRight: '32px',
                            }}
                        >
                            {currencies?.map(c => (
                                <option key={c.name} value={c.name}>
                                    {c.name} {c.symbol ? `(${c.symbol})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Month Picker (Скрываем на вкладке Daily, так как там единая лента) */}
                    <div style={commonStyles.column6Full}>
                        <label style={commonStyles.label}>
                            {viewMode === 'days'
                                ? (isToday(dailyAnchorDate) ? 'Jump to date' : `Viewing from ${dailyAnchorDate.toLocaleDateString()}`)
                                : 'Start Month'}
                        </label>
                        <CustomDatePicker
                            selectedDate={viewMode === 'days' ? dailyAnchorDate : selectedMonth}
                            onChange={(newDate) => {
                                if (viewMode === 'days') {
                                    setDailyGroups([]); // Очищаем старую ленту
                                    setDailyAnchorDate(newDate); // Ставим новый «якорь»
                                } else {
                                    handleMonthChange(newDate);
                                }
                            }}
                            showMonthPicker={viewMode !== 'days'}
                        />
                    </div>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div style={commonStyles.column6Full}>
                {/* Upper row */}
                <div style={{
                    ...receiptStyles.mainTabs,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px',
                    padding: '4px',
                    boxSizing: 'border-box',
                    width: '100%'
                }}>
                    <button
                        onClick={() => setViewMode('summary')}
                        style={{
                            ...receiptStyles.mainTabBtn,
                            ...(viewMode === 'summary' ? receiptStyles.mainTabActive : {}),
                        }}
                    >
                        <LayoutDashboard size={14} />
                        <span>Summary</span>
                    </button>

                    <button
                        onClick={() => setViewMode('days')}
                        style={{
                            ...receiptStyles.mainTabBtn,
                            ...(viewMode === 'days' ? receiptStyles.mainTabActive : {}),
                        }}
                    >
                        <Calendar size={14} />
                        <span>Daily</span>
                    </button>

                    <button
                        onClick={() => setViewMode('months')}
                        style={{
                            ...receiptStyles.mainTabBtn,
                            ...(viewMode === 'months' ? receiptStyles.mainTabActive : {}),
                        }}
                    >
                        <Calendar size={14} />
                        <span>Monthly</span>
                    </button>
                </div>

                {/* Lower row */}
                <div style={{
                    ...receiptStyles.mainTabs,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '4px',
                    padding: '4px',
                    boxSizing: 'border-box',
                    width: '100%'
                }}>
                    <button
                        onClick={() => setViewMode('categories')}
                        style={{
                            ...receiptStyles.mainTabBtn,
                            ...(viewMode === 'categories' ? receiptStyles.mainTabActive : {}),
                        }}
                    >
                        <PieChart size={14} />
                        <span>Categories</span>
                    </button>

                    <button
                        onClick={() => setViewMode('subcategories')}
                        style={{
                            ...receiptStyles.mainTabBtn,
                            ...(viewMode === 'subcategories' ? receiptStyles.mainTabActive : {}),
                        }}
                    >
                        <Layers size={14} />
                        <span>Subcategories</span>
                    </button>
                </div>
            </div>

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

                    {/* Чистая бесконечная лента */}
                    {viewMode === 'days' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {dailyGroups.map((group) => (
                                <DayAnalyticsGrid
                                    key={group.date.toISOString()}
                                    startDate={group.date}
                                    currency={selectedCurrency}
                                    categories={outcomeCategories}
                                    items={group.items}
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