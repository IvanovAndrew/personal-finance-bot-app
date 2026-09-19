import { Loader2 } from "lucide-react";

import { theme } from "../App.styles.ts";
import { Card } from "./Card.tsx";

interface LoadingDataProps {
    text: string;
}

export const LoadingData: React.FC<LoadingDataProps> = ({ text }) => {
    return (
        <Card
            padding="36px 16px"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}
        >
            <Loader2 size={24} color={theme.colors.primary} style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 13, color: theme.colors.textSecondary, fontWeight: 500 }}>{text}</span>
        </Card>
    );
};
