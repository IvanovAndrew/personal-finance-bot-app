import type { DailyExpensesResponse, ShopExpensesDto } from "../../../services/api.ts";
import { addDays, parseDateKey, startOfDay, toDateKey } from "../../../utils/dates.ts";

// Pure logic of the Daily timeline: no React, no network. Everything here is unit-tested.

export const CHUNK_DAYS = 7;

export interface DailyGroup {
    date: Date;
    items: ShopExpensesDto[];
}

export interface DateRange {
    start: Date;
    end: Date;
}

/**
 * The chunk (up to `days` days) that ends on `cursorEnd`, clamped to `earliest`.
 * Returns null when `cursorEnd` is before the earliest day, i.e. there is nothing left to load.
 */
export const chunkEndingAt = (cursorEnd: Date, earliest: Date, days: number = CHUNK_DAYS): DateRange | null => {
    const end = startOfDay(cursorEnd);
    const min = startOfDay(earliest);
    if (end.getTime() < min.getTime()) return null;

    const start = addDays(end, -(days - 1));
    return { start: start.getTime() < min.getTime() ? min : start, end };
};

/**
 * Where the next chunk ends: the day before this chunk started.
 * The cursor moves with the requested ranges, not with the received data: a week without
 * expenses (empty response) must not make us request the same week again.
 */
export const cursorAfter = (chunk: DateRange): Date => addDays(chunk.start, -1);

export const chunkCacheKey = (currency: string, chunk: DateRange): string =>
    `${currency}|${toDateKey(chunk.start)}|${toDateKey(chunk.end)}`;

const newestFirst = (a: DailyGroup, b: DailyGroup): number => b.date.getTime() - a.date.getTime();

/** API dictionary { "2026-09-19": [...] } -> groups, newest first, with local dates. */
export const mapDailyResponse = (response: DailyExpensesResponse | null | undefined): DailyGroup[] =>
    Object.entries(response ?? {})
        .map(([dateKey, items]) => ({ date: parseDateKey(dateKey), items }))
        .sort(newestFirst);

/** Adds the incoming days, skipping the ones we already have. Keeps the newest-first order. */
export const appendGroups = (current: DailyGroup[], incoming: DailyGroup[]): DailyGroup[] => {
    const known = new Set(current.map((g) => toDateKey(g.date)));
    const fresh = incoming.filter((g) => !known.has(toDateKey(g.date)));
    return fresh.length === 0 ? current : [...current, ...fresh].sort(newestFirst);
};
