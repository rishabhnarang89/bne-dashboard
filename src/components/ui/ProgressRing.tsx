

interface ProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color?: string;
    bgColor?: string;
    showLabel?: boolean;
    label?: string;
}

export const ProgressRing = ({
    progress,
    size = 120,
    strokeWidth = 10,
    color = 'var(--primary)',
    bgColor = 'var(--border-default)',
    showLabel = true,
    label
}: ProgressRingProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg className="progress-ring" width={size} height={size}>
                {/* Background circle */}
                <circle
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress circle */}
                <circle
                    className="progress-ring-circle"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset
                    }}
                />
            </svg>
            {showLabel && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{ fontSize: size * 0.2, fontWeight: 800, color: 'var(--text-main)' }}>
                        {Math.round(progress)}%
                    </span>
                    {label && (
                        <span style={{ fontSize: size * 0.1, color: 'var(--text-muted)', marginTop: 2 }}>
                            {label}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

interface MiniProgressProps {
    value: number;
    max: number;
    label?: string;
    showValue?: boolean;
}

export const MiniProgress = ({ value, max, label, showValue = true }: MiniProgressProps) => {
    const percentage = Math.min((value / max) * 100, 100);
    const isComplete = value >= max;

    return (
        <div style={{ marginBottom: '12px' }}>
            {(label || showValue) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                    {label && <span style={{ color: 'var(--text-muted)' }}>{label}</span>}
                    {showValue && (
                        <span style={{ fontWeight: 600, color: isComplete ? 'var(--primary)' : 'var(--text-main)' }}>
                            {value}/{max}
                        </span>
                    )}
                </div>
            )}
            <div style={{
                width: '100%',
                height: '8px',
                background: 'var(--border-default)',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: isComplete ? 'var(--primary)' : 'var(--primary-light)',
                    transition: 'width 0.5s ease',
                    borderRadius: '4px'
                }} />
            </div>
        </div>
    );
};
