import type { ShopExpensesDto } from "../services/api.ts";

export interface DayExpenses {
    date: Date;
    items: ShopExpensesDto[];
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Локальная дата -> "YYYY-MM-DD" для <input type="date">. НЕ через toISOString: в UTC+4 это сдвигает день назад. */
export const toDateInputValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromDateInputValue = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
}