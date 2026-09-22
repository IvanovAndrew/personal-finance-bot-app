import { type FC, useMemo, useState } from "react";

import { theme } from "../../../App.styles.ts";
import { terms } from "../../../constants/strings.ts";
import type { SummaryResponse } from "../../../services/api.ts";
import type { Category, Currency } from "../../../types/finance.ts";
import { parseDateKey } from "../../../utils/dates.ts";
import { formatDateDMMMMYYYY } from "../../../utils/dateformatter.ts";
import { Amount } from "../../Amount.tsx";
import { Avatar } from "../../Avatar.tsx";
import { BottomSheet } from "../../../shared/ui/BottomSheet.tsx";
import { Divider, ListGroup } from "../../../shared/ui/Card.tsx";
import { HeroNumber } from "../../HeroNumber.tsx";
import { ListRow } from "../../ListRow.tsx";
import { LoadingData } from "../../../shared/ui/LoadingData.tsx";
import { NoAvailableData } from "../../../shared/ui/NoAvailableData.tsx";
import { ShopAvatar } from "../../ShopAvatar.tsx";
import { StatTile } from "../../StatTile.tsx";
import { buildFutureExpenseRows } from "./summaryAnalytics.ts";

interface SummaryAnalyticsGridProps {
    currency: Currency;
    summary: SummaryResponse | null;
    categories: Category[];
    isLoading: boolean;
}

export const SummaryAnalyticsGrid: FC<SummaryAnalyticsGridProps> = ({ currency, summary, categories, isLoading }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Hooks must run unconditionally, before the early returns below; buildFutureExpenseRows is cheap
    // (it runs once when the sheet opens, not on every keystroke), so memoising it is a small safeguard, not a fix for a slow computation.
    const rows = useMemo(
        () => buildFutureExpenseRows(categories, summary?.futureExpenses ?? [], currency),
        [categories, summary?.futureExpenses, currency]
    );

    if (isLoading) {
        return <LoadingData text={"Loading data..."} />;
    }

    if (!summary) {
        return <NoAvailableData />;
    }

    const { totalIncome, totalOutcome, totalBalance, futureExpensesTotal, realFreeMoney, dailyBudgetLimit, startPeriod, payday, daysUntilPayday } = summary;

    const hasFutureExpenses = rows.length > 0;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <HeroNumber
                heroLabel={terms.dailyBudgetLimit}
                heroValue={dailyBudgetLimit}
                currency={currency}
                caption={`${daysUntilPayday} budget days · ${formatDateDMMMMYYYY(parseDateKey(startPeriod))} — ${formatDateDMMMMYYYY(parseDateKey(payday))}`}
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
                    right={<Amount value={realFreeMoney} currency={currency} size={17} color={theme.colors.success} />}
                />
            </ListGroup>

            {isModalOpen && (
                <BottomSheet title={terms.upcomingPayments} onClose={() => setIsModalOpen(false)}>
                    {rows.map((row, idx) => (
                        <div key={row.key}>
                            {idx > 0 && <Divider inset={68} />}
                            <ListRow
                                avatar={
                                    row.avatar.kind === "shop" ? (
                                        <ShopAvatar shopName={row.avatar.name} size={40} />
                                    ) : (
                                        <Avatar name={row.avatar.name} color={row.avatar.color!} icon={row.avatar.icon} />
                                    )
                                }
                                title={row.title}
                                subtitle={row.subtitle}
                                right={<Amount value={row.amount} currency={row.currency} size={15} signed />}
                            />
                        </div>
                    ))}
                </BottomSheet>
            )}
        </div>
    );
};
