import React from "react";

import { theme } from "../App.styles.ts";
import { Card } from "./Card.tsx";

interface NoAvailableDataProps {
    text?: string;
}

export const NoAvailableData: React.FC<NoAvailableDataProps> = ({ text = "No analytics data available" }) => {
    return (
        <Card padding={20} style={{ textAlign: "center", fontSize: 14, color: theme.colors.textSecondary }}>
            {text}
        </Card>
    );
};
