import type { FC } from "react";

import { theme } from "../App.styles.ts";
import type { Currency } from "../types/finance.ts";
import { Amount } from "./Amount.tsx";
import { Card } from "../shared/ui/Card.tsx";

interface StatTileProps {
    label: string;
    value: number;
    currency: Currency;
    color: string;
    signed?: boolean;
}

export const StatTile: FC<StatTileProps> = ({ label, value, currency, color, signed = true }) => (
    <Card padding="14px 16px">
        <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>{label}</div>
        <div style={{ marginTop: 4 }}>
            <Amount value={value} currency={currency} size={17} color={color} signed={signed} />
        </div>
    </Card>
);
