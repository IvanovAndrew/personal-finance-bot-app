import type { Category, Currency } from "../../../types/finance.ts";
import type { FutureExpense } from "../../../services/api.ts";
import { getCategoryMeta, getSubCategoryName } from "../../../utils/categoryutils.ts";
import { getShopMeta } from "../../../utils/shoplogos.ts";
import {formatPaymentDateRange} from "../../../utils/dateformatter.ts";
import {parseIsoDate} from "../../../utils/dateparser.ts";

// Pure logic of the Summary screen. No React, no formatting for display (dates, currency).

export interface ExpenseAvatar {
    kind: "shop" | "category";
    /** Shop name (kind "shop") or category display name (kind "category"). */
    name: string;
    /** Category colour/icon; unset for a shop avatar (ShopAvatar draws its own logo). */
    color?: string;
    icon?: string;
}

export interface FutureExpenseRow {
    key: number;
    title: string;
    subtitle: string;
    avatar: ExpenseAvatar;
    /** Always negative: a future expense reduces the balance. */
    amount: number;
    currency: Currency;
}

/** Category name, plus the subcategory name when the expense has one and it is known. */
export const describeCategory = (categories: Category[], exp: FutureExpense): string => {
    const meta = getCategoryMeta(categories, exp.category || "");
    const subName = exp.subCategory ? getSubCategoryName(categories, exp.category || "", exp.subCategory) : null;
    return subName ? `${meta.name} · ${subName}` : meta.name;
};

export const describePaymentDate = (exp: FutureExpense): string | null =>
    exp.start && exp.end
        ? formatPaymentDateRange(parseIsoDate(exp.start), parseIsoDate(exp.end))
        : null;

/** A shop avatar when we have a logo for it, else the expense's category avatar. */
export const resolveExpenseAvatar = (categories: Category[], exp: FutureExpense): ExpenseAvatar => {
    if (exp.shop && getShopMeta(exp.shop)) return { kind: "shop", name: exp.shop };
    const meta = getCategoryMeta(categories, exp.category || "");
    return { kind: "category", name: meta.name, color: meta.color, icon: meta.icon };
};

export const buildFutureExpenseRows = (categories: Category[], expenses: FutureExpense[], currency: Currency): FutureExpenseRow[] =>
    expenses.sort((a, b) => parseIsoDate(a.start).getTime() - parseIsoDate(b.start).getTime()).map((exp, index) => ({
        key: index,
        title: exp.name,
        subtitle: [describeCategory(categories, exp), describePaymentDate(exp)]
            .filter(Boolean)
            .join(" · "),
        avatar: resolveExpenseAvatar(categories, exp),
        amount: -exp.amount,
        currency,
    }));
