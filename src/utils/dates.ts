const pad = (n: number): string => String(n).padStart(2, "0");

/** Local midnight of the given day. */
export const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Calendar arithmetic in local time (a day is not always 24 h: DST). */
export const addDays = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Local date -> "YYYY-MM-DD". Not via toISOString(): in UTC+4 that shifts the day back after midnight. */
export const toDateKey = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** "YYYY-MM-DD" -> local midnight. new Date("2026-09-19") would be UTC midnight, i.e. the previous day west of UTC. */
export const parseDateKey = (key: string): Date => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
};
