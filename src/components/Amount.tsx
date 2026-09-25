import type { FC } from "react";

import { theme } from "../App.styles.ts";
import { NBSP } from "../constants/strings.ts";
import type { Currency } from "../types/finance.ts";
import {formatCurrencyValue, type FractionDigits} from "../utils/numberformatter.ts";

interface AmountProps {
    value: number;
    currency: Currency;
    size: number;
    weight?: number;
    /** Colour of the number. The currency symbol stays muted. */
    color?: string;
    /** Prefix "+" / "−" and format the absolute value. */
    signed?: boolean;
    format?: FractionDigits;
}

export const Amount: FC<AmountProps> = ({
                                            value,
                                            currency,
                                            size,
                                            weight = 700,
                                            color = theme.colors.textPrimary,
                                            signed = false,
                                            format = 'actual',
                                        }) => {
    const prefix = signed ? (value > 0 ? "+" : value < 0 ? "−" : "") : "";
    const shown = signed ? Math.abs(value) : value;

    return (
        <span
            style={{
                fontSize: size,
                fontWeight: weight,
                color,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
            }}
        >
            {prefix}
            {formatCurrencyValue(shown, format)}
            <span style={{ color: theme.colors.textSecondary, fontWeight: 600 }}>
                {NBSP}
                {currency.symbol}
            </span>
        </span>
    );
};
