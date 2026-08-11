import { type FC, useState } from "react";
import type { Category } from "../types/finance";
import { commonStyles, theme } from "../App.styles";
import { ChevronDown, X } from "lucide-react";
import { formatCurrencyValue } from "../utils/numberformatter";
import { CategoryGrid } from "./CategoryGrid";
import { getCategoryMeta } from "../utils/categoryutils";

interface CategorySwitcherModalProps {
    categories: Category[];
    availableCategories?: Category[];
    selectedCategoryCode: string | null;
    onSelectCategory: (categoryCode: string) => void;
    totalAmount?: number;
    currency?: string;
    label?: string;
}

export const CategorySwitcherModal: FC<CategorySwitcherModalProps> = ({
                                                                          categories,
                                                                          availableCategories,
                                                                          selectedCategoryCode,
                                                                          onSelectCategory,
                                                                          totalAmount,
                                                                          currency,
                                                                          label = "TOTAL FOR CATEGORY",
                                                                      }) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const activeMeta = selectedCategoryCode ? getCategoryMeta(categories, selectedCategoryCode) : null;
    const activeCategoryObj = categories.find(
        (c) => c.code.toLowerCase() === selectedCategoryCode?.toLowerCase()
    ) || null;

    const listToRender = availableCategories || categories;

    return (
        <>
            {/* Header Card */}
            <div style={{ ...commonStyles.card, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '10px', color: theme.colors.textSecondary, fontWeight: '700', letterSpacing: '0.5px' }}>
                            {label}
                        </div>
                        {activeMeta && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: theme.colors.bgElement,
                                    border: `1px solid ${theme.colors.border}`,
                                    borderRadius: theme.radius.md,
                                    padding: '6px 10px',
                                    marginTop: '6px',
                                    cursor: 'pointer',
                                    color: theme.colors.textPrimary,
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>{activeMeta.icon}</span>
                                <span style={{ fontSize: '13px', fontWeight: '700' }}>{activeMeta.name}</span>
                                <ChevronDown size={14} color={theme.colors.textSecondary} />
                            </button>
                        )}
                    </div>
                    {totalAmount !== undefined && currency && (
                        <span style={{ fontSize: '18px', fontWeight: '800', color: theme.colors.textPrimary }}>
                            {formatCurrencyValue(totalAmount)} {currency}
                        </span>
                    )}
                </div>
            </div>

            {/* Modal Dialog */}
            {isModalOpen && (
                <div
                    onClick={() => setIsModalOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '380px',
                            position: 'relative',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                        }}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '14px',
                                right: '14px',
                                background: 'transparent',
                                border: 'none',
                                color: theme.colors.textSecondary,
                                cursor: 'pointer',
                                padding: '4px',
                                zIndex: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <X size={18} />
                        </button>

                        <CategoryGrid
                            categories={listToRender}
                            selectedCategory={activeCategoryObj}
                            selectedSubCat={null}
                            onSelectCategory={(cat) => {
                                if (cat) {
                                    onSelectCategory(cat.code);
                                }
                                setIsModalOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
};