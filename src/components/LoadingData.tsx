import {commonStyles, theme} from "../App.styles.ts";
import {Loader2} from "lucide-react";

interface LoadingDataProps {
    text: string;
}

export const LoadingData: React.FC<LoadingDataProps> = ({text}) => {
    return (<div
        style={{
            ...commonStyles.card,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '36px 16px',
            gap: '10px',
        }}
    >
        <Loader2 size={24} color={theme.colors.primary} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '13px', color: theme.colors.textSecondary, fontWeight: '500' }}>
                    {text}
                </span>
    </div>);
}