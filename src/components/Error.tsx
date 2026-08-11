import React from "react";
import {AlertCircle} from "lucide-react";
import {commonStyles, theme} from "../App.styles.ts";

interface ErrorDataProps {
    error: string;
}

export const ErrorData: React.FC<ErrorDataProps> = ({ error }) => {
    return <div style={{ ...commonStyles.card, alignItems: 'center', padding: '24px', textAlign: 'center', borderColor: theme.colors.danger }}>
        <AlertCircle size={28} color={theme.colors.danger} />
        <span style={{ fontSize: '13px', color: theme.colors.textPrimary, marginTop: '8px' }}>{error}</span>
    </div>
};