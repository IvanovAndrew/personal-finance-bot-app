import React from "react";
import {theme} from "../App.styles.ts";
import type {Currency} from "../types/finance.ts";

interface CurrencyDropdownProps {
    currencies: Currency[];
    setSelectedCurrency: (currency: Currency) => void;
    setShowCurrencyPicker: (show: boolean) => void;
}

export const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({ currencies, setSelectedCurrency, setShowCurrencyPicker }) => {

    return (<div style={{
            position: 'absolute',
            right: '16px',
            top: '50px',
            backgroundColor: theme.colors.bgCard,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.md,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            padding: '4px'
        }}>
            {currencies.map(curr => (
                <button
                    key={curr.name}
                    onClick={() => {
                        setSelectedCurrency(curr);
                        setShowCurrencyPicker(false);
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: theme.colors.textPrimary,
                        padding: '6px 12px',
                        fontSize: '12px',
                        textAlign: 'left',
                        cursor: 'pointer'
                    }}
                >
                    {curr.name} ({curr.symbol})
                </button>
            ))}
        </div>);
}