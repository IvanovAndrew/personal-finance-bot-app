import React from 'react';
import { theme, receiptStyles } from '../App.styles';
import { getShopMeta } from '../utils/shoplogos.ts';
import { getCategoryMeta, getSubCategoryName } from '../utils/categoryutils';
import { ShopAvatar } from './ShopAvatar';
import { formatCurrencyValue } from '../utils/numberformatter';
import type { Category, Currency } from '../types/finance';

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

    // 1. Главная строка: В первую очередь description
    // Если description пустой — берем shop, подкатегорию или категорию
    const titleText = rawDescription || rawShop || rawSubCategory || categoryMeta.name;

    // 2. Флаги для подстроки (чтобы не дублировать название, если оно ушло в заголовок)
    const showShopInSubtitle = Boolean(rawDescription && rawShop) && !isInsideGroup;
    const showSubCategoryInSubtitle = Boolean(rawSubCategory && (rawDescription || rawShop));

    const hasSubtitle = showShopInSubtitle || showSubCategoryInSubtitle;

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
            {/* Левый блок: Иконка + Тексты */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', minWidth: 0 }}>

                {/* Аватар магазина или Иконка категории */}
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

                {/* Текстовый блок */}
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {/* Главная строка (Description) */}
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

                    {/* Подстрока: Название магазина + Подкатегория (плашка) */}
                    {hasSubtitle && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '2px',
                                overflow: 'hidden',
                            }}
                        >
                            {showShopInSubtitle && (
                                <span
                                    style={{
                                        fontSize: '11px',
                                        color: theme.colors.textSecondary,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {rawShop}
                                </span>
                            )}

                            {showSubCategoryInSubtitle && (
                                <span
                                    style={{
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        color: theme.colors.primary,
                                        backgroundColor: theme.colors.primaryLight || 'rgba(99, 102, 241, 0.15)',
                                        padding: '1px 6px',
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

            {/* Правый блок: Сумма */}
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