import React from "react";

import { theme } from "../App.styles.ts";
import type { Currency } from "../types/finance.ts";

interface CurrencyDropdownProps {
    currencies: Currency[];
    setSelectedCurrency: (currency: Currency) => void;
    setShowCurrencyPicker: (show: boolean) => void;
}

export const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
                                                                      currencies,
                                                                      setSelectedCurrency,
                                                                      setShowCurrencyPicker,
                                                                  }) => {
    return (
        <div
            style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                minWidth: 140,
                padding: 6,
                background: theme.colors.surfacePressed,
                borderRadius: 16,
                boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
            }}
        >
            {currencies.map((curr) => (
                <button
                    key={curr.name}
                    type="button"
                    onClick={() => {
                        setSelectedCurrency(curr);
                        setShowCurrencyPicker(false);
                    }}
                    style={{
                        border: "none",
                        borderRadius: 10,
                        background: "transparent",
                        color: theme.colors.textPrimary,
                        padding: "10px 12px",
                        fontSize: 14,
                        fontWeight: 500,
                        textAlign: "left",
                        cursor: "pointer",
                    }}
                >
                    {curr.name} ({curr.symbol})
                </button>
            ))}
        </div>
    );
};
