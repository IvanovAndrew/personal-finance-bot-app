import type { CSSProperties } from "react";
import { theme } from "../App.styles.ts";

interface SegmentedControlOption<T extends string> {
    value: T;
    label: string;
}

interface SegmentedControlProps<T extends string> {
    options: SegmentedControlOption<T>[];
    selectedValue: T;
    onChange: (value: T) => void;
}

const pillStyle = (active: boolean): CSSProperties => ({
    border: "none",
    borderRadius: theme.colors.radiusPill,
    background: active ? theme.colors.primary : "transparent",
    color: active ? theme.colors.onPrimary : theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.2s ease, color 0.2s ease",
});

export const SegmentedControl = <T extends string>({
    options,
    selectedValue,
    onChange,
}: SegmentedControlProps<T>) => {
    return (
        <div
            style={{
                display: "flex",
                padding: 4,
                gap: 4,
                background: theme.colors.surface,
                borderRadius: theme.colors.radiusPill,
            }}
        >
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={selectedValue === option.value}
                    onClick={() => onChange(option.value)}
                    style={{ ...pillStyle(selectedValue === option.value), flex: 1, padding: "10px 0" }}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};