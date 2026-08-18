export const QUICK_CATEGORY_OUTCOME_CODES = [
    'Food',      
    'Pets',      
    'Restaurants',   
] as const;

export const QUICK_CATEGORY_INCOME_CODES = [
    'Salary',
    'ApartmentRent',
    'Cashback',
] as const;

export type QuickOutcomeCategoryCode = typeof QUICK_CATEGORY_OUTCOME_CODES[number];
export type QuickIncomeCategoryCode = typeof QUICK_CATEGORY_INCOME_CODES[number];