import React, {useState} from 'react';
import type { Category, SubCategory } from '../types/finance';
import { theme, commonStyles, appStyles, receiptStyles } from '../App.styles';
import {ChevronLeft, ChevronRight} from "lucide-react";

interface CategoryGridProps {
    categories: Category[];
    selectedCategory: Category;
    selectedSubCat: SubCategory | null;
    onSelectCategory: (cat: Category) => void;
}

const ITEMS_PER_PAGE = 16;

export const CategoryGrid: React.FC<CategoryGridProps> = ({
                                                              categories,
                                                              selectedCategory,
                                                              selectedSubCat,
                                                              onSelectCategory,
                                                          }) => {

    const [page, setPage] = useState<number>(0);
    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
    const isPaginated = categories.length > ITEMS_PER_PAGE+1;

    const currentCategories = isPaginated
        ? categories.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)
        : categories;
    
    return (
        <div style={commonStyles.card}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={commonStyles.cardTitle}>Category</span>
                {selectedSubCat && (
                    <span style={appStyles.currencyBadge}>{selectedSubCat.name}</span>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {currentCategories.map((cat) => {
                    const isSelected = selectedCategory.code === cat.code;
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
            </div>

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
                        borderColor: theme.colors.primary,
                        backgroundColor: theme.colors.bgElement,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: theme.radius.md,
                            backgroundColor: theme.colors.primaryLight,
                        }}
                    >
                        {page === totalPages - 1 ? (
                            <ChevronLeft size={20} color={theme.colors.primary} />
                        ) : (
                            <ChevronRight size={20} color={theme.colors.primary} />
                        )}
                    </div>
                    <span
                        style={{
                            fontSize: '10px',
                            fontWeight: '600',
                            color: theme.colors.primary,
                            textAlign: 'center',
                        }}
                    >
              {page === totalPages - 1 ? 'Back' : `More (${categories.length - ITEMS_PER_PAGE})`}
            </span>
                </button>
            )}
        </div>
    );
};