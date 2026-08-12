import React, { useMemo } from 'react';
import { modalStyles, theme, commonStyles } from '../App.styles';
import { formatCurrencyValue } from '../utils/numberformatter';
import { getCategoryMeta, getSubCategoryName } from '../utils/categoryutils';
import type { Category, Currency } from '../types/finance';
import type {SaveTransactionPayload} from "../services/api.ts";

interface CheckSavedSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    positions: SaveTransactionPayload[];
    categories?: Category[];
    currency: Currency;
}

export const CheckSavedSuccessModal: React.FC<CheckSavedSuccessModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             positions,
                                                             categories = [],
                                                             currency,
                                                         }) => {
    const totalSum = useMemo(
        () => positions.reduce((acc, p) => acc + p.amount, 0),
        [positions]
    );

    if (!isOpen) return null;

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={modalStyles.header}>
                    <div>
                        <div style={modalStyles.title}>Receipt Saved! 🎉</div>
                        <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '2px' }}>
                            Saved {positions.length} item{positions.length > 1 ? 's' : ''}
                        </div>
                    </div>
                    <button style={modalStyles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Total Summary */}
                <div
                    style={{
                        backgroundColor: theme.colors.bgElement,
                        borderRadius: theme.radius.md,
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: `1px solid ${theme.colors.border}`,
                    }}
                >
          <span style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '700' }}>
            TOTAL AMOUNT
          </span>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: theme.colors.primary }}>
            {formatCurrencyValue(totalSum)} {currency.symbol}
          </span>
                </div>

                {/* Positions List */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        maxHeight: '40vh',
                        overflowY: 'auto',
                        paddingRight: '4px',
                    }}
                >
                    {positions.map((item, idx) => {
                        const meta = getCategoryMeta(categories, item.category || '');
                        const subName = item.subCategory
                            ? getSubCategoryName(categories, item.category || '', item.subCategory)
                            : null;

                        return (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: theme.colors.bgElement,
                                    borderRadius: theme.radius.md,
                                    padding: '10px 12px',
                                    border: `1px solid ${theme.colors.border}`,
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '70%' }}>
                  <span
                      style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: theme.colors.textPrimary,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                      }}
                  >
                    {item.description}
                  </span>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                        style={{
                            fontSize: '10px',
                            fontWeight: '600',
                            color: theme.colors.textSecondary,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                        }}
                    >
                      <span>{meta.icon}</span> {meta.name}
                    </span>

                                        {subName && (
                                            <span
                                                style={{
                                                    fontSize: '10px',
                                                    fontWeight: '600',
                                                    color: theme.colors.primary,
                                                    backgroundColor: theme.colors.primaryLight,
                                                    padding: '1px 6px',
                                                    borderRadius: '4px',
                                                }}
                                            >
                        {subName}
                      </span>
                                        )}
                                    </div>
                                </div>

                                <span style={{ fontSize: '13px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {formatCurrencyValue(item.amount)} {currency.symbol}
                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Action Button */}
                <button style={commonStyles.primaryBtn} onClick={onClose}>
                    Done
                </button>
            </div>
        </div>
    );
};