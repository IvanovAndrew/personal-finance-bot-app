import { type FC, useState } from "react";
import { theme } from "../../App.styles.ts";
import type { Category } from "../../types/finance.ts";
import type { MonthlyAnalyticsResponse } from "../../services/api.ts";
import { CategoryDetailGrid } from "./CategoryDetailGrid.tsx";

interface CategoryAnalyticsGridProps {
    categories: Category[];
    startMonth: Date;
    currency: string;
    monthlyData: MonthlyAnalyticsResponse | null;
}

export const CategoryAnalyticsGrid: FC<CategoryAnalyticsGridProps> = ({
                                                                          categories,
                                                                          currency,
                                                                          monthlyData,
                                                                      }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <CategoryDetailGrid categories={categories} currency={currency} monthlyData={monthlyData} />
        </div>
    );
};