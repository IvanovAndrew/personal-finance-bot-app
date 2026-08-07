import React from "react";
import { receiptStyles } from '../../App.styles';

interface JsonGridProps {

    json: string,
    setJson: (json: string) => void,
}

export const JsonGrid: React.FC<JsonGridProps> = ({ json, setJson }) => {

    return <div style={receiptStyles.card}>
        <div style={receiptStyles.cardTitle}>Raw JSON FNS</div>
        <p style={receiptStyles.cardSub}>Exported FNS json</p>

        <textarea
            placeholder='{ "ticket": { "document": { "receipt": { ... } } } }'
            value={json}
            onChange={e => setJson(e.target.value)}
            style={{
                ...receiptStyles.input,
                minHeight: '130px',
                fontFamily: 'monospace',
                fontSize: '11px',
                resize: 'vertical'
            }}
        />
    </div>;
}