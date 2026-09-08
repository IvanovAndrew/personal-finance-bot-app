// Formats a number to always show the specified number of decimal places with local grouping separators
export const formatCurrencyValue = (value: number, format: string, locale: string = 'ru-RU'): string => {

    const maximumFractionDigits = Number(format.match(/^C(\d+)$/)?.[1] ?? 0);
    
    return value.toLocaleString(locale, {
        maximumFractionDigits
    });
};