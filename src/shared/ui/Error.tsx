import { AlertCircle, RefreshCw } from "lucide-react";
import React from "react";

import { theme } from "../../App.styles.ts";
import { terms } from "../../constants/strings.ts";
import { Button } from "./Button.tsx";
import { Card } from "./Card.tsx";

interface ErrorDataProps {
    error: string;
    onRetry?: () => void;
}

export const ErrorData: React.FC<ErrorDataProps> = ({ error, onRetry }) => {
    return (
        <Card
            padding={24}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}
        >
            <AlertCircle size={28} color={theme.colors.danger} />
            <span style={{ fontSize: 14, color: theme.colors.textPrimary }}>{error}</span>
            {onRetry && (
                <Button variant="secondary" fullWidth={false} icon={<RefreshCw size={14} />} onClick={onRetry}>
                    {terms.retry}
                </Button>
            )}
        </Card>
    );
};
