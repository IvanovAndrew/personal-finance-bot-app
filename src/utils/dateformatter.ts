export const formatDateMMMMYYYY = (date: Date, locale = 'en-US'): string => {
    return new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric'
    }).format(date);
};

export const formatDateDMMMMYYYY = (date: Date, locale = 'en-US'): string => {
    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

export const toDateOnlyString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`; // "2026-08-07"
};