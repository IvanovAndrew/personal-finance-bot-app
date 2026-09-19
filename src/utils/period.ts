import { formatMonthYear } from "./dateformatter.ts";
import { parseMonthString } from "./dateparser.ts";

/** Expects month strings ("2026-09") sorted ascending. Returns "Jan 2024 — Sep 2026". */
export const formatPeriod = (sortedMonths: string[]): string => {
    if (!sortedMonths.length) return "";
    const first = formatMonthYear(parseMonthString(sortedMonths[0]));
    const last = formatMonthYear(parseMonthString(sortedMonths[sortedMonths.length - 1]));
    return first === last ? first : `${first} — ${last}`;
};
