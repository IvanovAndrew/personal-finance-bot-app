import type { Category, SubCategory } from '../types/finance';

export interface CategoryMeta {
    code: string;
    name: string;
    subCategories: SubCategory[];
    
    icon: string;
    color: string;
}

export const defaultColor = '#9E9E9E';

export const getCategoryMeta = (
    categories: Category[] = [],
    codeOrName: string | null | undefined
): CategoryMeta => {
    if (!codeOrName) {
        return { code: '', name: '—', subCategories: [], icon: '📁', color: defaultColor };
    }

    const normalized = codeOrName.trim().toLowerCase();
    const found = categories.find(
        (c) => c.code.toLowerCase() === normalized || c.name.toLowerCase() === normalized
    );

    return (
        found || {
            code: codeOrName,
            name: codeOrName,
            subCategories: [],
            icon: '📁',
            color: defaultColor
        }
    );
};

export const getSubCategoryName = (
    categories: Category[] = [],
    categoryCodeOrName: string | null | undefined,
    subCategoryCodeOrName: string | null | undefined
): string | null => {
    if (!subCategoryCodeOrName) return null;

    const categoryMeta = getCategoryMeta(categories, categoryCodeOrName);
    const normalizedSub = subCategoryCodeOrName.trim().toLowerCase();

    const subMeta = categoryMeta.subCategories?.find(
        (sc) => sc.code.toLowerCase() === normalizedSub || sc.name.toLowerCase() === normalizedSub
    );

    return subMeta?.name || subCategoryCodeOrName;
};