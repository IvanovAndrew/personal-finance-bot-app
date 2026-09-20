import { Download, Loader2 } from "lucide-react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";

import { theme } from "../../App.styles.ts";
import type { Category, Currency } from "../../types/finance.ts";
import { Button } from "../Button.tsx";
import { ExportSheet } from "../ExportSheet.tsx";
import { LoadingData } from "../LoadingData.tsx";
import { NoAvailableData } from "../NoAvailableData.tsx";
import type { DailyGroup } from "./AnalyticsTab.tsx";
import { DaySection } from "./DaySection.tsx";

interface TransactionsGridProps {
    groups: DailyGroup[];
    currency: Currency;
    categories?: Category[];
    /** Initial load (or reload after a filter change). */
    isLoading: boolean;
    /** Loading the next chunk of older days. */
    isLoadingMore: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    /** The day selected in the header; the export sheet starts from it. */
    anchorDate: Date;
}

export const TransactionsGrid: FC<TransactionsGridProps> = ({
                                                                groups,
                                                                currency,
                                                                categories = [],
                                                                isLoading,
                                                                isLoadingMore,
                                                                hasMore,
                                                                onLoadMore,
                                                                anchorDate,
                                                            }) => {
    const [isExportOpen, setIsExportOpen] = useState(false);
    const closeExport = useCallback(() => setIsExportOpen(false), []);

    // --- infinite scroll -------------------------------------------------------------------------------------
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const onLoadMoreRef = useRef(onLoadMore);
    useEffect(() => {
        onLoadMoreRef.current = onLoadMore;
    });

    const isEmpty = groups.length === 0;
    const canObserve = hasMore && !isLoading && !isLoadingMore && !isEmpty;

    // The observer only exists while the list is idle. It is re-created after every chunk (deps below), and a new
    // observer reports the current state right away: if the sentinel is still on screen, the next chunk is requested.
    // A long-lived observer would stay silent in that case, because "still intersecting" is not a change.
    useEffect(() => {
        const el = sentinelRef.current;
        if (!canObserve || !el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) onLoadMoreRef.current();
            },
            { rootMargin: "400px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [canObserve, groups.length]);

    // --- render ---------------------------------------------------------------------------------------------
    if (isLoading && isEmpty) {
        return <LoadingData text="Loading expenses..." />;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Button
                variant="secondary"
                fullWidth={false}
                icon={<Download size={16} color={theme.colors.primary} />}
                onClick={() => setIsExportOpen(true)}
            >
                Download
            </Button>

            {isEmpty ? (
                <NoAvailableData text="No expenses in this period" />
            ) : (
                groups.map((group) => (
                    <DaySection
                        key={group.date.toISOString()}
                        date={group.date}
                        currency={currency}
                        categories={categories}
                        items={group.items}
                    />
                ))
            )}

            <div
                ref={sentinelRef}
                style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "16px 0", minHeight: 40 }}
            >
                {isLoadingMore && (
                    <Loader2 size={20} color={theme.colors.primary} style={{ animation: "spin 1s linear infinite" }} />
                )}
                {!hasMore && !isLoadingMore && !isEmpty && (
                    <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>No earlier data</span>
                )}
            </div>

            {isExportOpen && <ExportSheet initialDate={anchorDate} currency={currency} onClose={closeExport} />}
        </div>
    );
};
