import React from "react";
import { commonStyles } from '../../App.styles';

interface QRUrlGridProps {

    urlInput: string,
    setUrlInput: (urlInput: string) => void,
}

export const QRLinkGrid: React.FC<QRUrlGridProps> = ({ urlInput, setUrlInput }) => {
    return <div style={commonStyles.card}>
        <div style={commonStyles.cardTitle}>QR Link</div>
        <p style={commonStyles.cardSub}>Paste the url</p>

        <textarea
            rows={2}
            placeholder="t=20260802T1230&s=1250.50&fn=...&fp=...&i=..."
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            style={{
                ...commonStyles.input,
                resize: 'none',        
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                height: 'auto',        
            }}
        />
    </div>;
}