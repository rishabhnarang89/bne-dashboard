import type { Interview } from '../../hooks/useValidationData';

interface SimpleLineChartProps {
    data: { label: string; value: number }[];
    height?: number;
    color?: string;
    showLabels?: boolean;
}

export const SimpleLineChart = ({ data, height = 150, color = 'var(--primary)', showLabels = true }: SimpleLineChartProps) => {
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const minValue = Math.min(...data.map(d => d.value), 0);
    const range = maxValue - minValue || 1;

    const padding = 20;
    const chartWidth = 100;
    const chartHeight = height - (showLabels ? 30 : 0);

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * chartWidth;
        const y = chartHeight - ((d.value - minValue) / range) * (chartHeight - padding * 2) - padding;
        return { x, y, ...d };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    return (
        <div style={{ width: '100%' }}>
            <svg viewBox={`0 0 ${chartWidth} ${height}`} style={{ width: '100%', height }}>
                {/* Gradient fill */}
                <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area fill */}
                <path d={areaD} fill="url(#areaGradient)" />

                {/* Line */}
                <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Points */}
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
                ))}
            </svg>

            {showLabels && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    {data.map((d, i) => (
                        <span key={i} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.label}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

interface BarChartProps {
    data: { label: string; value: number; color?: string }[];
    height?: number;
    showLabels?: boolean;
}

export const SimpleBarChart = ({ data, height = 150, showLabels = true }: BarChartProps) => {
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const barWidth = 100 / data.length;

    return (
        <div>
            <svg viewBox={`0 0 100 ${height}`} style={{ width: '100%', height }}>
                {data.map((d, i) => {
                    const barHeight = (d.value / maxValue) * (height - 30);
                    const x = i * barWidth + barWidth * 0.15;
                    const y = height - barHeight - 20;

                    return (
                        <g key={i}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth * 0.7}
                                height={barHeight}
                                rx="3"
                                fill={d.color || 'var(--primary)'}
                            />
                            <text
                                x={x + barWidth * 0.35}
                                y={y - 5}
                                textAnchor="middle"
                                fontSize="8"
                                fill="var(--text-main)"
                                fontWeight="600"
                            >
                                {d.value}
                            </text>
                        </g>
                    );
                })}
            </svg>
            {showLabels && (
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '4px' }}>
                    {data.map((d, i) => (
                        <span key={i} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', flex: 1 }}>
                            {d.label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

interface PieChartProps {
    data: { label: string; value: number; color: string }[];
    size?: number;
}

export const SimplePieChart = ({ data, size = 120 }: PieChartProps) => {
    const total = data.reduce((a, b) => a + b.value, 0);
    if (total === 0) return null;

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.4;

    let currentAngle = -90; // Start from top

    const slices = data.map((d) => {
        const angle = (d.value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = cx + radius * Math.cos(startRad);
        const y1 = cy + radius * Math.sin(startRad);
        const x2 = cx + radius * Math.cos(endRad);
        const y2 = cy + radius * Math.sin(endRad);

        const largeArcFlag = angle > 180 ? 1 : 0;

        const pathD = [
            `M ${cx} ${cy}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        return { ...d, pathD };
    });

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <svg width={size} height={size}>
                {slices.map((slice, i) => (
                    <path key={i} d={slice.pathD} fill={slice.color} />
                ))}
                {/* Center circle for donut effect */}
                <circle cx={cx} cy={cy} r={radius * 0.5} fill="var(--bg-elevated)" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color }} />
                        <span style={{ color: 'var(--text-muted)' }}>{d.label}</span>
                        <span style={{ fontWeight: 600 }}>{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Chart wrapper with interview data processing
export const InterviewScoreTrend = ({ interviews }: { interviews: Interview[] }) => {
    const completedInterviews = interviews.filter(i => i.status === 'completed');

    if (completedInterviews.length < 2) {
        return (
            <div className="text-center text-muted" style={{ padding: '40px' }}>
                Need at least 2 interviews to show trends
            </div>
        );
    }

    const data = completedInterviews.slice(-7).map((i, idx) => ({
        label: `#${idx + 1}`,
        value: i.score
    }));

    return <SimpleLineChart data={data} color="var(--primary)" />;
};

export const SchoolTypeBreakdown = ({ teachers }: { teachers: { schoolType: string }[] }) => {
    if (teachers.length === 0) {
        return (
            <div className="text-center text-muted" style={{ padding: '40px' }}>
                No teachers added yet
            </div>
        );
    }

    const typeCount = teachers.reduce((acc, t) => {
        acc[t.schoolType] = (acc[t.schoolType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const colors: Record<string, string> = {
        'Gymnasium': '#10b981',
        'Realschule': '#3b82f6',
        'Gesamtschule': '#f59e0b',
        'Grundschule': '#8b5cf6',
        'Other': '#6b7280'
    };

    const data = Object.entries(typeCount).map(([label, value]) => ({
        label,
        value,
        color: colors[label] || '#6b7280'
    }));

    return <SimplePieChart data={data} />;
};

export const SetupTimeImprovement = ({ interviews }: { interviews: Interview[] }) => {
    const completedInterviews = interviews.filter(i => i.status === 'completed');

    if (completedInterviews.length < 2) {
        return (
            <div className="text-center text-muted" style={{ padding: '40px' }}>
                Need at least 2 interviews to show improvement
            </div>
        );
    }

    const data = completedInterviews.slice(-7).map((i, idx) => ({
        label: `#${idx + 1}`,
        value: i.setupTime
    }));

    return <SimpleLineChart data={data} color="#3b82f6" />;
};
