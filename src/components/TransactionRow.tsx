import React from 'react';

import { receiptStyles, theme } from '../App.styles';
import type { Category, Currency } from '../types/finance';
import { getCategoryMeta, getSubCategoryName } from '../utils/categoryutils';
import { formatCurrencyValue } from '../utils/numberformatter';
import { getShopMeta } from '../utils/shoplogos.ts';
import { ShopAvatar } from './ShopAvatar';

interface TransactionRowProps {
    transaction: {
        shop?: string | null;
        category: string;
        subcategory?: string | null;
        description?: string | null;
        amount: number;
        isOutcome: boolean;
    };
    categories: Category[];
    currency: Currency;

    isLast?: boolean;
    isInsideGroup?: boolean;
    variant?: 'card' | 'flat';
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
                                                                  transaction,
                                                                  categories,
                                                                  currency,
                                                                  isLast = false,
                                                                  isInsideGroup = false,
                                                                  variant = 'card',
                                                              }) => {
    const shopMeta = getShopMeta(transaction.shop);
    const categoryMeta = getCategoryMeta(categories, transaction.category);
    const subCategoryName = getSubCategoryName(categories, transaction.category, transaction.subcategory);

    const hasShopLogo = Boolean(shopMeta);

    const rawDescription = transaction.description?.trim();
    const rawShop = transaction.shop?.trim();
    const rawSubCategory = subCategoryName?.trim();
    const rawCategory = categoryMeta.name?.trim();

    // 1. Main row title: Prioritize description.
    // Fall back to shop, subcategory, or category name if description is missing.
    const titleText = rawDescription || rawShop || rawSubCategory || rawCategory;

    // 2. Subtitle visibility flags
    const showShopInSubtitle = Boolean(rawDescription && rawShop) && !isInsideGroup;
    const showSubCategoryInSubtitle = Boolean(rawSubCategory && (rawDescription || rawShop));

    // Show category chip if we have a valid category name distinct from the subcategory name
    const showCategoryInSubtitle = Boolean(
        rawCategory &&
        rawCategory !== rawSubCategory &&
        (rawDescription || rawShop)
    );

    const hasSubtitle = showShopInSubtitle || showSubCategoryInSubtitle || showCategoryInSubtitle;

    return (
        <div
            style={{
                ...receiptStyles.subChip,
                backgroundColor: variant === 'flat' ? 'transparent' : theme.colors.bgElement,
                borderRadius: variant === 'flat' ? '0px' : (theme.radius.md || '10px'),
                border: variant === 'flat' ? 'none' : `1px solid ${theme.colors.border}`,
                borderBottom: (variant === 'flat' && !isLast) ? `1px solid ${theme.colors.border}` : 'none',
                padding: variant === 'flat' ? '8px 0px' : '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
            }}
        >
            {/* Left section: Icon / Avatar + Text labels */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', minWidth: 0 }}>

                {/* Shop avatar or Category fallback icon */}
                {hasShopLogo && !isInsideGroup ? (
                    <ShopAvatar shopName={transaction.shop} size={32} />
                ) : (
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: theme.colors.bgCard,
                            border: `1px solid ${theme.colors.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            flexShrink: 0,
                        }}
                    >
                        {categoryMeta.icon}
                    </div>
                )}

                {/* Text container */}
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {/* Primary title */}
                    <span
                        style={{
                            fontWeight: '600',
                            fontSize: '13px',
                            color: theme.colors.textPrimary,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {titleText}
                    </span>

                    {/* Subtitle row: Shop name + Category chips */}
                    {hasSubtitle && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '2px',
                                overflow: 'hidden',
                            }}
                        >
                            {showShopInSubtitle && (
                                <span
                                    style={{
                                        fontSize: '11px',
                                        color: theme.colors.textSecondary,
                                        marginRight: '2px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {rawShop}
                                </span>
                            )}

                            {/* Parent Category Chip */}
                            {showCategoryInSubtitle && (
                                <span
                                    style={{
                                        fontSize: '10px',
                                        fontWeight: '500',
                                        color: theme.colors.textSecondary,
                                        backgroundColor: theme.colors.bgCard || 'rgba(255, 255, 255, 0.06)',
                                        border: `1px solid ${theme.colors.border}`,
                                        padding: '1px 5px',
                                        borderRadius: '4px',
                                        whiteSpace: 'nowrap',
                                        lineHeight: '1.3',
                                    }}
                                >
                                    {rawCategory}
                                </span>
                            )}

                            {/* SubCategory Chip */}
                            {showSubCategoryInSubtitle && (
                                <span
                                    style={{
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        color: theme.colors.primary,
                                        backgroundColor: theme.colors.primaryLight || 'rgba(99, 102, 241, 0.15)',
                                        padding: '1px 5px',
                                        borderRadius: '4px',
                                        whiteSpace: 'nowrap',
                                        lineHeight: '1.3',
                                    }}
                                >
                                    {rawSubCategory}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right section: Amount */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span
                    style={{
                        fontWeight: '700',
                        fontSize: '13px',
                        color: transaction.isOutcome ? theme.colors.textPrimary : theme.colors.success,
                    }}
                >
                    {transaction.isOutcome ? '-' : '+'}{formatCurrencyValue(transaction.amount)} {currency.symbol}
                </span>
            </div>
        </div>
    );
};