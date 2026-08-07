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

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    //const initData = getTelegramInitData();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        //'Authorization': `tma ${initData}`,
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error [${response.status}]: ${errorText || response.statusText}`);
    }

    return response.json();
}

export interface SaveTransactionPayload {
    isoutcome: boolean;
    date: string; // ISO String
    category: string;
    subCategory?: string | null;
    description?: string;
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

export interface SaveTransactionPayload {
    isoutcome: boolean;
    date: string; // ISO String
    category: string;
    subCategory?: string | null;
    description?: string;
    amount: number;
    currency: string;
}

export interface BudgetAnalyticsResponse {
    totalIncome: number;
    spent: number;
    mandatoryExpenses: number;
    remainingToSalary: number;
    daysLeftToSalary: number;
}

export interface DailySpendingResponse {
    date: string;
    amount: number;
    categories: { name: string; amount: number; icon: string }[];
}

export interface CategoryAnalyticsResponse {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    subcategoriesTotal: { subId: string; name: string; amount: number }[];
    monthlyTrend: { month: string; amount: number }[];
}

export interface RawCategory {
    code: string;
    name: string;
    subCategories?: RawSubCategory[]
}

export interface RawSubCategory {
    code: string;
    name: string;
}

export const financeApi = {
    
    async health(): Promise<boolean> {
        return apiFetch<boolean>('/health');
    },

    async getCurrencies(): Promise<Currency[]> {
        return apiFetch<Currency[]>('/currencies');
    },
    
    async getCategories(isOutcome: boolean, includeOutdated = false): Promise<Category[]> {
        const params = new URLSearchParams({
            isOutcome: String(isOutcome),
            includeOutdated: String(includeOutdated),
        });

        const rawCategories = await apiFetch<RawCategory[]>(`/categories?${params.toString()}`);
        
        var enriched = rawCategories.map(enrichCategory);

        return enriched;
    },

    
    async saveTransaction(payload: SaveTransactionPayload): Promise<{ success: boolean; error?: string }> {
        return apiFetch<{ success: boolean; error?: string }>('/transactions/save', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },
    
    async saveYerevanCityCheck(payload: SaveYerevanCityCheckPayload): Promise<{ success: boolean; error?: string }> {

        const formattedPayload = {
            barcode: payload.barcode,
            date: toDateOnlyString(payload.date),
        };
        
        return apiFetch<{ success: boolean; error?: string }>('/transactions/yerevancity/save', {
            method: 'POST',
            body: JSON.stringify(formattedPayload),
        });
    },
    
    async saveFnsCheckFromUrl(payload: SaveFnsCheckFromUrlPayload): Promise<{ success: boolean; error?: string }> {
        return apiFetch<{ success: boolean; error?: string }>('/transactions/fns/url/save', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    async saveFnsCheckByRequisites(payload: SaveFnsCheckByRequisitesPayload): Promise<{ success: boolean; error?: string }> {
        return apiFetch<{ success: boolean; error?: string }>('/transactions/fns/requisites/save', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    async getBudgetAnalytics(monthDate: Date, currency: string): Promise<BudgetAnalyticsResponse> {
        const monthStr = monthDate.toISOString().slice(0, 7); // YYYY-MM
        const params = new URLSearchParams({ month: monthStr, currency });
        return apiFetch<BudgetAnalyticsResponse>(`/analytics/budget?${params.toString()}`);
    },

    async getDailySpending(startDate: Date, currency: string): Promise<DailySpendingResponse[]> {
        const dateStr = startDate.toISOString().slice(0, 10); // YYYY-MM-DD
        const params = new URLSearchParams({ startDate: dateStr, currency });
        return apiFetch<DailySpendingResponse[]>(`/analytics/daily?${params.toString()}`);
    },

    
    async getCategoryAnalytics(monthDate: Date, currency: string): Promise<CategoryAnalyticsResponse[]> {
        const monthStr = monthDate.toISOString().slice(0, 7);
        const params = new URLSearchParams({ month: monthStr, currency });
        return apiFetch<CategoryAnalyticsResponse[]>(`/analytics/categories?${params.toString()}`);
    },

    async getSubCategoryAnalytics(
        categoryId: string,
        startMonthDate: Date,
        currency: string
    ): Promise<CategoryAnalyticsResponse> {
        const monthStr = startMonthDate.toISOString().slice(0, 7);
        const params = new URLSearchParams({ categoryId, startMonth: monthStr, currency });
        return apiFetch<CategoryAnalyticsResponse>(`/analytics/subcategories?${params.toString()}`);
    },
};