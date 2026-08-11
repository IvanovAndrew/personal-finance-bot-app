import React, {useMemo, useState} from 'react';
import type { Category, SubCategory } from '../types/finance';
import { theme, commonStyles, appStyles, receiptStyles } from '../App.styles';
import {ChevronLeft, ChevronRight} from "lucide-react";

interface CategoryGridProps {
    categories: Category[];
    selectedCategory: Category | null;
    selectedSubCat: SubCategory | null;
    onSelectCategory: (cat: Category | null) => void;
}

const ITEMS_PER_PAGE = 12;

export const CategoryGrid: React.FC<CategoryGridProps> = ({
                                                              categories,
                                                              selectedCategory,
                                                              selectedSubCat,
                                                              onSelectCategory,
                                                          }) => {

    const [page, setPage] = useState<number>(0);


    const sortedCategories = useMemo(() => {
        return [...categories].sort((a, b) => {
            if (a.isPopular !== b.isPopular) {
                return a.isPopular ? -1 : 1;
            }
            
            return a.name.localeCompare(b.name);
        });
    }, [categories]);

    
    const isPaginated = sortedCategories.length > ITEMS_PER_PAGE;
    const itemsPerPage = isPaginated ? ITEMS_PER_PAGE-1 : ITEMS_PER_PAGE;
    const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);

    const currentCategories = isPaginated
        ? sortedCategories.slice(page * itemsPerPage, (page + 1) * itemsPerPage)
        : sortedCategories;

    const remainingCount = sortedCategories.length - (page + 1) * itemsPerPage;
    
    return (
        <div style={commonStyles.card}>

            <div style={commonStyles.rowBetween}>
                <span style={commonStyles.cardTitle}>Category</span>
                {selectedSubCat && (
                    <span style={appStyles.currencyBadge}>{selectedSubCat.name}</span>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {currentCategories.map((cat) => {
                    const isSelected = selectedCategory !== null && selectedCategory.code === cat.code;
                    return (
                        <button
                            key={cat.code}
                            onClick={() => onSelectCategory(cat)}
                            style={{
                                ...receiptStyles.subChip,
                                flex: 'none', 
                                minWidth: 0,
                                width: '100%',
                                boxSizing: 'border-box',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                padding: '8px 2px',
                                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                                backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.bgCard,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: theme.radius.md,
                                    backgroundColor: theme.colors.bgElement,
                                    fontSize: '16px',
                                }}
                            >
                                <span>{cat.icon}</span>
                            </div>
                            <span
                                style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%',
                                }}
                            >
                {cat.name}
              </span>
                        </button>
                    );
                })}

                {isPaginated && (
                    <button
                        onClick={() => setPage((prev) => (prev + 1) % totalPages)}
                        style={{
                            ...receiptStyles.subChip,
                            flex: 'none',
                            minWidth: 0,
                            width: '100%',
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '8px 2px',
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.bgCard,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                borderRadius: theme.radius.md,
                                backgroundColor: theme.colors.bgCard,
                            }}
                        >
                            {page === totalPages - 1 ? (
                                <ChevronLeft size={20} color={theme.colors.textSecondary} />
                            ) : (
                                <ChevronRight size={20} color={theme.colors.textSecondary} />
                            )}
                        </div>
                        <span
                            style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                color: theme.colors.textSecondary,
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '100%',
                            }}
                        >
                            {page === totalPages - 1 ? 'Back' : `More (${remainingCount > 0 ? remainingCount : ''})`}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
};