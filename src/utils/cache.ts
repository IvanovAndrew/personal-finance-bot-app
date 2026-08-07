import {ONE_WEEK} from "../constants/time.ts";

interface CacheItem<T> {
    timestamp: number;
    data: T;
}

export const cacheService = {
    get: <T>(key: string): T | null => {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return null;

            const item: CacheItem<T> = JSON.parse(itemStr);

            return item.data;
        } catch {
            return null;
        }
    },

    isExpired: (key: string): boolean => {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return true;
            const item: CacheItem<unknown> = JSON.parse(itemStr);
            return Date.now() - item.timestamp > ONE_WEEK;
        } catch {
            return true;
        }
    },

    set: <T>(key: string, data: T): void => {
        try {
            const item: CacheItem<T> = {
                timestamp: Date.now(),
                data,
            };
            localStorage.setItem(key, JSON.stringify(item));
        } catch (e) {
            console.error('Failed to save cache', e);
        }
    },
};