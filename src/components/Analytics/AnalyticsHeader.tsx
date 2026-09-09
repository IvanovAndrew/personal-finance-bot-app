import React, { useState } from 'react';
import { theme } from '../../App.styles';
import type { Currency } from '../../types/finance';
import { CurrencyDropdown } from '../CurrencyDropdown';
import { CustomDatePicker } from '../CustomDatePicker';

interface AnalyticsHeaderProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    selectedCurrency: Currency;
    currencies: Currency[];
    onCurrencyChange: (currency: Currency) => void;
    showMonthPicker?: boolean;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
                                                                    selectedDate,
                                                                    onDateChange,
                                                                    selectedCurrency,
                                                                    currencies,
                                                                    onCurrencyChange,
                                                                    showMonthPicker = true,
                                                                }) => {
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

    return (
        <div style={styles.container}>
            <div style={styles.datePickerWrapper}>
                <CustomDatePicker
                    selectedDate={selectedDate}
                    onChange={onDateChange}
                    showMonthPicker={showMonthPicker}
                />
            </div>

            <div style={{ position: 'relative' }}>
                <button
                    type="button"
                    onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                    style={styles.currencyTrigger}
                >
                    <span>{selectedCurrency.name} ({selectedCurrency.symbol})</span>
                    <span style={styles.arrowIcon}>▾</span>
                </button>

                {/* Выпадающий список */}
                {showCurrencyPicker && (
                    <CurrencyDropdown
                        currencies={currencies}
                        setSelectedCurrency={onCurrencyChange}
                        setShowCurrencyPicker={setShowCurrencyPicker}
                    />
                )}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 0 16px 0',
        gap: '12px',
        position: 'relative',
    },
    datePickerWrapper: {
        flex: '1 1 auto',
    },
    currencyTrigger: {
        backgroundColor: theme.colors.bgCard || '#1C1C1E',
        border: `1px solid ${theme.colors.border || '#2C2C2E'}`,
        borderRadius: theme.radius?.md || '12px',
        color: theme.colors.textSecondary || '#8E8E93',
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        outline: 'none',
    },
    arrowIcon: {
        fontSize: '10px',
        color: theme.colors.textSecondary || '#8E8E93',
    },
};