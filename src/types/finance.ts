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
    subCategories: SubCategory[];
    isPopular: boolean;
    icon: string;
    color: string;
}

export interface Currency {
    name: string;
    symbol: string;
    format: string;
    isPopular: boolean;
}