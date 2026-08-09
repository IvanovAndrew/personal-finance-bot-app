import React from 'react';
import { X } from 'lucide-react';
import type { Category, SubCategory } from '../types/finance';
import {modalStyles, theme} from '../App.styles';

interface SubCategoryModalProps {
    category: Category | null;
    selectedSubCat: SubCategory | null;
    onSelectSubCat: (sub: SubCategory) => void;
    onClose: () => void;
}

export const SubCategoryModal: React.FC<SubCategoryModalProps> = ({
                                                                      category,
                                                                      selectedSubCat,
                                                                      onSelectSubCat,
                                                                      onClose,
                                                                  }) => {
    return (
        <div
            style={modalStyles.overlay}
            onClick={onClose}
        >
            <div
                style={modalStyles.content}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={modalStyles.header}>
                    <span style={modalStyles.title}>
                        {category?.icon} {category?.name}
                    </span>
                    <button
                        onClick={onClose}
                        style={modalStyles.closeBtn}
                    >
                        <X size={20} />
                    </button>
                </div>

                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                    Enter subcategory:
                </span>
                
                <div style={modalStyles.subGrid}>
                    {category?.subCategories.map((sub) => {
                        const isSelected = selectedSubCat?.code === sub.code;
                        return (
                            <button
                                key={sub.code}
                                onClick={() => onSelectSubCat(sub)}
                                style={{
                                ...modalStyles.subItemBtn,
                                ...(isSelected ? modalStyles.subItemBtnActive : {})
                            }}
                            >
                                {sub.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};