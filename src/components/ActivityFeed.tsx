import { useState, useEffect } from 'react';
import { Scroll, X, CheckCircle, PlusCircle, Edit, Trash2 } from 'lucide-react';

interface ActivityLog {
    id: number;
    user_name: string;
    action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'COMPLETE';
    entity_type: 'TEACHER' | 'INTERVIEW' | 'TASK';
    entity_id: number;
    entity_name: string;
    details: any;
    created_at: string;
}

const ACTION_STYLES: Record<string, { color: string; bg: string }> = {
    CREATE: { color: '#10b981', bg: '#ecfdf5' },
    UPDATE: { color: '#3b82f6', bg: '#eff6ff' },
    COMPLETE: { color: '#8b5cf6', bg: '#f5f3ff' },
    DELETE: { color: '#ef4444', bg: '#fef2f2' },
    STATUS_CHANGE: { color: '#f59e0b', bg: '#fffbeb' },
};

export function ActivityFeed({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
        }
    }, [isOpen]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/activity?limit=50');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch activity logs', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        const size = 16;
        const style = ACTION_STYLES[type] || ACTION_STYLES.UPDATE;
        const iconStyle = { color: style.color };
        switch (type) {
            case 'CREATE': return <PlusCircle size={size} style={iconStyle} />;
            case 'UPDATE': return <Edit size={size} style={iconStyle} />;
            case 'COMPLETE': return <CheckCircle size={size} style={iconStyle} />;
            case 'DELETE': return <Trash2 size={size} style={iconStyle} />;
            default: return <Scroll size={size} style={iconStyle} />;
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    const getActionLabel = (type: string) => {
        switch (type) {
            case 'CREATE': return 'created';
            case 'UPDATE': return 'updated';
            case 'DELETE': return 'deleted';
            case 'STATUS_CHANGE': return 'changed status of';
            case 'COMPLETE': return 'completed';
            default: return type.toLowerCase();
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="activity-overlay"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div className={`activity-drawer ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="activity-header">
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                        <Scroll size={18} style={{ color: 'var(--primary)' }} />
                        Activity Feed
                    </h3>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={onClose}
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="activity-list">
                    {loading ? (
                        <div className="empty-state" style={{ padding: '32px 16px' }}>
                            <div className="empty-state-title">Loading activity...</div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="empty-state" style={{ padding: '32px 16px' }}>
                            <div className="empty-state-icon">
                                <Scroll size={28} />
                            </div>
                            <div className="empty-state-title">No Recent Activity</div>
                            <div className="empty-state-description">
                                Actions like creating teachers, logging interviews, and completing tasks will appear here.
                            </div>
                        </div>
                    ) : (
                        logs.map((log, idx) => {
                            const style = ACTION_STYLES[log.action_type] || ACTION_STYLES.UPDATE;
                            return (
                                <div key={log.id} className="activity-item">
                                    {/* Timeline connector */}
                                    {idx < logs.length - 1 && (
                                        <div className="activity-connector" />
                                    )}

                                    {/* Dot */}
                                    <div className="activity-dot" style={{ background: 'var(--bg-elevated)', border: `2px solid ${style.color}` }}>
                                        {getIcon(log.action_type)}
                                    </div>

                                    {/* Content */}
                                    <div className="activity-content">
                                        <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
                                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                                {log.user_name}
                                            </span>{' '}
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                {getActionLabel(log.action_type)}
                                            </span>{' '}
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                {log.entity_type.toLowerCase()}
                                            </span>
                                        </div>

                                        <div style={{
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            color: style.color,
                                            marginTop: '4px',
                                            padding: '3px 8px',
                                            background: style.bg,
                                            borderRadius: '4px',
                                            display: 'inline-block',
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {log.entity_name || 'Unknown Item'}
                                        </div>

                                        <div style={{
                                            fontSize: '0.7rem',
                                            color: 'var(--text-disabled)',
                                            marginTop: '4px'
                                        }}>
                                            {formatTime(log.created_at)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}
