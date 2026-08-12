// Formats a number to always show the specified number of decimal places with local grouping separators
export const formatCurrencyValue = (value: number, minimumFractionDigits: number = 2, maximumFractionDigits: number = 2, locale: string = 'ru-RU'): string => {
    return value.toLocaleString(locale, {
        minimumFractionDigits,
        maximumFractionDigits,
    });
};