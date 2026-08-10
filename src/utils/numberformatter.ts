// Formats a number to always show 2 decimal places with local grouping separators
export const formatCurrencyValue = (value: number, locale: string = 'ru-RU'): string => {
    return value.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};