import { useMemo } from 'react';
import {
    LayoutDashboard, Users, BarChart3, Settings,
    LogOut, Sun, Moon, Menu, X, BookOpen, Layout, Scale, Cloud, CloudOff, Activity, Clock, Printer, Download, Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { useValidationData } from '../hooks/useValidationData';
import { MiniProgress } from './ui/ProgressRing';
import { useAuth } from '../contexts/AuthContext';

export type Tab = 'timeline' | 'interviews' | 'build' | 'decision' | 'analytics' | 'demo' | 'settings' | 'report';

interface SidebarProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    isOpen: boolean;
    onClose: () => void;
    onToggleActivity: () => void;
}

export const Sidebar = ({ activeTab, onTabChange, isOpen, onClose, onToggleActivity }: SidebarProps) => {
    const {
        darkMode,
        setDarkMode,
        exportData,
        completedInterviews,
        goals,
        daysUntilDecision,
        daysSinceLastActivity,
        isOnline,
        isLoading,
        syncError,
        teachers,
        highScoreCount,
        pilotCount
    } = useValidationData();

    const { user, logout } = useAuth();



    const alerts = useMemo(() => {
        const now = new Date();
        const overdue = teachers.filter(t => t.nextFollowUpDate && new Date(t.nextFollowUpDate) < now);
        const stale = teachers.filter(t =>
            t.status !== 'identified' &&
            t.status !== 'interviewed' &&
            t.status !== 'follow_up' &&
            t.lastContactDate &&
            (now.getTime() - new Date(t.lastContactDate).getTime()) > 7 * 24 * 60 * 60 * 1000
        );
        return { overdue, stale };
    }, [teachers]);


    const navSections = [
        {
            label: 'Planning',
            items: [
                { id: 'timeline', label: 'Week Plan', icon: LayoutDashboard },
                { id: 'build', label: 'Build Guide', icon: BookOpen },
            ]
        },
        {
            label: 'Validation',
            items: [
                { id: 'interviews', label: 'Interview Tool', icon: Users },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'report', label: 'Report', icon: Printer },
                { id: 'decision', label: 'Go/No-Go', icon: Scale },
                { id: 'demo', label: 'Demo', icon: Layout },
            ]
        },
        {
            label: 'System',
            items: [
                { id: 'settings', label: 'Settings', icon: Settings },
            ]
        }
    ];

    const handleTabChange = (tab: Tab) => {
        onTabChange(tab);
        onClose();
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="modal-overlay"
                    style={{ background: 'rgba(0,0,0,0.3)' }}
                    onClick={onClose}
                />
            )}

            <div className={clsx("sidebar", isOpen && "open")}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                            BNE Validation
                        </h1>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            Central Hub v2.0
                        </p>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ display: 'none' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Sync Status */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '16px',
                    fontSize: '0.75rem'
                }}>
                    {isLoading ? (
                        <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
                    ) : isOnline ? (
                        <Cloud size={14} style={{ color: '#10b981' }} />
                    ) : (
                        <CloudOff size={14} style={{ color: 'var(--text-muted)' }} />
                    )}
                    <span style={{ color: isOnline ? '#10b981' : 'var(--text-muted)' }}>
                        {isLoading ? 'Connecting...' : isOnline ? 'Cloud Sync Active' : 'Local Only'}
                    </span>
                    {syncError && (
                        <span style={{ color: 'var(--danger)', marginLeft: 'auto', fontSize: '0.7rem' }}>Error</span>
                    )}
                </div>

                {/* Logged-in User */}
                {user && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px',
                        background: user.bg,
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '16px',
                        border: `1px solid ${user.color}20`
                    }}>
                        <span style={{ fontSize: '1.3rem' }}>{user.emoji}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: user.color }}>{user.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Admin</div>
                        </div>
                    </div>
                )}

                {/* Countdown Widget */}
                <div className="countdown-widget">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Clock size={16} />
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Decision Day
                        </span>
                    </div>
                    <div className="countdown-number">
                        {daysUntilDecision > 0 ? daysUntilDecision : '🎯'}
                    </div>
                    <div className="countdown-label">
                        {daysUntilDecision > 0 ? 'days remaining' : 'Decision Day!'}
                    </div>
                </div>

                {/* Activity Reminder */}
                {daysSinceLastActivity >= 2 && (
                    <div style={{
                        background: 'var(--warning-light)',
                        border: '1px solid var(--accent-light)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                        marginBottom: '16px',
                        fontSize: '0.8rem',
                        color: '#92400e'
                    }}>
                        ⏰ No activity for {daysSinceLastActivity} days
                    </div>
                )}

                {/* Navigation */}
                <nav style={{ flex: 1 }}>
                    {navSections.map(section => (
                        <div key={section.label}>
                            <div className="nav-section-label">{section.label}</div>
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.id}
                                        className={clsx("nav-item", activeTab === item.id && "active")}
                                        onClick={() => handleTabChange(item.id as Tab)}
                                    >
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                        {item.id === 'interviews' && completedInterviews.length > 0 && (
                                            <span style={{
                                                marginLeft: 'auto',
                                                background: activeTab === item.id ? 'rgba(255,255,255,0.2)' : 'var(--primary-light)',
                                                color: activeTab === item.id ? 'white' : 'white',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {completedInterviews.length}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Goal Progress */}
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-muted)',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        Goal Progress
                        <span style={{ fontSize: '0.7rem', fontWeight: 400 }}>Deadline: Feb 20</span>
                    </h3>

                    <MiniProgress
                        label="🎯 Interviews"
                        value={completedInterviews.length}
                        max={goals.targetInterviews}
                    />
                    <MiniProgress
                        label="⭐ High Scores (9+)"
                        value={highScoreCount}
                        max={goals.targetHighScores}
                    />
                    <MiniProgress
                        label="🚀 Pilot Partners"
                        value={pilotCount}
                        max={goals.targetPilots}
                    />
                </div>

                {/* Alerts Widget */}
                {(alerts.overdue.length > 0 || alerts.stale.length > 0) && (
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{
                            fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px',
                            display: 'flex', justifyContent: 'space-between'
                        }}>
                            Attention Needed
                            <span style={{ background: 'var(--danger)', color: 'white', padding: '0 6px', borderRadius: '10px', fontSize: '0.7rem' }}>
                                {alerts.overdue.length + alerts.stale.length}
                            </span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {alerts.overdue.slice(0, 3).map(t => (
                                <div key={t.id} style={{
                                    padding: '8px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px',
                                    fontSize: '0.75rem', color: '#991b1b', cursor: 'pointer'
                                }} onClick={() => handleTabChange('interviews')}>
                                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} /> Follow-up Overdue
                                    </div>
                                    <div style={{ marginTop: '2px' }}>{t.name}</div>
                                </div>
                            ))}
                            {alerts.stale.slice(0, 3).map(t => (
                                <div key={t.id} style={{
                                    padding: '8px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '6px',
                                    fontSize: '0.75rem', color: '#92400e', cursor: 'pointer'
                                }} onClick={() => handleTabChange('interviews')}>
                                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} /> Stale Contact ({Math.floor((Date.now() - new Date(t.lastContactDate!).getTime()) / (86400000))}d)
                                    </div>
                                    <div style={{ marginTop: '2px' }}>{t.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-light)'
                }}>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={onToggleActivity}
                        title="Activity Feed"
                    >
                        <Activity size={18} />
                    </button>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setDarkMode(!darkMode)}
                        title={darkMode ? 'Light mode' : 'Dark mode'}
                    >
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={exportData}
                        title="Export data"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={logout}
                        title="Sign out"
                        style={{ marginLeft: 'auto' }}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </>
    );
};



// Mobile header component
export const MobileHeader = ({ onMenuClick }: { onMenuClick: () => void }) => {
    return (
        <div className="mobile-header">
            <button className="mobile-menu-btn" onClick={onMenuClick}>
                <Menu size={24} />
            </button>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                BNE Validation
            </h1>
            <div style={{ width: 40 }} /> {/* Spacer */}
        </div>
    );
};
