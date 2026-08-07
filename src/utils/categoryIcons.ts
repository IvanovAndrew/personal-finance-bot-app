import type {Category} from "../types/finance.ts";
import type {RawCategory} from "../services/api.ts";

export const CATEGORY_ICONS: Record<string, string> = {

    // Outcome
    Food: '🛒',
    Pets: '🐾',
    Bank: '🏦',
    Beauty: '✨',
    ClothesAndShoes: '🛍️',
    CulturalLife: '🎬',
    CurrencyExchange: '🔱',
    Delivery: '📦',
    Documents: '📄',
    Education: '🎓',
    Flat: '⚡',
    ForHouse: '🏠',
    Gifts: '🎁',
    Health: '💊',
    Hobby: '🎨',
    Onlineservice: '🔄',
    Phone: '📱',
    Psycologist: '🧠',
    Restaurants: '🍔',
    Transport: '🚖',
    Others: '📦',

    // Income
    Salary: '💰',
    VacationPay: '🏖️',
    Bonus: '🎁',
    Cashback: '💸',   
    InterestOnBalance: '📈',
    ApartmentRent: '🔑',
    Improvisation: '🎭',
    IncomeOthers: '💵',
};

export const enrichCategory = (category: RawCategory): Category => ({
    ...category,
    subCategories: category.subCategories?.map((sub) => ({
        code: sub.code,
        name: sub.name,
    })) || [],
    icon: CATEGORY_ICONS[category.code] || '📁',
});