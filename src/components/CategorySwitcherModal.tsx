import { type FC, useState } from "react";
import type { Category } from "../types/finance";
import { theme } from "../App.styles";
import { ChevronDown, ChevronLeft, X } from "lucide-react";
import { CategoryGrid } from "./CategoryGrid";
import { getCategoryMeta } from "../utils/categoryutils";

interface CategorySwitcherModalProps {
    categories: Category[];
    availableCategories?: Category[];
    selectedCategoryCode: string | null;
    selectedSubCategoryCode?: string | null;
    onSelectCategory: (categoryCode: string, subCategoryCode?: string | null) => void;
    enableSubCategorySelection: boolean;
    label?: string;
    textColor?: string;
}

export const CategorySwitcherModal: FC<CategorySwitcherModalProps> = ({
                                                                          categories,
                                                                          availableCategories,
                                                                          selectedCategoryCode,
                                                                          selectedSubCategoryCode,
                                                                          onSelectCategory,
                                                                          enableSubCategorySelection,
                                                                          label = "CATEGORY",
                                                                          textColor
                                                                      }) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    
    const [tempCategory, setTempCategory] = useState<Category | null>(null);

    const activeMeta = selectedCategoryCode ? getCategoryMeta(categories, selectedCategoryCode) : null;

    const activeCategoryObj = categories.find(
        (c) => c.code.toLowerCase() === selectedCategoryCode?.toLowerCase()
    ) || null;

    const activeSubCategories = activeCategoryObj?.subCategories || [];
    const activeSubCategoryObj = activeSubCategories.find(
        (sub) => sub.code.toLowerCase() === selectedSubCategoryCode?.toLowerCase()
    ) || null;

    const listToRender = availableCategories || categories;

    const handleOpenModal = () => {
        setTempCategory(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTempCategory(null);
    };

    const handleCategoryClick = (cat: Category | null) => {
        if (!cat) return;

        const subs = cat.subCategories || [];
        if (enableSubCategorySelection && subs.length > 0) {
            setTempCategory(cat);
        } else {
            onSelectCategory(cat.code, null);
            handleCloseModal();
        }
    };

    const handleSubCategorySelect = (subCode: string | null) => {
        if (tempCategory) {
            onSelectCategory(tempCategory.code, subCode);
        }
        handleCloseModal();
    };

    const tempSubCategories = tempCategory
        ? (tempCategory.subCategories || [])
        : [];
    const tempMeta = tempCategory ? getCategoryMeta(categories, tempCategory.code) : null;

    const finalTextColor = textColor || (activeMeta ? theme.colors.textPrimary : theme.colors.textSecondary);

    return (
        <>
            {/* Header Card (Кнопка открытия модалки) */}
            <div
                onClick={handleOpenModal}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '0 8px',
                    boxSizing: 'border-box'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    color: finalTextColor,
                    overflow: 'hidden'
                }}>
                    {label && (
                        <div style={{ fontSize: '10px', color: theme.colors.textSecondary, fontWeight: '700', letterSpacing: '0.5px' }}>
                            {label}
                        </div>
                    )}

                    {activeMeta ? (
                        <>
                            <span style={{ fontSize: '16px', flexShrink: 0 }}>{activeMeta.icon}</span>
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '700',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {activeMeta.name}
                                {enableSubCategorySelection && activeSubCategoryObj && (
                                    <span style={{ fontWeight: '500', opacity: 0.7 }}>
                                        {` - ${activeSubCategoryObj.name}`}
                                    </span>
                                )}
                            </span>
                        </>
                    ) : (
                        <span style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            Select Category...
                        </span>
                    )}
                    <ChevronDown size={14} color={finalTextColor} style={{ flexShrink: 0 }} />
                </div>
            </div>

            {/* Modal Dialog */}
            {isModalOpen && (
                <div
                    onClick={handleCloseModal}
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
                            backgroundColor: theme.colors.bgCard || '#1c1c1e',
                            borderRadius: theme.radius.lg || '16px',
                            padding: '20px 16px 16px 16px',
                            border: `1px solid ${theme.colors.border}`,
                        }}
                    >
                        <button
                            onClick={handleCloseModal}
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

                        {/* Шаг 2: Выбор подкатегории (если включен) */}
                        {tempCategory ? (
                            <div>
                                <button
                                    onClick={() => setTempCategory(null)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: theme.colors.primary,
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        padding: 0,
                                        marginBottom: '16px',
                                    }}
                                >
                                    <ChevronLeft size={16} /> Back to categories
                                </button>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '20px' }}>{tempMeta?.icon}</span>
                                    <span style={{ fontSize: '16px', fontWeight: '700', color: theme.colors.textPrimary }}>
                                        {tempMeta?.name}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {tempSubCategories.map((sub) => (
                                        <button
                                            key={sub.code}
                                            onClick={() => handleSubCategorySelect(sub.code)}
                                            style={{
                                                padding: '12px 14px',
                                                borderRadius: theme.radius.md,
                                                backgroundColor: theme.colors.bgElement,
                                                border: `1px solid ${theme.colors.border}`,
                                                color: theme.colors.textPrimary,
                                                textAlign: 'left',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {sub.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <CategoryGrid
                                categories={listToRender}
                                selectedCategory={activeCategoryObj}
                                selectedSubCat={activeSubCategoryObj}
                                onSelectCategory={handleCategoryClick}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
};