export const parseMonthString = (monthStr: string): Date => {
    const parts = monthStr.split("-");
    if (parts.length >= 2) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    }
    return new Date(monthStr);
};

// new Date("2026-10-20") парсится как UTC и в отрицательных поясах даст 19-е, поэтому разбираем вручную
export const parseIsoDate = (iso: string): Date => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
};