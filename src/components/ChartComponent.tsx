import { type FC } from "react";
import {
    BarChart,
    Bar,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Rectangle,
} from "recharts";
import { theme } from "../App.styles.ts";

export interface ChartDataItem {
    id: string;
    label: string;       // e.g. "Jan"
    subLabel?: string;   // e.g. "2026"
    fullName?: string;   // e.g. "Jan 2026"
    value1: number;      // Primary value
    value2?: number;     // Secondary value
}

type ChartComponentProps = {
    data: ChartDataItem[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    showDualBar?: boolean;
    formatAmount?: (val: number) => string;
    /** Fill of the Y-axis mask; must match the surface the chart sits on. */
    background?: string;
};

export const ChartComponent: FC<ChartComponentProps> = ({
                                                            data,
                                                            selectedIndex,
                                                            onSelect,
                                                            showDualBar = false,
                                                            formatAmount = (val) => val.toString(),
                                                            background = theme.colors.surface,
                                                        }) => {
    const maxVal = Math.max(
        ...data.map((item) => Math.max(item.value1, item.value2 ?? 0)),
        1
    );

    const chartHeight = 220;
    const xAxisHeight = 42;
    const yAxisWidth = 45;

    // Generate Y-Axis ticks manually
    const ticksCount = 5;
    const yTicks = Array.from({ length: ticksCount }, (_, i) => {
        const val = (maxVal / (ticksCount - 1)) * (ticksCount - 1 - i);
        return {
            val,
            label: val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${Math.round(val)}`,
        };
    });

    return (
        <div style={{ position: 'relative', width: '100%', marginTop: '8px' }}>
            {/* 1. Full height Left Mask / Background Overlay */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${yAxisWidth}px`,
                    height: `${chartHeight}px`,
                    backgroundColor: background,
                    zIndex: 10,
                    pointerEvents: 'none',
                }}
            >
                {/* Y-Axis Labels overlayed on top part */}
                <div
                    style={{
                        position: 'absolute',
                        top: 10,
                        left: 0,
                        width: '100%',
                        height: `${chartHeight - xAxisHeight - 10}px`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        paddingRight: '6px',
                        boxSizing: 'border-box',
                    }}
                >
                    {yTicks.map((tick, index) => (
                        <span
                            key={index}
                            style={{
                                fontSize: '11px',
                                color: theme.colors.textSecondary,
                                lineHeight: '1',
                            }}
                        >
                            {tick.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* 2. Scrollable Chart Container */}
            <div
                style={{
                    overflowX: 'auto',
                    width: '100%',
                    paddingLeft: `${yAxisWidth}px`,
                    boxSizing: 'border-box',
                    paddingBottom: '8px',
                }}
            >
                <div style={{ width: Math.max(data.length * 52, 320), height: chartHeight }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} strokeOpacity={0.6} vertical={false} />

                            <YAxis domain={[0, maxVal]} hide />

                            <XAxis
                                dataKey="id"
                                stroke={theme.colors.textSecondary}
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                height={xAxisHeight}
                                interval={0}
                                tick={({ x, y, index }) => {
                                    const item = data[index];
                                    if (!item) return <g />;

                                    return (
                                        <g transform={`translate(${x},${y})`}>
                                            <text
                                                x={0}
                                                y={0}
                                                dy={4}
                                                textAnchor="middle"
                                                fill={theme.colors.textPrimary}
                                                fontSize={11}
                                                fontWeight="600"
                                            >
                                                <tspan x="0" dy="8">{item.label}</tspan>
                                                {item.subLabel && (
                                                    <tspan x="0" dy="12" fontSize={9} fill={theme.colors.textSecondary}>
                                                        {item.subLabel}
                                                    </tspan>
                                                )}
                                            </text>
                                        </g>
                                    );
                                }}
                            />

                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                                wrapperStyle={{ pointerEvents: 'none', zIndex: 100 }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const rawPayload = payload[0].payload;
                                        const currentItem = (rawPayload && 'payload' in rawPayload && rawPayload.payload
                                            ? rawPayload.payload
                                            : rawPayload) as ChartDataItem;

                                        const title = `${currentItem.label ?? ''} ${currentItem.subLabel ?? ''}`.trim();

                                        return (
                                            <div
                                                style={{
                                                    backgroundColor: theme.colors.surfacePressed,
                                                    borderRadius: 12,
                                                    padding: '8px 12px',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                                                }}
                                            >
                                                <div style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '700', marginBottom: '4px' }}>
                                                    {title}
                                                </div>

                                                {showDualBar ? (
                                                    <>
                                                        <div style={{ fontSize: '12px', color: theme.colors.success, fontWeight: '700' }}>
                                                            Income: +{formatAmount(currentItem.value1)}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: theme.colors.danger, fontWeight: '700' }}>
                                                            Expense: -{formatAmount(currentItem.value2 ?? 0)}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div style={{ fontSize: '12px', color: theme.colors.primary, fontWeight: '700' }}>
                                                        Total: {formatAmount(currentItem.value1)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />

                            <Bar
                                dataKey="value1"
                                radius={[5, 5, 0, 0]}
                                barSize={10}
                                cursor="pointer"
                                fill={showDualBar ? theme.colors.success : theme.colors.primary}
                                onClick={(_entry: unknown, index: number) => onSelect(index)}
                                shape={(props: Record<string, any>) => {
                                    const index = props.index;
                                    const opacity = selectedIndex === -1 || index === selectedIndex ? 1 : 0.25;
                                    return <Rectangle {...props} fillOpacity={opacity} />;
                                }}
                            />

                            {showDualBar && (
                                <Bar
                                    dataKey="value2"
                                    radius={[5, 5, 0, 0]}
                                    barSize={10}
                                    cursor="pointer"
                                    fill={theme.colors.danger}
                                    onClick={(_entry: unknown, index: number) => onSelect(index)}
                                    shape={(props: Record<string, any>) => {
                                        const index = props.index;
                                        const opacity = selectedIndex === -1 || index === selectedIndex ? 1 : 0.25;
                                        return <Rectangle {...props} fillOpacity={opacity} />;
                                    }}
                                />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};