import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

import { theme } from "../../App.styles";
import type { Currency } from "../../types/finance";
import { CurrencyDropdown } from "../CurrencyDropdown";
import { CustomDatePicker } from "../CustomDatePicker";
import { chipStyle } from "../ui.ts";

interface AnalyticsHeaderProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    selectedCurrency: Currency;
    currencies: Currency[];
    onCurrencyChange: (currency: Currency) => void;
    showMonthPicker?: boolean;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
                                                                    selectedDate,
                                                                    onDateChange,
                                                                    selectedCurrency,
                                                                    currencies,
                                                                    onCurrencyChange,
                                                                    showMonthPicker = true,
                                                                }) => {
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "4px 0 16px 0",
                position: "relative",
            }}
        >
            <div style={{ flex: "0 1 auto" }}>
                <CustomDatePicker
                    selectedDate={selectedDate}
                    onChange={onDateChange}
                    showMonthPicker={showMonthPicker}
                />
            </div>

            <div style={{ position: "relative" }}>
                <button
                    type="button"
                    onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                    style={chipStyle()}
                >
                    <span>
                        {selectedCurrency.name} ({selectedCurrency.symbol})
                    </span>
                    <ChevronDown size={14} color={theme.colors.textSecondary} />
                </button>

                {showCurrencyPicker && (
                    <CurrencyDropdown
                        currencies={currencies}
                        setSelectedCurrency={onCurrencyChange}
                        setShowCurrencyPicker={setShowCurrencyPicker}
                    />
                )}
            </div>
        </div>
    );
};
