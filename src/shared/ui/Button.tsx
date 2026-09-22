import type { FC, ReactNode } from "react";

import { theme } from "../../App.styles.ts";

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary";
    icon?: ReactNode;
    disabled?: boolean;
    fullWidth?: boolean;
}

export const Button: FC<ButtonProps> = ({
                                            children,
                                            onClick,
                                            variant = "primary",
                                            icon,
                                            disabled = false,
                                            fullWidth = true,
                                        }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: fullWidth ? "100%" : "auto",
            minHeight: 48,
            padding: fullWidth ? "14px 16px" : "12px 20px",
            boxSizing: "border-box",
            border: "none",
            borderRadius: 16,
            background: variant === "primary" ? theme.colors.primary : theme.colors.surfacePressed,
            color: variant === "primary" ? theme.colors.onPrimary : theme.colors.textPrimary,
            fontSize: 15,
            fontWeight: 600,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.35 : 1,
            transition: "opacity 0.2s ease",
        }}
    >
        {icon}
        {children}
    </button>
);
