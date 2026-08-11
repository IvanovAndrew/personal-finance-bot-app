import type {RawCategory, RawSubCategory} from "../services/api.ts";

export type TabType = 'add' | 'receipt' | 'analytics';
export type TransactionType = 'expense' | 'income';

export interface SubCategory extends RawSubCategory {
    code: string;
    name: string;
}

export interface Category extends Omit<RawCategory, 'subcategories' | 'subCategories'> {
    code: string;
    name: string;
    icon: string;
    subCategories: SubCategory[];
    isPopular: boolean;
}

export interface Currency {
    name: string;
    symbol: string;
    format: string;
    isPopular: boolean;
}