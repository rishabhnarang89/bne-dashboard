import { useMemo } from 'react';
import {
    LayoutDashboard, Users, BookOpen, Scale, BarChart3, Settings,
    Sun, Moon, Download, Menu, X, Clock, Target, Cloud, CloudOff, Loader2, Layout, Activity, LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { useValidationData, SPRINT_START, SPRINT_END } from '../hooks/useValidationData';
import { MiniProgress } from './ui/ProgressRing';
import { useAuth } from '../contexts/AuthContext';

export type Tab = 'timeline' | 'interviews' | 'build' | 'decision' | 'analytics' | 'demo' | 'settings';

interface SidebarProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar = ({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) => {
    const {
        darkMode,
        setDarkMode,
        exportData,
        completedInterviews,
        goals,
        daysUntilDecision,
        daysSinceLastActivity,
        getCurrentWeek,
        isOnline,
        isLoading,
        syncError,
        teachers,
        tasks,
        interviews
    } = useValidationData();

    const { user, logout } = useAuth();

    // Build activity feed from existing data
    const recentActivity = useMemo(() => {
        const items: { emoji: string; text: string; time: string; ts: number }[] = [];

        // Teacher additions
        teachers.forEach(t => {
            if (t.createdAt) {
                items.push({
                    emoji: '👤',
                    text: `Added: ${t.name}`,
                    time: t.createdAt,
                    ts: new Date(t.createdAt).getTime()
                });
            }
        });

        // Completed interviews
        interviews.filter(i => i.status === 'completed').forEach(i => {
            const teacher = teachers.find(t => t.id === i.teacherId);
            const dateStr = i.date;
            if (dateStr) {
                items.push({
                    emoji: '📋',
                    text: `Interview${teacher ? `: ${teacher.name}` : ''} (${i.score}/10)`,
                    time: dateStr,
                    ts: new Date(dateStr).getTime()
                });
            }
        });

        // Completed tasks
        tasks.filter(t => t.completed && t.completedAt).forEach(t => {
            items.push({
                emoji: '✅',
                text: t.title.length > 28 ? t.title.substring(0, 28) + '…' : t.title,
                time: t.completedAt!,
                ts: new Date(t.completedAt!).getTime()
            });
        });

        // Sort by timestamp descending
        items.sort((a, b) => b.ts - a.ts);
        return items.slice(0, 5);
    }, [teachers, interviews, tasks]);

    const currentWeek = getCurrentWeek();
    // const completedTasks = tasks.filter(t => t.completed).length;

    // Calculate sprint progress
    const totalDays = Math.ceil((SPRINT_END.getTime() - SPRINT_START.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.max(0, Math.ceil((new Date().getTime() - SPRINT_START.getTime()) / (1000 * 60 * 60 * 24)));
    const sprintProgress = Math.min(100, (elapsedDays / totalDays) * 100);

    const weekLabels: Record<number, string> = {
        0: 'Pre-Sprint',
        1: 'Week 1: Prototype',
        2: 'Week 2-3: Interviews',
        4: 'Week 4: Decision'
    };

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

                {/* Sprint Progress */}
                <div style={{
                    padding: '16px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    marginTop: 'auto',
                    border: '1px solid var(--border-light)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Target size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Sprint Progress</span>
                    </div>

                    <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px' }}>
                        {weekLabels[currentWeek]}
                    </div>

                    <MiniProgress
                        value={completedInterviews.length}
                        max={goals.targetInterviews}
                        label="Interviews"
                    />

                    <div style={{
                        height: '4px',
                        background: 'var(--border-default)',
                        borderRadius: '2px',
                        marginTop: '12px'
                    }}>
                        <div style={{
                            width: `${sprintProgress}%`,
                            height: '100%',
                            background: 'var(--primary)',
                            borderRadius: '2px',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '6px' }}>
                        <span>Jan 13</span>
                        <span>Feb 9</span>
                    </div>
                </div>

                {/* Activity Feed */}
                {recentActivity.length > 0 && (
                    <div style={{
                        padding: '12px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-md)',
                        marginTop: '12px',
                        border: '1px solid var(--border-light)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <Activity size={14} color="var(--primary)" />
                            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Recent Activity</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {recentActivity.map((item, i) => {
                                const ago = getTimeAgo(item.ts);
                                return (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        fontSize: '0.75rem', color: 'var(--text-muted)',
                                        padding: '4px 0',
                                        borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-light)' : 'none'
                                    }}>
                                        <span>{item.emoji}</span>
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>{item.text}</span>
                                        <span style={{ flexShrink: 0, fontSize: '0.65rem' }}>{ago}</span>
                                    </div>
                                );
                            })}
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

// Helper: time ago
const getTimeAgo = (ts: number): string => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w`;
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
