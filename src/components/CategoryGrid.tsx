import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useMemo, useState } from "react";

import { theme } from "../App.styles";
import type { Category, SubCategory } from "../types/finance";

interface CategoryGridProps {
    categories: Category[];
    selectedCategory: Category | null;
    selectedSubCat: SubCategory | null;
    onSelectCategory: (cat: Category | null) => void;
}

const ITEMS_PER_PAGE = 12;

const tileStyle = (selected: boolean): React.CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    padding: "10px 4px",
    border: "none",
    borderRadius: 16,
    background: selected ? theme.colors.primaryLight : theme.colors.surfacePressed,
    cursor: "pointer",
    transition: "background-color 0.15s ease",
});

const labelStyle = (selected: boolean): React.CSSProperties => ({
    maxWidth: "100%",
    fontSize: 12,
    fontWeight: 600,
    color: selected ? theme.colors.primary : theme.colors.textSecondary,
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
});

/** Category picker tiles. Meant to live inside a BottomSheet, so it has no card of its own. */
export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, selectedCategory, onSelectCategory }) => {
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
    const itemsPerPage = isPaginated ? ITEMS_PER_PAGE - 1 : ITEMS_PER_PAGE;
    const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);

    const currentCategories = isPaginated
        ? sortedCategories.slice(page * itemsPerPage, (page + 1) * itemsPerPage)
        : sortedCategories;

    const remainingCount = sortedCategories.length - (page + 1) * itemsPerPage;
    const isLastPage = page === totalPages - 1;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {currentCategories.map((cat) => {
                const isSelected = selectedCategory !== null && selectedCategory.code === cat.code;
                return (
                    <button key={cat.code} type="button" onClick={() => onSelectCategory(cat)} style={tileStyle(isSelected)}>
                        <span style={{ fontSize: 24, lineHeight: 1 }}>{cat.icon}</span>
                        <span style={labelStyle(isSelected)}>{cat.name}</span>
                    </button>
                );
            })}

            {isPaginated && (
                <button type="button" onClick={() => setPage((prev) => (prev + 1) % totalPages)} style={tileStyle(false)}>
                    {isLastPage ? (
                        <ChevronLeft size={24} color={theme.colors.textSecondary} />
                    ) : (
                        <ChevronRight size={24} color={theme.colors.textSecondary} />
                    )}
                    <span style={labelStyle(false)}>
                        {isLastPage ? "Back" : `More${remainingCount > 0 ? ` (${remainingCount})` : ""}`}
                    </span>
                </button>
            )}
        </div>
    );
};
