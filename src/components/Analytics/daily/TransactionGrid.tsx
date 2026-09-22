import { Download, Loader2 } from "lucide-react";
import { type FC, useCallback, useState } from "react";

import { theme } from "../../../App.styles.ts";
import { useLoadMoreSentinel } from "../../../hooks/useLoadMoreSentinel.ts";
import type { Category, Currency } from "../../../types/finance.ts";
import { Button } from "../../../shared/ui/Button.tsx";
import { ErrorData } from "../../../shared/ui/Error.tsx";
import { ExportSheet } from "../../ExportSheet.tsx";
import { LoadingData } from "../../../shared/ui/LoadingData.tsx";
import { NoAvailableData } from "../../../shared/ui/NoAvailableData.tsx";
import { DaySection } from "./DaySection.tsx";
import type { DailyTimeline } from "./useDailyTimeline.ts";

interface TransactionsGridProps {
    timeline: DailyTimeline;
    currency: Currency;
    categories?: Category[];
    /** The day selected in the header; the export sheet starts from it. */
    anchorDate: Date;
}

/** The Daily tab: what to show for each state of the timeline. No fetching and no rules in here. */
export const TransactionsGrid: FC<TransactionsGridProps> = ({ timeline, currency, categories = [], anchorDate }) => {
    const { groups, isLoading, isLoadingMore, hasMore, error, loadMore, retry } = timeline;

    const [isExportOpen, setIsExportOpen] = useState(false);
    const closeExport = useCallback(() => setIsExportOpen(false), []);

    const isEmpty = groups.length === 0;

    const sentinelRef = useLoadMoreSentinel({
        enabled: hasMore && !isLoading && !isLoadingMore && !error && !isEmpty,
        onLoadMore: loadMore,
        rearmKey: groups.length,
    });

    if (isLoading && isEmpty) return <LoadingData text="Loading expenses..." />;
    if (error?.phase === "initial") return <ErrorData error={error.message} onRetry={retry} />;

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
                        key={group.date.getTime()}
                        date={group.date}
                        currency={currency}
                        categories={categories}
                        items={group.items}
                    />
                ))
            )}

            <div
                ref={sentinelRef}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 0", minHeight: 40 }}
            >
                {isLoadingMore && (
                    <Loader2 size={20} color={theme.colors.primary} style={{ animation: "spin 1s linear infinite" }} />
                )}
                {error?.phase === "more" && <ErrorData error={error.message} onRetry={retry} />}
                {!hasMore && !isLoadingMore && !error && !isEmpty && (
                    <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>No earlier data</span>
                )}
            </div>

            {isExportOpen && <ExportSheet initialDate={anchorDate} currency={currency} onClose={closeExport} />}
        </div>
    );
};
