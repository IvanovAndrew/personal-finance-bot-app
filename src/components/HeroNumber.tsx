import type { FC } from "react";

import { theme } from "../App.styles.ts";
import type { Currency } from "../types/finance.ts";
import { Amount } from "./Amount.tsx";

interface HeroNumberProps {
    heroLabel: string;
    heroValue: number;
    currency: Currency;
    signed?: boolean;
    color?: string;
    /** Optional muted line under the number. */
    caption?: string;
}

export const HeroNumber: FC<HeroNumberProps> = ({ heroLabel, heroValue, currency, signed, color, caption }) => (
    <div style={{ padding: "0 4px" }}>
        <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>{heroLabel}</div>
        <div style={{ marginTop: 2, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            <Amount value={heroValue} currency={currency} size={34} signed={signed} color={color} />
        </div>
        {caption && <div style={{ marginTop: 6, fontSize: 13, color: theme.colors.textSecondary }}>{caption}</div>}
    </div>
);
