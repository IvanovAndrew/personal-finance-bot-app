import type {Category} from "../types/finance.ts";
import type {RawCategory} from "../services/api.ts";
import {defaultColor} from "./categoryutils.ts";

export interface CategoryVisual {
    icon: string;
    color: string;
}

export const CATEGORY_ICONS: Record<string, CategoryVisual> = {
    // Outcome
    Food: { icon: '🛒', color: '#4CAF50' },             // Сочный зеленый
    Bank: { icon: '🏦', color: '#3F51B5' },             // Глубокий синий
    Beauty: { icon: '✨', color: '#E91E63' },           // Розовый
    ClothesAndShoes: { icon: '🛍️', color: '#9C27B0' },  // Фиолетовый
    CurrencyExchange: { icon: '🔱', color: '#00BCD4' }, // Бирюзовый
    Delivery: { icon: '📦', color: '#FF9800' },         // Оранжевый
    Documents: { icon: '📄', color: '#607D8B' },        // Серый Slate
    Education: { icon: '🎓', color: '#2196F3' },        // Синий
    Flat: { icon: '⚡', color: '#FFC107' },             // Ярко-желтый
    ForHouse: { icon: '🏠', color: '#8BC34A' },         // Салатовый
    Gifts: { icon: '🎁', color: '#FF4081' },            // Ярко-розовый
    Health: { icon: '💊', color: '#F44336' },           // Красный
    Hobby: { icon: '🎨', color: '#673AB7' },            // Тёмно-фиолетовый
    Leisure: { icon: '🎬', color: '#E040FB' },          // Пурпурный
    Onlineservice: { icon: '🔄', color: '#009688' },    // Морская волна
    Pets: { icon: '🐾', color: '#795548' },             // Коричневый
    Phone: { icon: '📱', color: '#00E676' },            // Неоново-зеленый
    Psycologist: { icon: '🧠', color: '#FF80AB' },       // Нежно-розовый
    Restaurants: { icon: '🍔', color: '#FF5722' },      // Красно-оранжевый
    Transport: { icon: '🚖', color: '#FFB300' },        // Желто-оранжевый
    Others: { icon: '📦', color: '#9E9E9E' },           // Нейтральный серый

    // Income (Доходы)
    Salary: { icon: '💰', color: '#2E7D32' },            // Темно-зеленый
    VacationPay: { icon: '🏖️', color: '#00ACC1' },      // Голубой океан
    Bonus: { icon: '🎁', color: '#FFD700' },             // Золотой
    Cashback: { icon: '💸', color: '#00E676' },          // Изумрудный
    InterestOnBalance: { icon: '📈', color: '#1B5E20' }, // Глубокий зеленый
    ApartmentRent: { icon: '🔑', color: '#8D6E63' },     // Теплый коричневый
    Improvisation: { icon: '🎭', color: '#AB47BC' },     // Сиреневый
    IncomeOthers: { icon: '💵', color: '#66BB6A' },      // Мягкий зеленый
};



export const enrichCategory = (category: RawCategory): Category => ({
    ...category,
    subCategories: category.subCategories?.map((sub) => ({
        code: sub.code,
        name: sub.name,
    })) || [],
    icon: CATEGORY_ICONS[category.code]?.icon || '📁',
    color: CATEGORY_ICONS[category.code]?.color || defaultColor,
});