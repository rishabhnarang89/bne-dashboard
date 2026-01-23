import { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, Square, AlertCircle } from 'lucide-react';

interface InterviewTimerProps {
    duration: 30 | 45 | 60;
    onDurationChange: (duration: 30 | 45 | 60) => void;
    isActive: boolean;
    onToggle: () => void;
    onStop: () => void;
    onTimeUp?: () => void;
}

export const InterviewTimer = ({
    duration,
    onDurationChange,
    isActive,
    onToggle,
    onStop,
    onTimeUp
}: InterviewTimerProps) => {
    const [timeRemaining, setTimeRemaining] = useState(duration * 60); // in seconds
    const [hasStarted, setHasStarted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Reset timer when duration changes
    useEffect(() => {
        if (!hasStarted) {
            setTimeRemaining(duration * 60);
        }
    }, [duration, hasStarted]);

    // Countdown logic
    useEffect(() => {
        if (!isActive) return;

        setHasStarted(true);
        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onTimeUp?.();
                    // Play alert sound
                    if (audioRef.current) {
                        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, onTimeUp]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress percentage
    const progress = ((duration * 60 - timeRemaining) / (duration * 60)) * 100;

    // Determine color based on time remaining
    const getColor = () => {
        const percentRemaining = (timeRemaining / (duration * 60)) * 100;
        if (percentRemaining > 50) return 'var(--primary)';
        if (percentRemaining > 20) return 'var(--warning)';
        return 'var(--danger)';
    };

    // Calculate elapsed time
    const elapsedSeconds = duration * 60 - timeRemaining;
    const elapsedTime = formatTime(elapsedSeconds);

    return (
        <div style={{
            padding: '20px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            border: `2px solid ${getColor()}`,
            marginBottom: '20px'
        }}>
            {/* Duration Selector (only before starting) */}
            {!hasStarted && (
                <div style={{ marginBottom: '16px' }}>
                    <label className="label" style={{ marginBottom: '8px' }}>Interview Duration</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {([30, 45, 60] as const).map(dur => (
                            <button
                                key={dur}
                                className={`btn ${duration === dur ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => onDurationChange(dur)}
                                style={{ flex: 1 }}
                            >
                                {dur} min
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Timer Display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Circular Progress */}
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Background circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="var(--border-default)"
                            strokeWidth="8"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={getColor()}
                            strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                    }}>
                        <Clock size={20} color={getColor()} />
                    </div>
                </div>

                {/* Time Info */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: getColor(), fontFamily: 'monospace' }}>
                        {formatTime(timeRemaining)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Elapsed: {elapsedTime} / {duration}:00
                    </div>
                    {timeRemaining === 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: 'var(--danger)' }}>
                            <AlertCircle size={16} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Time's up!</span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className={`btn ${isActive ? 'btn-warning' : 'btn-primary'}`}
                        onClick={onToggle}
                        disabled={timeRemaining === 0}
                    >
                        {isActive ? <><Pause size={16} /> Pause</> : <><Play size={16} /> {hasStarted ? 'Resume' : 'Start'}</>}
                    </button>
                    {hasStarted && (
                        <button
                            className="btn btn-ghost"
                            onClick={onStop}
                            style={{ color: 'var(--danger)' }}
                        >
                            <Square size={16} /> Complete Interview
                        </button>
                    )}
                </div>
            </div>

            {/* Hidden audio element for alert */}
            <audio
                ref={audioRef}
                src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVKzn77BdGAg+ltryxnMoBSuAzvLZiTYIGGe77eeeTRAMUKfj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmVENDlSs5++wXRgIPpba8sZzKAUrgM7y2Yk2CBhnu+3nnk0QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBACh"
            />
        </div>
    );
};
