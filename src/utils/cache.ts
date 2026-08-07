const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_WEEK = 7 * 24 * ONE_HOUR;

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