import { type FC, useState } from "react";

import { theme } from "../../App.styles.ts";
import { terms } from "../../constants/strings.ts";
import type { FutureExpense, SummaryResponse } from "../../services/api.ts";
import type { Category, Currency } from "../../types/finance.ts";
import { getCategoryMeta, getSubCategoryName } from "../../utils/categoryutils.ts";
import { formatDateDMMMMYYYY } from "../../utils/dateformatter.ts";
import { getShopMeta } from "../../utils/shoplogos.ts";
import { Amount } from "../Amount.tsx";
import { Avatar } from "../Avatar.tsx";
import { BottomSheet } from "../BottomSheet.tsx";
import { Divider, ListGroup } from "../Card.tsx";
import { HeroNumber } from "../HeroNumber.tsx";
import { ListRow } from "../ListRow.tsx";
import { LoadingData } from "../LoadingData.tsx";
import { NoAvailableData } from "../NoAvailableData.tsx";
import { ShopAvatar } from "../ShopAvatar.tsx";
import { StatTile } from "../StatTile.tsx";

interface SummaryAnalyticsGridProps {
    currency: Currency;
    summary: SummaryResponse | null;
    categories: Category[];
    isLoading: boolean;
}

export const SummaryAnalyticsGrid: FC<SummaryAnalyticsGridProps> = ({ currency, summary, categories, isLoading }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) {
        return <LoadingData text={"Loading data..."} />;
    }

    if (!summary) {
        return <NoAvailableData />;
    }

    const {
        totalIncome,
        totalOutcome,
        totalBalance,
        futureExpensesTotal,
        futureExpenses = [],
        realFreeMoney,
        dailyBudgetLimit,
        startPeriod,
        payday,
        daysUntilPayday,
    } = summary;

    const hasFutureExpenses = futureExpenses.length > 0;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <HeroNumber
                heroLabel={terms.dailyBudgetLimit}
                heroValue={dailyBudgetLimit}
                currency={currency}
                caption={`${daysUntilPayday} budget days · ${formatDateDMMMMYYYY(new Date(startPeriod))} — ${formatDateDMMMMYYYY(new Date(payday))}`}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <StatTile label={terms.income} value={totalIncome} currency={currency} color={theme.colors.success} />
                <StatTile label={terms.expenses} value={-totalOutcome} currency={currency} color={theme.colors.danger} />
            </div>

            <ListGroup inset={16}>
                <ListRow
                    title={terms.netBalance}
                    right={<Amount value={totalBalance} currency={currency} size={15} />}
                />
                <ListRow
                    title={terms.upcomingPayments}
                    right={<Amount value={-futureExpensesTotal} currency={currency} size={15} signed weight={600} />}
                    onClick={hasFutureExpenses ? () => setIsModalOpen(true) : undefined}
                />
                <ListRow
                    title={<span style={{ fontWeight: 700 }}>{terms.safeToSpend}</span>}
                    right={
                        <Amount value={realFreeMoney} currency={currency} size={17} color={theme.colors.success} />
                    }
                />
            </ListGroup>

            {isModalOpen && (
                <BottomSheet title={terms.upcomingPayments} onClose={() => setIsModalOpen(false)}>
                    {futureExpenses.map((exp: FutureExpense, idx: number) => {
                        const meta = getCategoryMeta(categories, exp.category || "");
                        const subName = exp.subCategory
                            ? getSubCategoryName(categories, exp.category || "", exp.subCategory)
                            : null;
                        const hasShopLogo = Boolean(getShopMeta(exp.shop));

                        return (
                            <div key={idx}>
                                {idx > 0 && <Divider inset={68} />}
                                <ListRow
                                    avatar={
                                        hasShopLogo ? (
                                            <ShopAvatar shopName={exp.shop} size={40} />
                                        ) : (
                                            <Avatar name={meta.name} color={meta.color} icon={meta.icon} />
                                        )
                                    }
                                    title={exp.name}
                                    subtitle={`${meta.name}${subName ? ` · ${subName}` : ""}`}
                                    right={<Amount value={-exp.amount} currency={currency} size={15} signed />}
                                />
                            </div>
                        );
                    })}
                </BottomSheet>
            )}
        </div>
    );
};
