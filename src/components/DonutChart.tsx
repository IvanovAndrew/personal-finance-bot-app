import type { FC } from 'react';
import { theme } from '../App.styles.ts';

export interface PieSegment {
    code: string;
    percent: number;
    color: string;
}

interface DonutChartProps {
    segments: PieSegment[];
    totalText: string;
    titleText?: string;
    selectedCode?: string | null;
    onSelectSegment?: (id: string | null) => void;
}

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~251.32

export const DonutChart: FC<DonutChartProps> = ({
                                                    segments,
                                                    totalText,
                                                    titleText = 'Total',
                                                    selectedCode,
                                                    onSelectSegment,
                                                }) => {
    let accumulatedPercent = 0;

    return (
        <div style={{
            position: 'relative',
            width: '240px',
            height: '240px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto' // Центрируем контейнер
        }}>
            <svg
                viewBox="0 0 100 100"
                style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
            >
                {segments.map((seg) => {
                    const strokeDasharray = `${(seg.percent / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
                    const strokeDashoffset = -((accumulatedPercent / 100) * CIRCUMFERENCE);
                    accumulatedPercent += seg.percent;

                    const isSelected = selectedCode === seg.code;

                    return (
                        <circle
                            key={seg.code}
                            cx="50"
                            cy="50"
                            r={RADIUS}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={isSelected ? 24 : 18} // Изменяем толщину выбранной секции
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            style={{
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: selectedCode && !isSelected ? 0.4 : 1 // Затемняем невыбранные
                            }}
                            onClick={() => {
                                if (onSelectSegment) {
                                    onSelectSegment(isSelected ? null : seg.code);
                                }
                            }}
                        />
                    );
                })}
            </svg>

            {/* Внутренний круг с текстом по центру */}
            <div style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.bgCard,
                borderRadius: '50%',
                width: '135px',
                height: '135px',
                pointerEvents: 'none', // Клик проходит насквозь к секциям, если нужно
                padding: '8px',
                boxSizing: 'border-box'
            }}>
                <span style={{
                    fontSize: '11px',
                    color: theme.colors.textSecondary || '#8E8E93',
                    marginBottom: '2px',
                    textAlign: 'center'
                }}>
                    {titleText}
                </span>
                <span style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: theme.colors.textPrimary,
                    textAlign: 'center',
                    lineHeight: '1.2'
                }}>
                    {totalText}
                </span>
            </div>
        </div>
    );
};