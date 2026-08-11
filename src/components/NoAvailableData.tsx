import {commonStyles, theme} from "../App.styles.ts";
import React from "react";

export const NoAvailableData : React.FC = () => {
    return (
        <div style={{...commonStyles.card, textAlign: 'center', padding: '20px', color: theme.colors.textSecondary}}>
            No analytics data available
        </div>);
}