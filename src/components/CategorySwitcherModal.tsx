import { ChevronDown, ChevronLeft } from "lucide-react";
import { type FC, useState } from "react";

import { theme } from "../App.styles";
import { terms } from "../constants/strings.ts";
import type { Category } from "../types/finance";
import { getCategoryMeta } from "../utils/categoryutils";
import { BottomSheet } from "../shared/ui/BottomSheet.tsx";
import { ListGroup } from "../shared/ui/Card.tsx";
import { CategoryGrid } from "./CategoryGrid";
import { Chip } from "../shared/ui/Chip.tsx";
import { ListRow } from "./ListRow.tsx";

interface CategorySwitcherModalProps {
    categories: Category[];
    availableCategories?: Category[];
    selectedCategoryCode: string | null;
    selectedSubCategoryCode?: string | null;
    onSelectCategory: (categoryCode: string, subCategoryCode?: string | null) => void;
    enableSubCategorySelection: boolean;
    /** Caption before the category name (inline variant only). Pass "" to hide. */
    label?: string;
    textColor?: string;
    /**
     * "chip" - standalone pill, used on the analytics screens.
     * "inline" - fills its parent, the parent provides the tile (used in the Enter tab).
     */
    variant?: "chip" | "inline";
}

export const CategorySwitcherModal: FC<CategorySwitcherModalProps> = ({
                                                                          categories,
                                                                          availableCategories,
                                                                          selectedCategoryCode,
                                                                          selectedSubCategoryCode,
                                                                          onSelectCategory,
                                                                          enableSubCategorySelection,
                                                                          label = "CATEGORY",
                                                                          textColor,
                                                                          variant = "inline",
                                                                      }) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [tempCategory, setTempCategory] = useState<Category | null>(null);

    const activeMeta = selectedCategoryCode ? getCategoryMeta(categories, selectedCategoryCode) : null;

    const activeCategoryObj =
        categories.find((c) => c.code.toLowerCase() === selectedCategoryCode?.toLowerCase()) || null;

    const activeSubCategories = activeCategoryObj?.subCategories || [];
    const activeSubCategoryObj =
        activeSubCategories.find((sub) => sub.code.toLowerCase() === selectedSubCategoryCode?.toLowerCase()) || null;

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

    const tempMeta = tempCategory ? getCategoryMeta(categories, tempCategory.code) : null;

    const finalTextColor = textColor || (activeMeta ? theme.colors.textPrimary : theme.colors.textSecondary);

    const subSuffix = enableSubCategorySelection && activeSubCategoryObj ? ` · ${activeSubCategoryObj.name}` : "";

    return (
        <>
            {variant === "chip" ? (
                <div style={{ display: "flex" }}>
                    <Chip
                        onClick={handleOpenModal}
                        leading={activeMeta ? <span style={{ fontSize: 16 }}>{activeMeta.icon}</span> : undefined}
                        trailing={<ChevronDown size={14} color={theme.colors.textSecondary} />}
                    >
                        {activeMeta ? `${activeMeta.name}${subSuffix}` : "Select category"}
                    </Chip>
                </div>
            ) : (
                <div
                    onClick={handleOpenModal}
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        userSelect: "none",
                        padding: "0 8px",
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            width: "100%",
                            color: finalTextColor,
                            overflow: "hidden",
                        }}
                    >
                        {label && (
                            <div style={{ fontSize: 10, color: theme.colors.textSecondary, fontWeight: 700, letterSpacing: 0.5 }}>
                                {label}
                            </div>
                        )}

                        {activeMeta ? (
                            <>
                                <span style={{ fontSize: 16, flexShrink: 0 }}>{activeMeta.icon}</span>
                                <span
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {activeMeta.name}
                                    {subSuffix && <span style={{ fontWeight: 500, opacity: 0.7 }}>{subSuffix}</span>}
                                </span>
                            </>
                        ) : (
                            <span
                                style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                Select Category...
                            </span>
                        )}
                        <ChevronDown size={14} color={finalTextColor} style={{ flexShrink: 0 }} />
                    </div>
                </div>
            )}

            {isModalOpen && (
                <BottomSheet
                    onClose={handleCloseModal}
                    title={
                        tempCategory ? (
                            <span>
                                {tempMeta?.icon} {tempMeta?.name}
                            </span>
                        ) : (
                            terms.category
                        )
                    }
                >
                    {tempCategory ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <button
                                type="button"
                                onClick={() => setTempCategory(null)}
                                style={{
                                    alignSelf: "flex-start",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    padding: 0,
                                    border: "none",
                                    background: "transparent",
                                    color: theme.colors.primary,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                <ChevronLeft size={16} /> {terms.back}
                            </button>

                            <ListGroup inset={16}>
                                {(tempCategory.subCategories || []).map((sub) => (
                                    <ListRow key={sub.code} title={sub.name} onClick={() => handleSubCategorySelect(sub.code)} />
                                ))}
                            </ListGroup>
                        </div>
                    ) : (
                        <CategoryGrid
                            categories={listToRender}
                            selectedCategory={activeCategoryObj}
                            selectedSubCat={activeSubCategoryObj}
                            onSelectCategory={handleCategoryClick}
                        />
                    )}
                </BottomSheet>
            )}
        </>
    );
};
