import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Calendar,
    PieChart,
    Layers,
    LayoutDashboard,
    Loader2,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import { commonStyles, appStyles, receiptStyles, theme } from '../../App.styles';
import type { Category, Currency } from '../../types/finance';
import { DayAnalyticsGrid } from "./DayAnalyticsGrid.tsx";
import { CategoryAnalyticsGrid } from "./CategoryAnalyticsGrid.tsx";
import { CustomDatePicker } from "../CustomDatePicker.tsx";
import { SubCategoryAnalyticsGrid } from "./SubCategoryAnalyticsGrid.tsx";
import { financeApi, type SummaryResponse, type MonthlyAnalyticsResponse } from "../../services/api.ts";
import { SummaryAnalyticsGrid } from "./SummaryAnalyticsGrid.tsx";
import {MonthAnalyticsGrid} from "./MonthAnalyticsGrid.tsx";

interface AnalyticsTabProps {
    outcomeCategories: Category[];
    currencies: Currency[];
}

type ViewMode = 'summary' | 'days' | 'months' | 'categories' | 'subcategories';

const STORAGE_KEYS = {
    CURRENCY: 'analytics_selected_currency',
    MONTH: 'analytics_selected_month',
};

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ outcomeCategories, currencies }) => {

    // 1. Initialize state from localStorage to prevent fetching irrelevant default filters
    const [currencyCode, setCurrencyCode] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEYS.CURRENCY) || currencies[0]?.name || 'AMD';
    });

    const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
        const savedMonth = localStorage.getItem(STORAGE_KEYS.MONTH);
        return savedMonth ? new Date(savedMonth) : new Date();
    });

    const [viewMode, setViewMode] = useState<ViewMode>('summary');
    const [startDate, setStartDate] = useState<Date>(new Date());

    const [summary, setSummary] = useState<SummaryResponse | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyAnalyticsResponse | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const summaryCache = useRef<Record<string, SummaryResponse>>({});
    const monthlyCache = useRef<Record<string, MonthlyAnalyticsResponse>>({});
    
    const abortControllerRef = useRef<AbortController | null>(null);

    // Persist filter changes to localStorage
    const handleCurrencyChange = (newCurrency: string) => {
        setCurrencyCode(newCurrency);
        localStorage.setItem(STORAGE_KEYS.CURRENCY, newCurrency);
    };

    const handleMonthChange = (newMonth: Date) => {
        setSelectedMonth(newMonth);
        localStorage.setItem(STORAGE_KEYS.MONTH, newMonth.toISOString());
    };

    const fetchAnalytics = useCallback(async (forceRefresh = false) => {
        if (viewMode === 'days') return;

        const monthKey = `${selectedMonth.getFullYear()}-${selectedMonth.getMonth() + 1}`;
        const isSummaryMode = viewMode === 'summary';
        const cacheKey = `${currencyCode}_${monthKey}`;

        // 1. Проверяем кэш до создания нового HTTP-запроса
        if (!forceRefresh) {
            if (isSummaryMode && summaryCache.current[cacheKey]) {
                setSummary(summaryCache.current[cacheKey]);
                setError(null);
                setIsLoading(false);
                return;
            }
            if (!isSummaryMode && monthlyCache.current[cacheKey]) {
                setMonthlyData(monthlyCache.current[cacheKey]);
                setError(null);
                setIsLoading(false);
                return;
            }
        }

        // 2. Отменяем ПРЕДЫДУЩИЙ незавершенный сетевой запрос
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        setError(null); // Важно: всегда сбрасываем ошибку при старте запроса!

        try {
            if (isSummaryMode) {
                const data = await financeApi.getSummary({
                    monthDate: selectedMonth,
                    currency: currencyCode,
                }, controller.signal);

                // Записываем только если запрос не был отменен
                if (!controller.signal.aborted) {
                    summaryCache.current[cacheKey] = data;
                    setSummary(data);
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
            // Если запрос отменен вручную — просто игнорируем и НЕ ставим setError
            if (err instanceof Error && (err.name === 'AbortError' || err.message === 'Request was canceled.')) {
                return;
            }

            // Показываем ошибку только если это был текущий актуальный контроллер
            if (abortControllerRef.current === controller) {
                setError('Failed to load analytics');
                console.error('Analytics fetch error:', err);
            }
        } finally {
            if (abortControllerRef.current === controller) {
                setIsLoading(false);
            }
        }
    }, [viewMode, currencyCode, selectedMonth]);

    useEffect(() => {
        fetchAnalytics();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchAnalytics]);

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

            {/* Filter controls card */}
            <div style={{ ...commonStyles.card, padding: '14px 16px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    alignItems: 'end', // Выравнивает инпуты строго по нижней линии
                    width: '100%',
                }}>
                    {/* Currency */}
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

                    {/* Start Day / Month */}
                    <div style={commonStyles.column6Full}>
                        <label style={commonStyles.label}>
                            {viewMode === 'days' ? 'Start Day' : 'Start Month'}
                        </label>
                        <CustomDatePicker
                            selectedDate={viewMode === 'days' ? startDate : selectedMonth}
                            onChange={(date) => {
                                if (viewMode === 'days') {
                                    setStartDate(date);
                                } else {
                                    handleMonthChange(date);
                                }
                            }}
                            showMonthPicker={viewMode !== 'days'}
                        />
                    </div>
                </div>
            </div>

            {/* View Mode Tabs */}
            {/* View Mode Tabs */}
            <div style={commonStyles.column6Full}>
                {/* Upper row: Time periods */}
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

                {/* Lower row: Category breakdowns */}
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
                        <SummaryAnalyticsGrid summary={summary} isLoading={isLoading} />
                    )}

                    {viewMode === 'days' && (
                        <DayAnalyticsGrid
                            startDate={startDate}
                            currency={currencies.find(x => x.name == currencyCode) || currencies[0]}
                            categories={outcomeCategories}
                        />
                    )}

                    {viewMode === 'months' && (
                        <MonthAnalyticsGrid
                            categories={outcomeCategories}
                            currency={currencyCode}
                            isLoading={isLoading}
                            monthlyData={monthlyData}
                        />
                    )}

                    {viewMode === 'categories' && (
                        <CategoryAnalyticsGrid
                            categories={outcomeCategories}
                            startMonth={selectedMonth}
                            monthlyData={monthlyData}
                            currency={currencyCode}
                            isLoading={isLoading}
                        />
                    )}

                    {viewMode === 'subcategories' && (
                        <SubCategoryAnalyticsGrid
                            categories={outcomeCategories.filter(x => x.subCategories.length > 0)}
                            monthlyData={monthlyData}
                            currency={currencies.find(x => x.name == currencyCode) || currencies[0]}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            )}

        </div>
    );
};