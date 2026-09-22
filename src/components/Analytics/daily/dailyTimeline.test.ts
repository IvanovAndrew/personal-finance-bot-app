import { describe, expect, it } from "vitest";

import { parseDateKey, toDateKey } from "../../../utils/dates.ts";
import { appendGroups, chunkCacheKey, chunkEndingAt, cursorAfter, type DailyGroup, mapDailyResponse } from "./dailyTimeline.ts";

const d = parseDateKey;
const key = toDateKey;
const group = (date: string): DailyGroup => ({ date: d(date), items: [] });

describe("chunkEndingAt", () => {
    it("returns a full 7-day chunk ending on the cursor", () => {
        const c = chunkEndingAt(d("2026-09-20"), d("2022-01-01"))!;
        expect([key(c.start), key(c.end)]).toEqual(["2026-09-14", "2026-09-20"]);
    });

    it("clamps the start to the earliest day", () => {
        const c = chunkEndingAt(d("2022-01-04"), d("2022-01-01"))!;
        expect([key(c.start), key(c.end)]).toEqual(["2022-01-01", "2022-01-04"]);
    });

    it("gives a one-day chunk when the cursor is exactly the earliest day", () => {
        const c = chunkEndingAt(d("2022-01-01"), d("2022-01-01"))!;
        expect([key(c.start), key(c.end)]).toEqual(["2022-01-01", "2022-01-01"]);
    });

    it("returns null when the cursor is before the earliest day", () => {
        expect(chunkEndingAt(d("2021-12-31"), d("2022-01-01"))).toBeNull();
    });

    it("ignores the time of day of the cursor", () => {
        const c = chunkEndingAt(new Date(2026, 8, 20, 23, 59), d("2022-01-01"))!;
        expect(key(c.end)).toBe("2026-09-20");
    });

    it("walking back from any day to the earliest covers every day exactly once and terminates", () => {
        for (const [anchor, earliest] of [["2026-09-20", "2026-08-01"], ["2026-03-30", "2026-02-20"], ["2026-11-02", "2026-10-01"], ["2022-01-05", "2022-01-01"]]) {
            const days: string[] = [];
            let cursor = d(anchor);
            for (let guard = 0; guard < 1000; guard++) {
                const chunk = chunkEndingAt(cursor, d(earliest));
                if (!chunk) break;
                for (let t = new Date(chunk.start); t <= chunk.end; t = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)) days.push(key(t));
                cursor = cursorAfter(chunk);
            }
            const expected: string[] = [];
            for (let t = d(earliest); t <= d(anchor); t = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)) expected.push(key(t));
            expect(days.slice().sort()).toEqual(expected);
            expect(new Set(days).size).toBe(days.length);
        }
    });
});

describe("cursorAfter", () => {
    it("is the day before the chunk started, whatever the response contained", () => {
        expect(key(cursorAfter({ start: d("2026-09-14"), end: d("2026-09-20") }))).toBe("2026-09-13");
    });
});

describe("mapDailyResponse", () => {
    it("sorts newest first and uses local dates", () => {
        const groups = mapDailyResponse({ "2026-09-17": [], "2026-09-19": [], "2026-09-18": [] });
        expect(groups.map((g) => key(g.date))).toEqual(["2026-09-19", "2026-09-18", "2026-09-17"]);
        expect(groups[0].date.getHours()).toBe(0);
    });

    it("copes with an empty or missing response", () => {
        expect(mapDailyResponse({})).toEqual([]);
        expect(mapDailyResponse(null)).toEqual([]);
        expect(mapDailyResponse(undefined)).toEqual([]);
    });
});

describe("appendGroups", () => {
    it("appends older days and keeps the order", () => {
        const r = appendGroups([group("2026-09-19"), group("2026-09-18")], [group("2026-09-16"), group("2026-09-17")]);
        expect(r.map((g) => key(g.date))).toEqual(["2026-09-19", "2026-09-18", "2026-09-17", "2026-09-16"]);
    });

    it("skips days that are already there", () => {
        const current = [group("2026-09-19")];
        expect(appendGroups(current, [group("2026-09-19")])).toBe(current);
    });
});

describe("chunkCacheKey", () => {
    it("depends on currency and range", () => {
        const r = { start: d("2026-09-14"), end: d("2026-09-20") };
        expect(chunkCacheKey("AMD", r)).toBe("AMD|2026-09-14|2026-09-20");
        expect(chunkCacheKey("RUR", r)).not.toBe(chunkCacheKey("AMD", r));
    });
});
