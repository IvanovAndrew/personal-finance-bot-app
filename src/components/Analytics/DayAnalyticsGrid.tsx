import type {FC} from "react";
import {commonStyles, theme, receiptStyles} from "../../App.styles.ts";
import {formatDateDMMMMYYYY} from "../../utils/dateformatter.ts";

interface DayAnalyticsGridProps {
    startDate: Date;
    currency: string;
}

export const DayAnalyticsGrid: FC<DayAnalyticsGridProps> = ({ startDate, currency }) => {
    return <div style={commonStyles.card}>
        <span style={commonStyles.cardTitle}>Daily</span>
        <p style={commonStyles.cardSub}>From {startDate.toLocaleDateString()}</p>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', padding: '10px 0' }}>
            {[
                { day: '01', amount: 12000, height: '60%' },
                { day: '02', amount: 4500, height: '25%' },
                { day: '03', amount: 18900, height: '90%' },
                { day: '04', amount: 2000, height: '15%' },
                { day: '05', amount: 9800, height: '50%' },
            ].map((item, idx) => (
                <div
                    key={idx}
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        height: '100%',
                        justifyContent: 'flex-end'
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            backgroundColor: theme.colors.primary,
                            borderRadius: theme.radius.sm,
                            height: item.height,
                            transition: 'height 0.3s ease'
                        }}
                    />
                    <span style={{ fontSize: '10px', color: theme.colors.textSecondary }}>{item.day}</span>
                </div>
            ))}
        </div>

        <span style={{ ...commonStyles.cardTitle, marginTop: '8px', fontSize: '14px' }}>
            Expenses for {formatDateDMMMMYYYY(startDate)}:
          </span>
        <div style={receiptStyles.manualList}>
            <div style={receiptStyles.subChipActive}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '4px' }}>
                    <span>🛒 Супермаркеты</span>
                    <span style={{ color: theme.colors.primary, fontWeight: '700' }}>14 400 {currency}</span>
                </div>
            </div>
            <div style={receiptStyles.subChipActive}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '4px' }}>
                    <span>🚕 Транспорт</span>
                    <span style={{ color: theme.colors.primary, fontWeight: '700' }}>4 500 {currency}</span>
                </div>
            </div>
        </div>
    </div>;
} 