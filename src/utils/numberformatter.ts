export type FractionDigits = 'round' | 'actual';

// Formats a number to always show the specified number of decimal places with local grouping separators
export const formatCurrencyValue = (value: number, format: FractionDigits, locale: string = 'ru-RU'): string => {

    const maximumFractionDigits = format == 'round'? 0 : 2;
    
    return value.toLocaleString(locale, {
        maximumFractionDigits
    });
};