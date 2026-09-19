import type { FC } from "react";
import { theme } from "../App.styles.ts";

export interface ShareBarItem {
    id: string;
    total: number;
    color: string;
}

interface ShareBarProps {
    items: ShareBarItem[];
}

export const ShareBar: FC<ShareBarProps> = ({ items }) => {
    const grandTotal = items.reduce((total, item) => total + item.total, 0);

    if (grandTotal <= 0) {
        return null;
    }

    return (
        <div
            style={{
                display: "flex",
                gap: 2,
                height: 8,
                borderRadius: theme.colors.radiusPill,
                overflow: "hidden",
            }}
        >
            {items
                .filter((item) => item.total > 0)
                .map((item) => (
                    <div
                        key={item.id}
                        style={{
                            flex: `${item.total} 1 0`,
                            minWidth: 4,
                            background: item.color,
                        }}
                    />
                ))}
        </div>
    );
};