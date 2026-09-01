import type { FC, MouseEvent } from 'react';
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
    onPrevSegment?: () => void;
    onNextSegment?: () => void;
}

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const DonutChart: FC<DonutChartProps> = ({
                                                    segments,
                                                    totalText,
                                                    titleText = 'Total',
                                                    selectedCode,
                                                    onSelectSegment,
                                                    onPrevSegment,
                                                    onNextSegment
                                                }) => {
    let accumulatedPercent = 0;

    const navButtonStyle: React.CSSProperties = {
        background: 'none',
        border: 'none',
        color: theme.colors.textSecondary || '#8E8E93',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        padding: '0 4px',
        lineHeight: 1,
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
    };

    return (
        <div style={{
            position: 'relative',
            width: '240px',
            height: '240px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
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
                            strokeWidth={isSelected ? 24 : 18}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            style={{
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: selectedCode && !isSelected ? 0.4 : 1
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

            {/* Внутренний круг со строчной (row) версткой */}
            <div style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: theme.colors.bgCard,
                borderRadius: '50%',
                width: '135px',
                height: '135px',
                padding: '0 8px',
                boxSizing: 'border-box'
            }}>
                <button
                    type="button"
                    style={{ ...navButtonStyle, visibility: segments.length > 1 ? 'visible' : 'hidden' }}
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        onPrevSegment?.();
                    }}
                >
                    ‹
                </button>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    minWidth: 0,
                    pointerEvents: 'none'
                }}>
                    <span style={{
                        fontSize: '11px',
                        color: theme.colors.textSecondary || '#8E8E93',
                        marginBottom: '2px',
                        textAlign: 'center',
                        width: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {titleText}
                    </span>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: theme.colors.textPrimary,
                        textAlign: 'center',
                        lineHeight: '1.2',
                        width: '100%',
                        wordBreak: 'break-word'
                    }}>
                        {totalText}
                    </span>
                </div>

                <button
                    type="button"
                    style={{ ...navButtonStyle, visibility: segments.length > 1 ? 'visible' : 'hidden' }}
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        onNextSegment?.();
                    }}
                >
                    ›
                </button>
            </div>
        </div>
    );
};