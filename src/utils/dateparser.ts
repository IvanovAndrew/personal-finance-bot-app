export const parseMonthString = (monthStr: string): Date => {
    const parts = monthStr.split("-");
    if (parts.length >= 2) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    }
    return new Date(monthStr);
};