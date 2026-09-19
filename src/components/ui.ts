import type { CSSProperties } from "react";

import { theme } from "../App.styles.ts";

/** Pill chip: surface fill when idle, turquoise fill when active. */
export const chipStyle = (active = false): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    flex: "0 0 auto",
    minHeight: 36,
    padding: "8px 14px",
    boxSizing: "border-box",
    border: "none",
    borderRadius: theme.colors.radiusPill,
    background: active ? theme.colors.primary : theme.colors.surface,
    color: active ? theme.colors.onPrimary : theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: "nowrap",
    cursor: "pointer",
    transition: "background-color 0.2s ease, color 0.2s ease",
});
