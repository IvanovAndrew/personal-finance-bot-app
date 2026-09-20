import {ChevronDown, ChevronRight, Download} from "lucide-react";
import {type FC, useCallback, useMemo, useState} from "react";

import { theme } from "../../App.styles.ts";
import { type ShopExpensesDto } from "../../services/api.ts";
import type { Category, Currency } from "../../types/finance.ts";
import { formatDateDMMMMYYYY } from "../../utils/dateformatter.ts";
import { Amount } from "../Amount.tsx";
import { ListGroup } from "../Card.tsx";
import { ListRow } from "../ListRow.tsx";
import { LoadingData } from "../LoadingData.tsx";
import { NoAvailableData } from "../NoAvailableData.tsx";
import { ShopAvatar } from "../ShopAvatar.tsx";
import { TransactionRow } from "../TransactionRow.tsx";
import {createPortal} from "react-dom";
import {ExportSheet} from "../ExportSheet.tsx";

interface DayAnalyticsGridProps {
    startDate: Date;
    currency: Currency;
    categories?: Category[];
    items: ShopExpensesDto[];
    isLoading: boolean;
}

export const DayAnalyticsGrid: FC<DayAnalyticsGridProps> = ({
                                                                startDate,
                                                                currency,
                                                                categories = [],
                                                                items,
                                                                isLoading,
                                                            }) => {
    const [expandedShops, setExpandedShops] = useState<Record<string, boolean>>({});
    const [isExportOpen, setIsExportOpen] = useState(false);
    const closeExport = useCallback(() => setIsExportOpen(false), []);

    const toggleShop = (shopName: string) => {
        setExpandedShops((prev) => ({ ...prev, [shopName]: !prev[shopName] }));
    };

    const dayTotal = useMemo(() => (items ?? []).reduce((acc, curr) => acc + curr.total, 0), [items]);

    if (isLoading) {
        return <LoadingData text={"Loading expenses..."} />;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Sticky day header. Translucent + blur, so it needs no knowledge of the page colour. */}
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    padding: "10px 4px",
                    background: "rgba(11, 11, 12, 0.85)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                }}
            >
                <span style={{ fontSize: 15, fontWeight: 700, color: theme.colors.textPrimary }}>
                    {formatDateDMMMMYYYY(startDate)}
                </span>
                <Amount value={dayTotal} currency={currency} size={15} weight={600} color={theme.colors.textSecondary} />
            </div>
            
            

            <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                style={{
                    alignSelf: "flex-end",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: 999,
                    background: theme.colors.surfacePressed,
                    color: theme.colors.textSecondary,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                }}
            >
                <Download size={14} />
                Download
            </button>

            {items.length === 0 ? (
                <NoAvailableData text="No expenses recorded for this day" />
            ) : (
                <ListGroup inset={68}>
                    {items.map((shopExpenses) => {
                        const isExpanded = !!expandedShops[shopExpenses.shop];
                        const Chevron = isExpanded ? ChevronDown : ChevronRight;

                        return (
                            <div key={shopExpenses.shop}>
                                <ListRow
                                    avatar={<ShopAvatar shopName={shopExpenses.shop} size={40} />}
                                    title={shopExpenses.shop}
                                    subtitle={`${shopExpenses.expenses.length} ${shopExpenses.expenses.length === 1 ? "item" : "items"}`}
                                    right={<Amount value={shopExpenses.total} currency={currency} size={15} />}
                                    trailing={<Chevron size={16} color={theme.colors.textSecondary} style={{ flex: "0 0 auto" }} />}
                                    onClick={() => toggleShop(shopExpenses.shop)}
                                />

                                {isExpanded &&
                                    shopExpenses.expenses.map((item, idx) => (
                                        <TransactionRow
                                            key={`${item.shop}-${item.category}-${item.amount}-${idx}`}
                                            transaction={{
                                                shop: item.shop,
                                                category: item.category,
                                                subcategory: item.subCategory,
                                                description: item.description,
                                                amount: item.amount,
                                                isOutcome: true,
                                            }}
                                            categories={categories}
                                            currency={currency}
                                            isInsideGroup
                                        />
                                    ))}
                            </div>
                        );
                    })}
                </ListGroup>
            )}
            {isExportOpen &&
                createPortal(
                    <ExportSheet initialDate={startDate} currency={currency} onClose={closeExport} />,
                    document.body,
                )}
        </div>
    );
};
