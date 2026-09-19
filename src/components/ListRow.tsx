import { ChevronRight } from "lucide-react";
import { type CSSProperties, type FC, type ReactNode, useState } from "react";

import { theme } from "../App.styles.ts";

interface ListRowProps {
    avatar?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    right?: ReactNode;
    /** Replaces the default chevron (shown when the row is clickable). */
    trailing?: ReactNode;
    onClick?: () => void;
}

export const ListRow: FC<ListRowProps> = ({ avatar, title, subtitle, right, trailing, onClick }) => {
    const [pressed, setPressed] = useState(false);

    const rowStyle: CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 16px",
        background: pressed ? theme.colors.surfacePressed : "transparent",
        border: "none",
        textAlign: "left",
        font: "inherit",
        color: "inherit",
        cursor: onClick ? "pointer" : "default",
        transition: "background-color 0.15s ease",
    };

    const content = (
        <>
            {avatar}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: theme.colors.textPrimary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {title}
                </div>
                {subtitle && (
                    <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>{subtitle}</div>
                )}
            </div>
            {right}
            {trailing ??
                (onClick && (
                    <ChevronRight size={16} color={theme.colors.textSecondary} style={{ flex: "0 0 auto" }} />
                ))}
        </>
    );

    if (!onClick) {
        return <div style={rowStyle}>{content}</div>;
    }

    return (
        <button
            type="button"
            onClick={onClick}
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => setPressed(false)}
            onPointerLeave={() => setPressed(false)}
            onPointerCancel={() => setPressed(false)}
            style={rowStyle}
        >
            {content}
        </button>
    );
};
