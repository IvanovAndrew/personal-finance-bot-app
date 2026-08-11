import type { Category, SubCategory } from '../types/finance';

export interface CategoryMeta {
    code: string;
    name: string;
    icon: string;
    subCategories: SubCategory[];
}

export const getCategoryMeta = (
    categories: Category[] = [],
    codeOrName: string | null | undefined
): CategoryMeta => {
    if (!codeOrName) {
        return { code: '', name: '—', icon: '📁', subCategories: [] };
    }

    const normalized = codeOrName.trim().toLowerCase();
    const found = categories.find(
        (c) => c.code.toLowerCase() === normalized || c.name.toLowerCase() === normalized
    );

    return (
        found || {
            code: codeOrName,
            name: codeOrName,
            icon: '📁',
            subCategories: [],
        }
    );
};

export const getSubCategoryName = (
    categories: Category[] = [],
    categoryCodeOrName: string | null | undefined,
    subCategoryCodeOrName: string | null | undefined
): string => {
    if (!subCategoryCodeOrName) return 'Other';

    const categoryMeta = getCategoryMeta(categories, categoryCodeOrName);
    const normalizedSub = subCategoryCodeOrName.trim().toLowerCase();

    const subMeta = categoryMeta.subCategories?.find(
        (sc) => sc.code.toLowerCase() === normalizedSub || sc.name.toLowerCase() === normalizedSub
    );

    return subMeta?.name || subCategoryCodeOrName;
};