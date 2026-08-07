import {type FC, useState} from "react";
import {commonStyles, theme, receiptStyles} from "../../App.styles.ts";
import type {Category} from "../../types/finance.ts";
import {formatDateMMMMYYYY} from "../../utils/dateformatter.ts";
import {getMonthsInRange} from "../../utils/monthEnumerator.ts";

interface CategoryAnalyticsGridProps {
    categories: Category[];
    selectedMonth: Date;
    currency: string;
}

export const CategoryAnalyticsGrid: FC<CategoryAnalyticsGridProps> = ({ categories, selectedMonth, currency }) => {

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(categories[0] || null);

    const requestedMonths = getMonthsInRange(selectedMonth);
    
    return <div style={commonStyles.card}>
        <span style={commonStyles.cardTitle}>Categories for {formatDateMMMMYYYY(selectedMonth)}</span>

        <div style={receiptStyles.manualList}>
            {categories.slice(0, 4).map((cat, i) => {
                const amounts = [45000, 28000, 15000, 8900];
                const isSelected = selectedCategory?.code === cat.code;
                return (
                    <div
                        key={cat.code}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                            ...receiptStyles.subChip,
                            ...(isSelected ? receiptStyles.subChipActive : {}),
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            padding: '12px',
                            gap: '8px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600' }}>{cat.icon} {cat.name}</span>
                            <span style={{ fontWeight: '700', color: theme.colors.primary }}>
                      {amounts[i]} {currency}
                    </span>
                        </div>
                        <div style={{ width: '100%', height: '4px', backgroundColor: theme.colors.bgElement, borderRadius: '2px' }}>
                            <div style={{ width: `${60 - i * 12}%`, height: '100%', backgroundColor: theme.colors.primary, borderRadius: '2px' }} />
                        </div>
                    </div>
                );
            })}
        </div>

        {selectedCategory && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${theme.colors.border}` }}>
              <span style={{ ...commonStyles.cardTitle, fontSize: '14px' }}>
                Dynamic: {selectedCategory.name}
              </span>
              <p style={commonStyles.cardSub}>Monthly Expenses</p>

              <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '8px',
                  overflowX: 'auto',               // Включаем скролл
                  paddingBottom: '6px',            // Отступ под скроллбар
                  WebkitOverflowScrolling: 'touch' // Плавность на iOS }}>
              }}>
                  {requestedMonths.map((m, idx) => (
                      <div key={formatDateMMMMYYYY(m)} style={{ ...receiptStyles.subChip, flex: 1, flexDirection: 'column', padding: '8px 4px' }}>
                          <span style={{ fontSize: '10px', color: theme.colors.textSecondary }}>{formatDateMMMMYYYY(m)}</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: idx === 3 ? theme.colors.primary : theme.colors.textPrimary }}>
                    {(idx + 1) * 12000}
                            </span>
                      </div>
               ))}
              </div>
            </div>
          )}
    </div>;
} 