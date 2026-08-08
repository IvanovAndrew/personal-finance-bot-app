import React, {useCallback, useEffect, useState} from 'react';
import {
    Calendar,
    PieChart,
    Layers, LayoutDashboard, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import {commonStyles, appStyles, receiptStyles, statusModalStyles, theme} from '../../App.styles';
import type {Category, Currency} from '../../types/finance';
import {DayAnalyticsGrid} from "./DayAnalyticsGrid.tsx";
import {CategoryAnalyticsGrid} from "./CategoryAnalyticsGrid.tsx";
import {CustomDatePicker} from "../CustomDatePicker.tsx";
import {SubCategoryAnalyticsGrid} from "./SubCategoryAnalyticsGrid.tsx";
import {financeApi, type SummaryResponse} from "../../services/api.ts";
import {SummaryAnalyticsGrid} from "./SummaryAnalyticsGrid.tsx";

interface AnalyticsTabProps {
    outcomeCategories: Category[];
    currencies: Currency[];
}

type ViewMode = 'summary' | 'days' | 'categories' | 'subcategories';

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ outcomeCategories, currencies }) => {
    
    const [currencyCode, setCurrencyCode] = useState(currencies[0].name);
    const [viewMode, setViewMode] = useState<ViewMode>('summary');
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());

    const [summary, setSummary] = useState<SummaryResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFullAnalytics = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const currentDate = viewMode === 'days' ? startDate : selectedMonth;

            const data = await financeApi.getSummary({
                monthDate: currentDate,
                currency: currencyCode,
            });

            setSummary(data);
        } catch (err: any) {
            setError('Failed to load analytics');
            console.error('Analytics fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currencyCode, selectedMonth, startDate, viewMode]);

    useEffect(() => {
        fetchFullAnalytics();
    }, [fetchFullAnalytics]);

    return (
        <div style={appStyles.tabContent}>

            {isLoading && (
                <div style={statusModalStyles.overlay}>
                    <div style={statusModalStyles.card}>
                        <Loader2
                            size={40}
                            color={theme.colors.primary}
                            style={{ animation: 'spin 1s linear infinite' }}
                        />
                        <span style={statusModalStyles.text}>Loading data...</span>
                    </div>
                </div>
            )}

            <div style={commonStyles.card}>
                <div style={commonStyles.row2}>
                    <div style={commonStyles.inputGroup}>
                        <label style={commonStyles.label}>Currency</label>
                        <select
                            value={currencyCode}
                            onChange={(e) => setCurrencyCode(e.target.value)}
                            style={commonStyles.input}
                        >
                            {currencies?.map(c => (
                                <option key={c.name} value={c.name}>
                                    {c.name} {c.symbol ? `(${c.symbol})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={commonStyles.inputGroup}>
                        <label style={commonStyles.label}>
                            {viewMode === 'days' ? 'Start Day' : 'Start Month'}
                        </label>
                        <CustomDatePicker
                            selectedDate={viewMode === 'days' ? startDate : selectedMonth}
                            onChange={(date) => {
                                if (viewMode === 'days') {
                                    setStartDate(date);
                                } else {
                                    setSelectedMonth(date);
                                }
                            }}
                            showMonthPicker={viewMode !== 'days'}
                        />
                    </div>
                </div>
            </div>

            <div style={{
                ...receiptStyles.mainTabs,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '4px',
                padding: '4px',
                boxSizing: 'border-box',
                width: '100%'}}>

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
                        onClick={fetchFullAnalytics}
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
                <>
                    {viewMode === 'summary' && <SummaryAnalyticsGrid summary={summary} />}
                    {viewMode === 'days' && <DayAnalyticsGrid startDate={startDate} currency={currencyCode}/>}
                    {viewMode === 'categories' && <CategoryAnalyticsGrid categories={outcomeCategories} selectedMonth={selectedMonth} currency={currencyCode} />}
                    {viewMode === 'subcategories' && <SubCategoryAnalyticsGrid categories={outcomeCategories.filter(x => x.subCategories.length > 0)} selectedMonth={selectedMonth} currency={currencyCode}/>}
                </>
            )}

        </div>
    );
};