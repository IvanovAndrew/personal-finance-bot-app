import React, { useState } from 'react';
import {
    Calendar,
    PieChart,
    Layers,
} from 'lucide-react';
import { commonStyles, appStyles, receiptStyles } from '../../App.styles';
import type {Category, Currency} from '../../types/finance';
import {DayAnalyticsGrid} from "./DayAnalyticsGrid.tsx";
import {CategoryAnalyticsGrid} from "./CategoryAnalyticsGrid.tsx";
import {CustomDatePicker} from "../CustomDatePicker.tsx";
import {SubCategoryAnalyticsGrid} from "./SubCategoryAnalyticsGrid.tsx";

interface AnalyticsTabProps {
    outcomeCategories: Category[];
    currencies: Currency[];
}

type ViewMode = 'days' | 'categories' | 'subcategories';

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ outcomeCategories, currencies }) => {
    // Основные фильтры
    const [currencyCode, setCurrencyCode] = useState(currencies[0].name);
    const [viewMode, setViewMode] = useState<ViewMode>('categories');
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());

    

    return (
        <div style={appStyles.tabContent}>

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

            <div style={receiptStyles.mainTabs}>
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

            {viewMode === 'days' && <DayAnalyticsGrid startDate={startDate} currency={currencyCode}/>}
            {viewMode === 'categories' && <CategoryAnalyticsGrid categories={outcomeCategories} selectedMonth={selectedMonth} currency={currencyCode} />}

            {viewMode === 'subcategories' && <SubCategoryAnalyticsGrid categories={outcomeCategories.filter(x => x.subCategories.length > 0)} selectedMonth={selectedMonth} currency={currencyCode}/>}

        </div>
    );
};