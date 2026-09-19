import { AlertCircle } from "lucide-react";
import React from "react";

import { theme } from "../App.styles.ts";
import { Card } from "./Card.tsx";

interface ErrorDataProps {
    error: string;
}

export const ErrorData: React.FC<ErrorDataProps> = ({ error }) => {
    return (
        <Card
            padding={24}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}
        >
            <AlertCircle size={28} color={theme.colors.danger} />
            <span style={{ fontSize: 14, color: theme.colors.textPrimary }}>{error}</span>
        </Card>
    );
};
