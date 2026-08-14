import type {Category, Currency} from '../types/finance';
import {enrichCategory} from "../utils/categoryIcons.ts";
import {toDateOnlyString} from "../utils/dateformatter.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/*const getTelegramInitData = (): string => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initData) {
        return tg.initData;
    }
    // stub for testing in a browser
    return 'query_id=STUB&user=%7B%22id%22%3A12345678%2C%22first_name%22%3A%22Test%22%7D&hash=stub_hash';
};
*/

async function apiFetch<T>(endpoint: string, options: RequestInit = {}, signal?: AbortSignal): Promise<T> {
    //const initData = getTelegramInitData();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        //'Authorization': `tma ${initData}`,
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            signal: signal ?? options.signal,
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error [${response.status}]: ${errorText || response.statusText}`);
        }

        return response.json();
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.warn(`Request to ${endpoint} was aborted.`);
            throw new Error('Request was canceled.', { cause: error });
        }
        throw error;
    }
}

export interface SaveTransactionPayload {
    isOutcome: boolean;
    date: string; // ISO String
    category: string;
    subCategory?: string | null;
    shop?: string | null;
    description?: string | null;
    amount: number;
    currency: string;
}

export interface SaveYerevanCityCheckPayload {
    date: Date;
    barcode: string;
}

export interface SaveFnsCheckFromUrlPayload {
    url: string;
}

export interface SaveFnsCheckByRequisitesPayload {
    dateTime: string; // ISO String: "YYYY-MM-DDTHH:mm:ss"
    fiscalDocumentNumber: string;
    fiscalDocumentSign: string;
    fiscalNumber: string;
    totalPrice: number;
}

export interface DailySpendingResponse {
    date: string;
    amount: number;
    categories: { name: string; amount: number; icon: string }[];
}

export interface SummaryResponse {
    totalIncome: number;
    totalOutcome: number;
    totalBalance: number;
    futureExpenses: number;
    realFreeMoney: number;
    startPeriod: string;
    payday: string;
    daysUntilPayday: number;
    dailyBudgetLimit: number;
    currency: string;
}

export interface SummaryPayload {
    monthDate: Date;
    currency: string;
}

export interface SpendingHistoryMonthlyPayload {
    startMonth: Date;
    currency: string;
}

export interface RawCategory {
    code: string;
    name: string;
    subCategories?: RawSubCategory[]
    isPopular: boolean;
}

export interface RawSubCategory {
    code: string;
    name: string;
}

export interface SubCategoryAnalytics {
    subCategory: string | null;
    total: number;
}

export interface CategoryAnalytics {
    category: string;
    total: number;
    subCategories: SubCategoryAnalytics[];
}

export interface DailyAnalyticsPayload {
    date: Date;
    currency: string;
}

export interface MonthlyAnalyticsItem {
    month: string;
    total: number;
    totalOutcome: number;
    totalIncome: number;
    outcomeCategories: CategoryAnalytics[];
    incomeCategories: CategoryAnalytics[];
}

export interface MonthlyAnalyticsResponse {
    currency: string;
    months: MonthlyAnalyticsItem[];
}

export interface SaveCheckDto {
    success: boolean;
    error?: string;
    positions?: SaveTransactionPayload[];
}

export const financeApi = {
    
    async health(signal?: AbortSignal): Promise<boolean> {
        return apiFetch<boolean>('/health', {}, signal);
    },

    async getCurrencies(signal?: AbortSignal): Promise<Currency[]> {
        return apiFetch<Currency[]>('/currencies', {}, signal);
    },
    
    async getCategories(isOutcome: boolean, includeOutdated = false, signal?: AbortSignal): Promise<Category[]> {
        const params = new URLSearchParams({
            isOutcome: String(isOutcome),
            includeOutdated: String(includeOutdated),
        });

        const rawCategories = await apiFetch<RawCategory[]>(`/categories?${params.toString()}`, {}, signal);
        
        return rawCategories.map(enrichCategory);
    },

    
    async saveTransaction(payload: SaveTransactionPayload, signal?: AbortSignal): Promise<{ success: boolean; error?: string }> {
        return apiFetch<{ success: boolean; error?: string }>('/transactions/save', {
            method: 'POST',
            body: JSON.stringify(payload),
        }, signal);
    },
    
    async saveYerevanCityCheck(payload: SaveYerevanCityCheckPayload, signal?: AbortSignal): Promise<SaveCheckDto> {

        const formattedPayload = {
            barcode: payload.barcode,
            date: toDateOnlyString(payload.date),
        };
        
        return apiFetch<SaveCheckDto>('/transactions/yerevancity/save', {
            method: 'POST',
            body: JSON.stringify(formattedPayload),
        }, signal);
    },
    
    async saveFnsCheckFromUrl(payload: SaveFnsCheckFromUrlPayload, signal?: AbortSignal): Promise<SaveCheckDto> {
        return apiFetch<SaveCheckDto>('/transactions/fns/url/save', {
            method: 'POST',
            body: JSON.stringify(payload),
        }, signal);
    },

    async saveFnsCheckByRequisites(payload: SaveFnsCheckByRequisitesPayload, signal?: AbortSignal): Promise<SaveCheckDto> {
        return apiFetch<SaveCheckDto>('/transactions/fns/requisites/save', {
            method: 'POST',
            body: JSON.stringify(payload),
        }, signal);
    },
    
    async getSummary(payload: SummaryPayload, signal?: AbortSignal): Promise<SummaryResponse> {
        const params = new URLSearchParams({ currency: payload.currency, start: toDateOnlyString(payload.monthDate) });
        return apiFetch<SummaryResponse>(`/analytics/summary?${params.toString()}`, {}, signal);
    },

    async getDailyAnalytics(payload: DailyAnalyticsPayload, signal?: AbortSignal): Promise<SaveTransactionPayload[]> {
        const params = new URLSearchParams({ day: toDateOnlyString(payload.date), currency: payload.currency });
        return apiFetch<SaveTransactionPayload[]>(`/moneytransfer/outcomes?${params.toString()}`, {}, signal);
    },

    async getMonthlyAnalytics(payload: SpendingHistoryMonthlyPayload, signal?: AbortSignal): Promise<MonthlyAnalyticsResponse> {
        return apiFetch<MonthlyAnalyticsResponse>(`/analytics/history/monthly?start=${toDateOnlyString(payload.startMonth)}&currency=${payload.currency}`, {}, signal);
    },
};