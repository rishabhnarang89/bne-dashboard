import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    Building, Linkedin, Mail, Calendar,
    Clock, Search, Phone,
    MessageSquare, Trash2, Edit3,
    CheckCircle2, TrendingUp
} from 'lucide-react';
import type { Teacher, TeacherStatus } from '../../hooks/useValidationData';

interface TeacherCardProps {
    teacher: Teacher;
    interviewCount: number;
    onEdit: (teacher: Teacher) => void;
    onDelete: (id: number) => void;
    onClick: (id: number) => void;
    onUpdate: (id: number, updates: Partial<Teacher>) => void;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({
    teacher,
    interviewCount,
    onEdit,
    onDelete,
    onClick,
    onUpdate
}) => {
    const { user } = useAuth();
    const [showNotes, setShowNotes] = useState(false);
    const [newNote, setNewNote] = useState('');

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!newNote.trim() || !user) return;

        const noteEntry = {
            date: new Date().toISOString(),
            author: user.name,
            text: newNote.trim()
        };

        const updatedLog = [...(teacher.noteLog || []), noteEntry];
        onUpdate(teacher.id, { noteLog: updatedLog });
        setNewNote('');
    }; const statusColors: Record<TeacherStatus, { color: string; bg: string }> = {
        identified: { color: '#6b7280', bg: '#f3f4f6' },
        request_sent: { color: '#f59e0b', bg: '#fffbeb' },
        connected: { color: '#3b82f6', bg: '#eff6ff' },
        scheduled: { color: '#8b5cf6', bg: '#f5f3ff' },
        interviewed: { color: '#10b981', bg: '#ecfdf5' },
        follow_up: { color: '#f97316', bg: '#fff7ed' }
    };

    const color = statusColors[teacher.status] || statusColors.identified;

    const handleQuickEmail = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (teacher.email) {
            window.location.href = `mailto:${teacher.email}?subject=BNE IoT Discovery Kit Validation&body=Hi ${teacher.name},\n\nI'm reaching out regarding...`;
        }
    };

    const handleQuickLinkedIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (teacher.linkedinUrl) {
            window.open(teacher.linkedinUrl, '_blank');
        }
    };

    const handleQuickPhone = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (teacher.phoneNumber) {
            window.location.href = `tel:${teacher.phoneNumber}`;
        }
    };

    const OWNER_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
        rishabh: { emoji: '👨‍💻', label: 'Rishabh', color: '#3b82f6', bg: '#eff6ff' },
        tung: { emoji: '🎯', label: 'Tung', color: '#8b5cf6', bg: '#f5f3ff' },
        johannes: { emoji: '🔬', label: 'Johannes', color: '#f59e0b', bg: '#fffbeb' },
    };

    return (
        <div
            className="crm-card"
            onClick={() => onClick(teacher.id)}
            style={{
                padding: '12px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
            onMouseOver={e => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)';
            }}
            onMouseOut={e => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: 700
                    }}>
                        {teacher.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{teacher.name}</div>
                        {teacher.designation && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1px' }}>
                                {teacher.designation}
                            </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building size={10} /> {teacher.school}
                        </div>
                    </div>
                </div>
                {interviewCount > 0 && (
                    <div style={{
                        background: 'var(--success-bg)',
                        color: 'var(--success)',
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        <CheckCircle2 size={10} /> {interviewCount}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: color.bg,
                    color: color.color,
                    fontWeight: 600
                }}>
                    {teacher.status.replace('_', ' ').toUpperCase()}
                </span>
                {teacher.schoolType && (
                    <span style={{
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'var(--bg-card)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-light)'
                    }}>
                        {teacher.schoolType}
                    </span>
                )}
                {teacher.owner && OWNER_CONFIG[teacher.owner] && (
                    <span style={{
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: OWNER_CONFIG[teacher.owner].bg,
                        color: OWNER_CONFIG[teacher.owner].color,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        {OWNER_CONFIG[teacher.owner].emoji} {OWNER_CONFIG[teacher.owner].label}
                    </span>
                )}
            </div>

            {teacher.lastContactDate && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} /> Last: {new Date(teacher.lastContactDate).toLocaleDateString()}
                </div>
            )}

            {/* Action Bar */}
            <div style={{
                marginTop: '4px',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                        className={`btn-icon-sm ${showNotes ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}
                        title="Notes"
                        style={showNotes ? { color: 'var(--primary)', background: 'var(--primary-light-bg)' } : {}}
                    >
                        <MessageSquare size={14} />
                    </button>
                    {teacher.linkedinUrl && (
                        <button
                            className="btn-icon-sm"
                            onClick={handleQuickLinkedIn}
                            title="LinkedIn Outreach"
                            style={{ color: '#0077b5', background: '#eff6ff' }}
                        >
                            <Linkedin size={14} />
                        </button>
                    )}
                    {teacher.email && (
                        <button
                            className="btn-icon-sm"
                            onClick={handleQuickEmail}
                            title="Email Outreach"
                            style={{ color: 'var(--primary)', background: 'var(--primary-light-bg)' }}
                        >
                            <Mail size={14} />
                        </button>
                    )}
                    {teacher.phoneNumber && (
                        <button
                            className="btn-icon-sm"
                            onClick={handleQuickPhone}
                            title={`Call ${teacher.phoneNumber}`}
                            style={{ color: '#10b981', background: '#ecfdf5' }}
                        >
                            <Phone size={14} />
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        className="btn-icon-sm"
                        onClick={(e) => { e.stopPropagation(); onEdit(teacher); }}
                        title="Edit"
                    >
                        <Edit3 size={14} />
                    </button>
                    <button
                        className="btn-icon-sm"
                        onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }}
                        style={{ color: 'var(--danger)' }}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Note Log Section */}
            {showNotes && (
                <div style={{
                    marginTop: '8px',
                    padding: '8px',
                    background: 'var(--bg-elevated)',
                    borderRadius: '4px',
                    border: '1px solid var(--border-light)'
                }} onClick={e => e.stopPropagation()}>
                    <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {teacher.noteLog && teacher.noteLog.length > 0 ? (
                            [...teacher.noteLog].reverse().map((note, idx) => (
                                <div key={idx} style={{ fontSize: '0.7rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '2px' }}>
                                        <span style={{ fontWeight: 600 }}>{note.author}</span>
                                        <span>{new Date(note.date).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>{note.text}</div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontStyle: 'italic' }}>No notes yet</div>
                        )}
                    </div>
                    <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '4px' }}>
                        <input
                            type="text"
                            value={newNote}
                            onChange={e => setNewNote(e.target.value)}
                            placeholder="Add a note..."
                            style={{
                                flex: 1,
                                fontSize: '0.75rem',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-default)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-main)'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newNote.trim()}
                            className="btn-icon-sm"
                            style={{ color: 'var(--primary)', opacity: !newNote.trim() ? 0.5 : 1 }}
                        >
                            <TrendingUp size={14} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

interface KanbanBoardProps {
    teachers: Teacher[];
    interviewCounts: Record<number, number>;
    onTeacherClick: (id: number) => void;
    onEdit: (teacher: Teacher) => void;
    onDelete: (id: number) => void;
    onUpdate: (id: number, updates: Partial<Teacher>) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
    teachers,
    interviewCounts,
    onTeacherClick,
    onEdit,
    onDelete,
    onUpdate
}) => {
    const statuses: { id: TeacherStatus; label: string; icon: React.ReactNode }[] = [
        { id: 'identified', label: 'Identified', icon: <Search size={14} /> },
        { id: 'request_sent', label: 'Request Sent', icon: <Mail size={14} /> },
        { id: 'connected', label: 'Connected', icon: <MessageSquare size={14} /> },
        { id: 'scheduled', label: 'Scheduled', icon: <Calendar size={14} /> },
        { id: 'interviewed', label: 'Interviewed', icon: <CheckCircle2 size={14} /> },
    ];

    return (
        <div style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            padding: '4px',
            minHeight: '600px',
            scrollSnapType: 'x mandatory'
        }}>
            {statuses.map(status => (
                <div
                    key={status.id}
                    style={{
                        flex: '0 0 280px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '12px',
                        border: '1px solid var(--border-light)',
                        scrollSnapAlign: 'start'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '4px 8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem' }}>
                            {status.icon}
                            {status.label}
                        </div>
                        <span style={{
                            background: 'var(--bg-card)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)'
                        }}>
                            {teachers.filter(t => t.status === status.id).length}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {teachers
                            .filter(t => t.status === status.id)
                            .map(teacher => (
                                <TeacherCard
                                    key={teacher.id}
                                    teacher={teacher}
                                    interviewCount={interviewCounts[teacher.id] || 0}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onClick={onTeacherClick}
                                    onUpdate={onUpdate}
                                />
                            ))
                        }
                        {teachers.filter(t => t.status === status.id).length === 0 && (
                            <div style={{
                                padding: '24px 12px',
                                textAlign: 'center',
                                border: '1px dashed var(--border-light)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-muted)',
                                fontSize: '0.75rem'
                            }}>
                                No teachers in this stage
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const OutreachStats: React.FC<{ teachers: Teacher[] }> = ({ teachers }) => {
    const total = teachers.length;
    const connected = teachers.filter(t => t.status !== 'identified').length;
    const interviewed = teachers.filter(t => t.status === 'interviewed').length;

    const conversion = total > 0 ? Math.round((interviewed / total) * 100) : 0;
    const connectedRate = total > 0 ? Math.round((connected / total) * 100) : 0;

    return (
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="stat-label">Outreach Funnel</div>
                    <TrendingUp size={16} color="var(--primary)" />
                </div>
                <div className="stat-value">{conversion}%</div>
                <div className="stat-sub">Overall Conversion</div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Connection Rate</div>
                <div className="stat-value">{connectedRate}%</div>
                <div style={{ width: '100%', height: '4px', background: 'var(--border-light)', borderRadius: '2px', marginTop: '8px' }}>
                    <div style={{ width: `${connectedRate}%`, height: '100%', background: 'var(--primary)', borderRadius: '2px' }} />
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Interview Target</div>
                <div className="stat-value">{interviewed}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/10</span></div>
                <div className="stat-sub">Progress to goal</div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Response Time</div>
                <div className="stat-value">2.4<span style={{ fontSize: '1rem' }}>d</span></div>
                <div className="stat-sub">Average response</div>
            </div>
        </div>
    );
};
