import React from "react";

import { theme } from "../App.styles";
import type { Category, Currency } from "../types/finance";
import { getCategoryMeta, getSubCategoryName } from "../utils/categoryutils";
import { getShopMeta } from "../utils/shoplogos.ts";
import { Amount } from "./Amount.tsx";
import { Avatar } from "./Avatar.tsx";
import { ShopAvatar } from "./ShopAvatar";

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
    /** Row is nested under a shop header: no avatar, text aligned with the header's title. */
    isInsideGroup?: boolean;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
                                                                  transaction,
                                                                  categories,
                                                                  currency,
                                                                  isInsideGroup = false,
                                                              }) => {
    const shopMeta = getShopMeta(transaction.shop);
    const categoryMeta = getCategoryMeta(categories, transaction.category);
    const subCategoryName = getSubCategoryName(categories, transaction.category, transaction.subcategory);

    const rawDescription = transaction.description?.trim();
    const rawShop = transaction.shop?.trim();
    const rawSubCategory = subCategoryName?.trim();
    const rawCategory = categoryMeta.name?.trim();

    // Title: description first, then shop, subcategory, category.
    const titleText = rawDescription || rawShop || rawSubCategory || rawCategory;

    // Subtitle: the details that are not already in the title.
    const subtitleParts = [
        rawDescription && rawShop && !isInsideGroup ? rawShop : null,
        rawCategory && rawCategory !== rawSubCategory && (rawDescription || rawShop) ? rawCategory : null,
        rawSubCategory && (rawDescription || rawShop) ? rawSubCategory : null,
    ].filter(Boolean);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: isInsideGroup ? "10px 16px 10px 68px" : "12px 16px",
            }}
        >
            {!isInsideGroup &&
                (shopMeta ? (
                    <ShopAvatar shopName={transaction.shop} size={40} />
                ) : (
                    <Avatar name={categoryMeta.name} color={categoryMeta.color} icon={categoryMeta.icon} />
                ))}

            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: theme.colors.textPrimary,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {titleText}
                </div>
                {subtitleParts.length > 0 && (
                    <div
                        style={{
                            marginTop: 2,
                            fontSize: 13,
                            color: theme.colors.textSecondary,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {subtitleParts.join(" · ")}
                    </div>
                )}
            </div>

            <Amount
                value={transaction.isOutcome ? -transaction.amount : transaction.amount}
                currency={currency}
                size={15}
                weight={600}
                signed
                color={transaction.isOutcome ? theme.colors.textPrimary : theme.colors.success}
            />
        </div>
    );
};
