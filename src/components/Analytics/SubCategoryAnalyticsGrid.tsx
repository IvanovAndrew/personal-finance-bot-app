import {type FC, useState} from "react";
import {commonStyles, theme, receiptStyles, appStyles} from "../../App.styles.ts";
import type {Category} from "../../types/finance.ts";
import {formatDateMMMMYYYY} from "../../utils/dateformatter.ts";
import {getMonthsInRange} from "../../utils/monthEnumerator.ts";

interface SubCategoryAnalyticsGridProps {
    categories: Category[];
    selectedMonth: Date;
    currency: string;
}

export const SubCategoryAnalyticsGrid: FC<SubCategoryAnalyticsGridProps> = ({ categories, selectedMonth, currency }) => {

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(categories[0] || null);
    const [selectedSubCatId, setSelectedSubCatId] = useState<string | null>(null);

    const [subCatViewType, setSubCatViewType] = useState<'total' | 'monthly'>('total');

    const requestedMonths = getMonthsInRange(selectedMonth);

    return <div style={commonStyles.card}>
        <span style={commonStyles.cardTitle}>Subcategory analytics</span>

        <div style={commonStyles.inputGroup}>
            <label style={commonStyles.label}>Category</label>
            <select
                value={selectedCategory?.code || ''}
                onChange={(e) => {
                    const found = categories.find(c => c.code === e.target.value);
                    if (found) setSelectedCategory(found);
                }}
                style={commonStyles.input}
            >
                {categories.map(c => (
                    <option key={c.code} value={c.code}>{c.icon} {c.name}</option>
                ))}
            </select>
        </div>

        <div style={appStyles.typeToggleGroup}>
            <button
                onClick={() => setSubCatViewType('total')}
                style={{
                    ...appStyles.typeBtn,
                    ...(subCatViewType === 'total' ? { backgroundColor: theme.colors.bgElement, color: theme.colors.primary } : {}),
                }}
            >
                Total
            </button>
            <button
                onClick={() => setSubCatViewType('monthly')}
                style={{
                    ...appStyles.typeBtn,
                    ...(subCatViewType === 'monthly' ? { backgroundColor: theme.colors.bgElement, color: theme.colors.primary } : {}),
                }}
            >
                Monthly
            </button>
        </div>

        {subCatViewType === 'total' && (
            <div style={receiptStyles.manualList}>
                {(selectedCategory?.subCategories || []).map((sub, i) => (
                    <div key={sub.code} style={{ ...receiptStyles.subChip, justifyContent: 'space-between', padding: '12px' }}>
                        <span>{sub.name}</span>
                        <span style={{ fontWeight: '700', color: theme.colors.textPrimary }}>
                    {(i + 1) * 18500} {currency}
                  </span>
                    </div>
                ))}
            </div>
        )}

        {subCatViewType === 'monthly' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={commonStyles.label}>Choose a subcategory</label>
                <div style={receiptStyles.subSelector}>
                    {(selectedCategory?.subCategories || []).map(sub => (
                        <button
                            key={sub.code}
                            onClick={() => setSelectedSubCatId(sub.code)}
                            style={{
                                ...receiptStyles.subChip,
                                ...(selectedSubCatId === sub.code ? receiptStyles.subChipActive : {}),
                            }}
                        >
                            {sub.name}
                        </button>
                    ))}
                </div>

                <div style={receiptStyles.manualList}>
                    {requestedMonths.map((m, idx) => (
                        <div key={formatDateMMMMYYYY(m)} style={{ ...receiptStyles.subChip, justifyContent: 'space-between', padding: '10px 12px' }}>
                            <span style={{ color: theme.colors.textSecondary }}>{formatDateMMMMYYYY(m)}</span>
                            <span style={{ fontWeight: '700', color: theme.colors.primary }}>
                      {(idx + 2) * 8400} {currency}
                    </span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>;
}