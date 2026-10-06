const MONTH = new Intl.DateTimeFormat("ru-RU", { month: "short" });

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

export const formatMonthYear = (date: Date, locale = 'en-US'): string =>
    date
        .toLocaleDateString(locale, { month: "short", year: "numeric" })
        .replace(/\s?г\.$/, "");

export const formatMonth = (date: Date, locale = 'en-US'): string =>
    date
        .toLocaleDateString(locale, { month: "short" })
        .replace(/\s?г\.$/, "");

export const toDateOnlyString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`; // "2026-08-07"
};

export const formatISODateTime = (date: Date, timeStr: string): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr || '00:00:00';

    return `${year}-${month}-${day}T${formattedTime}`;
};

export const formatPaymentDateRange = (start: Date, end: Date): string => {

    if (start.getTime() === end.getTime()) return `${start.getDate()} ${MONTH.format(start)}`;
    if (start.getMonth() === end.getMonth()) {
        
        if (start.getDate() == 1 && end.getDate() == new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()) {
            return `${MONTH.format(start)}`;
        }
        
        return `${start.getDate()}–${end.getDate()} ${MONTH.format(end)}`;
    }
    return `${start.getDate()} ${MONTH.format(start)} – ${end.getDate()} ${MONTH.format(end)}`;
};