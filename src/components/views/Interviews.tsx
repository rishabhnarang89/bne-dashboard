import { useState, useMemo } from 'react';
import { useValidationData, DEFAULT_QUESTIONS } from '../../hooks/useValidationData';
import type { Teacher, TeacherStatus, Interview, InterviewQuestion, ContactMethod } from '../../hooks/useValidationData';
import {
    Plus, Trash2, Edit3, Search,
    Clock, Star, MessageSquare,
    Linkedin, Mail, Calendar, ExternalLink,
    LayoutGrid, List as ListIcon
} from 'lucide-react';
import { useToast, InfoBlock, Modal, InterviewTimer, QuestionnaireForm } from '../ui';
import { KanbanBoard, TeacherCard, OutreachStats } from './CRMComponents';

type ViewMode = 'list' | 'detail';
type FilterStatus = 'all' | TeacherStatus;

const STATUS_CONFIG: Record<TeacherStatus, { label: string; color: string; bg: string; emoji: string }> = {
    identified: { label: 'Identified', color: '#6b7280', bg: '#f3f4f6', emoji: '🔍' },
    request_sent: { label: 'Request Sent', color: '#f59e0b', bg: '#fffbeb', emoji: '📤' },
    connected: { label: 'Connected', color: '#3b82f6', bg: '#eff6ff', emoji: '🤝' },
    scheduled: { label: 'Scheduled', color: '#8b5cf6', bg: '#f5f3ff', emoji: '📅' },
    interviewed: { label: 'Interviewed', color: '#10b981', bg: '#ecfdf5', emoji: '✅' },
    follow_up: { label: 'Follow-up', color: '#f97316', bg: '#fff7ed', emoji: '🔄' }
};

export const Interviews = () => {
    const {
        teachers, addTeacher, updateTeacher, deleteTeacher,
        addInterview, updateInterview, deleteInterview,
        getInterviewsByTeacher, goals
    } = useValidationData();
    const { showToast } = useToast();

    // View mode
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [crmView, setCrmView] = useState<'list' | 'kanban'>('list');
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

    // Filter & Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

    // Teacher form modal
    const [teacherModalOpen, setTeacherModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [teacherForm, setTeacherForm] = useState<Partial<Teacher>>({
        status: 'identified',
        schoolType: 'Gymnasium'
    });

    // Interview form modal
    const [interviewModalOpen, setInterviewModalOpen] = useState(false);
    const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
    const [interviewForm, setInterviewForm] = useState<Partial<Interview>>({
        status: 'completed',
        success: 'yes',
        commitment: 'maybe',
        priceReaction: 'neutral',
        score: 5,
        setupTime: 120,
        duration: 30
    });

    // Interview stage management
    type InterviewStage = 'setup' | 'active' | 'complete';
    const [interviewStage, setInterviewStage] = useState<InterviewStage>('setup');
    const [timerActive, setTimerActive] = useState(false);
    const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([...DEFAULT_QUESTIONS]);
    const [startTime, setStartTime] = useState<number | null>(null);

    // Delete confirmation
    const [deleteTeacherModalOpen, setDeleteTeacherModalOpen] = useState<number | null>(null);
    const [deleteInterviewModalOpen, setDeleteInterviewModalOpen] = useState<number | null>(null);

    // Filtered teachers
    const filteredTeachers = useMemo(() => {
        let result = [...teachers];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.school.toLowerCase().includes(query) ||
                t.email?.toLowerCase().includes(query) ||
                t.notes?.toLowerCase().includes(query)
            );
        }

        if (filterStatus !== 'all') {
            result = result.filter(t => t.status === filterStatus);
        }

        // Sort by created date (newest first)
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return result;
    }, [teachers, searchQuery, filterStatus]);

    // Get selected teacher
    const selectedTeacher = selectedTeacherId ? teachers.find(t => t.id === selectedTeacherId) : null;
    const teacherInterviews = selectedTeacherId ? getInterviewsByTeacher(selectedTeacherId) : [];

    // Handle teacher form submit
    const handleTeacherSubmit = () => {
        if (!teacherForm.name?.trim() || !teacherForm.school?.trim()) {
            showToast('Name and School are required', 'error');
            return;
        }

        if (editingTeacher) {
            updateTeacher(editingTeacher.id, teacherForm);
            showToast('Teacher updated!', 'success');
        } else {
            addTeacher(teacherForm as Omit<Teacher, 'id' | 'createdAt'>);
            showToast('Teacher added! 🎉', 'success');
        }

        setTeacherModalOpen(false);
        setEditingTeacher(null);
        setTeacherForm({ status: 'identified', schoolType: 'Gymnasium' });
    };

    // Open teacher modal for edit
    const openEditTeacher = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setTeacherForm({ ...teacher });
        setTeacherModalOpen(true);
    };

    // Handle interview form submit
    const handleInterviewSubmit = () => {
        if (!selectedTeacherId) return;

        // Calculate actual time spent
        const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

        const interviewData = {
            ...interviewForm as Omit<Interview, 'id'>,
            teacherId: selectedTeacherId,
            date: new Date().toLocaleDateString(),
            questions: interviewQuestions,
            timeSpent,
            duration: interviewForm.duration || 30
        };

        if (editingInterview) {
            updateInterview(editingInterview.id, interviewData);
            showToast('Interview updated!', 'success');
        } else {
            addInterview(interviewData);
            showToast('Interview logged! 🎉', 'success');
        }

        // Reset everything
        resetInterviewModal();
    };

    const resetInterviewModal = () => {
        setInterviewModalOpen(false);
        setEditingInterview(null);
        setInterviewStage('setup');
        setTimerActive(false);
        setStartTime(null);
        setInterviewQuestions([...DEFAULT_QUESTIONS]);
        setInterviewForm({
            status: 'completed',
            success: 'yes',
            commitment: 'maybe',
            priceReaction: 'neutral',
            score: 5,
            setupTime: 120,
            duration: 30
        });
    };

    // Start interview (move from setup to active)
    const startInterview = () => {
        setInterviewStage('active');
        setStartTime(Date.now());
        setTimerActive(true);
    };

    // Complete interview (move from active to complete)
    const completeInterview = () => {
        setInterviewStage('complete');
        setTimerActive(false);
    };

    // Open interview for edit
    const openEditInterview = (interview: Interview) => {
        setEditingInterview(interview);
        setInterviewForm({ ...interview });

        // Load existing questionnaire if available
        if (interview.questions && interview.questions.length > 0) {
            setInterviewQuestions(interview.questions);
        } else {
            // If no questions, use defaults
            setInterviewQuestions([...DEFAULT_QUESTIONS]);
        }

        // Skip directly to complete stage for editing
        setInterviewStage('complete');
        setInterviewModalOpen(true);
    };

    // Handle delete
    const handleDeleteTeacher = (id: number) => {
        deleteTeacher(id);
        showToast('Teacher deleted', 'info');
        setDeleteTeacherModalOpen(null);
        if (selectedTeacherId === id) {
            setSelectedTeacherId(null);
            setViewMode('list');
        }
    };

    const handleDeleteInterview = (id: number) => {
        deleteInterview(id);
        showToast('Interview deleted', 'info');
        setDeleteInterviewModalOpen(null);
    };

    // Score color helper
    const getScoreColor = (score: number) => {
        if (score >= 8) return 'var(--primary)';
        if (score >= 5) return 'var(--warning)';
        return 'var(--danger)';
    };

    // View teacher detail
    const openTeacherDetail = (teacherId: number) => {
        setSelectedTeacherId(teacherId);
        setViewMode('detail');
    };

    // Back to list
    const backToList = () => {
        setViewMode('list');
        setSelectedTeacherId(null);
    };

    // =========================================================================
    // RENDER: TEACHER LIST VIEW
    // =========================================================================

    const renderListView = () => (
        <>
            {/* Outreach Pipeline Stats */}
            <OutreachStats teachers={teachers} />

            {/* View Controls & Filter Header */}
            <div className="glass-card" style={{ marginBottom: '20px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className={`btn ${crmView === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setCrmView('list')}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <ListIcon size={16} /> List
                        </button>
                        <button
                            className={`btn ${crmView === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setCrmView('kanban')}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <LayoutGrid size={16} /> Kanban
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: '240px', position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                type="text"
                                placeholder="Search teachers..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                        <select
                            className="input"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value as FilterStatus)}
                            style={{ width: 'auto' }}
                        >
                            <option value="all">All Status</option>
                            <option value="identified">🔍 Identified</option>
                            <option value="request_sent">📤 Sent</option>
                            <option value="connected">🤝 Connected</option>
                            <option value="scheduled">📅 Scheduled</option>
                            <option value="interviewed">✅ Done</option>
                        </select>
                        <button
                            className="btn btn-primary"
                            onClick={() => { setEditingTeacher(null); setTeacherForm({ status: 'identified', schoolType: 'Gymnasium' }); setTeacherModalOpen(true); }}
                        >
                            <Plus size={16} /> Add Teacher
                        </button>
                    </div>
                </div>
            </div>

            {/* View Rendering */}
            {crmView === 'kanban' ? (
                <KanbanBoard
                    teachers={filteredTeachers}
                    interviewCounts={teachers.reduce((acc, t) => {
                        acc[t.id] = getInterviewsByTeacher(t.id).length;
                        return acc;
                    }, {} as Record<number, number>)}
                    onTeacherClick={openTeacherDetail}
                    onEdit={openEditTeacher}
                    onDelete={(id) => setDeleteTeacherModalOpen(id)}
                />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {filteredTeachers.map(teacher => (
                        <TeacherCard
                            key={teacher.id}
                            teacher={teacher}
                            interviewCount={getInterviewsByTeacher(teacher.id).length}
                            onEdit={openEditTeacher}
                            onDelete={(id) => setDeleteTeacherModalOpen(id)}
                            onClick={openTeacherDetail}
                        />
                    ))}
                    {filteredTeachers.length === 0 && (
                        <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                            <Search size={36} />
                            <div className="empty-state-title">No Teachers Found</div>
                            <div className="empty-state-description">Try adjusting your search or filters.</div>
                        </div>
                    )}
                </div>
            )}
        </>
    );

    // =========================================================================
    // RENDER: TEACHER DETAIL VIEW
    // =========================================================================

    const renderDetailView = () => {
        if (!selectedTeacher) return null;
        const statusConfig = STATUS_CONFIG[selectedTeacher.status];

        return (
            <>
                {/* Back button */}
                <button className="btn btn-ghost" onClick={backToList} style={{ marginBottom: '16px' }}>
                    ← Back to List
                </button>

                {/* Teacher Profile Card */}
                <div className="glass-card" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: 'var(--primary-light)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    {selectedTeacher.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedTeacher.name}</h2>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {selectedTeacher.designation && `${selectedTeacher.designation} • `}
                                        {selectedTeacher.department && `${selectedTeacher.department} • `}
                                        {selectedTeacher.school}
                                    </div>
                                </div>
                            </div>
                            <span
                                style={{
                                    fontSize: '0.8rem',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    background: statusConfig.bg,
                                    color: statusConfig.color,
                                    fontWeight: 600
                                }}
                            >
                                {statusConfig.emoji} {statusConfig.label}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-ghost" onClick={() => openEditTeacher(selectedTeacher)}>
                                <Edit3 size={16} /> Edit
                            </button>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setDeleteTeacherModalOpen(selectedTeacher.id)}
                                style={{ color: 'var(--danger)' }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        {selectedTeacher.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <Mail size={14} /> {selectedTeacher.email}
                            </div>
                        )}
                        {selectedTeacher.linkedinUrl && (
                            <a
                                href={selectedTeacher.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0077b5', fontSize: '0.9rem', textDecoration: 'none' }}
                            >
                                <Linkedin size={14} /> LinkedIn Profile <ExternalLink size={12} />
                            </a>
                        )}
                        {selectedTeacher.requestSentDate && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <Calendar size={14} /> Request sent: {new Date(selectedTeacher.requestSentDate).toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    {selectedTeacher.notes && (
                        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                            📝 {selectedTeacher.notes}
                        </div>
                    )}

                    {/* Update Status Quick Actions */}
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Update Status:</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {(Object.keys(STATUS_CONFIG) as TeacherStatus[]).map(status => (
                                <button
                                    key={status}
                                    className={`btn btn-sm ${selectedTeacher.status === status ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => updateTeacher(selectedTeacher.id, { status })}
                                >
                                    {STATUS_CONFIG[status].emoji} {STATUS_CONFIG[status].label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Interviews Section */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={20} /> Interview History
                            <span className="tag tag-success">{teacherInterviews.length}</span>
                        </h3>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setEditingInterview(null);
                                setInterviewForm({
                                    status: 'completed',
                                    success: 'yes',
                                    commitment: 'maybe',
                                    priceReaction: 'neutral',
                                    score: 5,
                                    setupTime: 120
                                });
                                setInterviewModalOpen(true);
                            }}
                        >
                            <Plus size={16} /> Log Interview
                        </button>
                    </div>

                    {teacherInterviews.length === 0 ? (
                        <div className="empty-state">
                            <MessageSquare size={32} />
                            <div className="empty-state-title">No Interviews Yet</div>
                            <div className="empty-state-description">Log your first interview with {selectedTeacher.name}.</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {teacherInterviews.map(interview => (
                                <div
                                    key={interview.id}
                                    style={{
                                        padding: '16px',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border-light)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Star size={16} color={getScoreColor(interview.score)} fill={interview.score >= 8 ? getScoreColor(interview.score) : 'none'} />
                                                    <span style={{ fontWeight: 700, color: getScoreColor(interview.score), fontSize: '1.1rem' }}>
                                                        {interview.score}/10
                                                    </span>
                                                </div>
                                                <span className={`tag ${interview.commitment === 'pilot' ? 'tag-success' : interview.commitment === 'maybe' ? 'tag-warning' : 'tag-neutral'}`}>
                                                    {interview.commitment === 'pilot' && '🚀'} {interview.commitment.toUpperCase()}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    <Clock size={12} /> {interview.setupTime}s setup
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {interview.date} • Price reaction: {interview.priceReaction}
                                                {interview.success === 'no' && <span className="tag tag-danger" style={{ marginLeft: '8px' }}>Tech Fail</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEditInterview(interview)}>
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => setDeleteInterviewModalOpen(interview.id)}
                                                style={{ color: 'var(--danger)' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    {interview.notes && (
                                        <div style={{ marginTop: '12px', padding: '10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                                            {interview.notes}
                                        </div>
                                    )}
                                    {interview.questions && interview.questions.length > 0 && (
                                        <details style={{ marginTop: '12px' }}>
                                            <summary style={{
                                                cursor: 'pointer',
                                                padding: '8px 12px',
                                                background: 'var(--bg-card)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                color: 'var(--primary)',
                                                userSelect: 'none'
                                            }}>
                                                📋 View Questionnaire Responses ({interview.questions.filter((q: any) => q.answer && q.answer.trim()).length}/{interview.questions.length} answered)
                                            </summary>
                                            <div style={{
                                                marginTop: '12px',
                                                padding: '12px',
                                                background: 'var(--bg-card)',
                                                borderRadius: 'var(--radius-sm)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '16px'
                                            }}>
                                                {interview.questions.map((q: any, idx: number) => (
                                                    <div key={q.id} style={{
                                                        paddingBottom: '12px',
                                                        borderBottom: idx < interview.questions!.length - 1 ? '1px solid var(--border-default)' : 'none'
                                                    }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                                                            {q.question}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                            {q.answer || <em style={{ color: 'var(--text-muted)' }}>No answer provided</em>}
                                                        </div>
                                                        {q.remarks && (
                                                            <div style={{
                                                                fontSize: '0.8rem',
                                                                color: 'var(--text-muted)',
                                                                fontStyle: 'italic',
                                                                marginTop: '4px',
                                                                paddingLeft: '12px',
                                                                borderLeft: '2px solid var(--border-light)'
                                                            }}>
                                                                💭 {q.remarks}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </>
        );
    };

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {viewMode === 'list' ? renderListView() : renderDetailView()}

            {/* Teacher Form Modal */}
            <Modal
                isOpen={teacherModalOpen}
                onClose={() => { setTeacherModalOpen(false); setEditingTeacher(null); }}
                title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                size="lg"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setTeacherModalOpen(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleTeacherSubmit}>
                            {editingTeacher ? 'Update' : 'Add Teacher'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="label">Name *</label>
                            <input
                                className="input"
                                placeholder="e.g. Frau Müller"
                                value={teacherForm.name || ''}
                                onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Designation</label>
                            <input
                                className="input"
                                placeholder="e.g. STEM Teacher, Head of Department"
                                value={teacherForm.designation || ''}
                                onChange={e => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="label">School *</label>
                            <input
                                className="input"
                                placeholder="e.g. Goethe-Gymnasium"
                                value={teacherForm.school || ''}
                                onChange={e => setTeacherForm({ ...teacherForm, school: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">School Type</label>
                            <select
                                className="input"
                                value={teacherForm.schoolType || 'Gymnasium'}
                                onChange={e => setTeacherForm({ ...teacherForm, schoolType: e.target.value as Teacher['schoolType'] })}
                            >
                                <option>Gymnasium</option>
                                <option>Realschule</option>
                                <option>Gesamtschule</option>
                                <option>Grundschule</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="label">Department</label>
                            <input
                                className="input"
                                placeholder="e.g. Science, Geography"
                                value={teacherForm.department || ''}
                                onChange={e => setTeacherForm({ ...teacherForm, department: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Status</label>
                            <select
                                className="input"
                                value={teacherForm.status || 'identified'}
                                onChange={e => setTeacherForm({ ...teacherForm, status: e.target.value as TeacherStatus })}
                            >
                                <option value="identified">🔍 Identified</option>
                                <option value="request_sent">📤 Request Sent</option>
                                <option value="connected">🤝 Connected</option>
                                <option value="scheduled">📅 Scheduled</option>
                                <option value="interviewed">✅ Interviewed</option>
                                <option value="follow_up">🔄 Follow-up</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="label">Email</label>
                            <input
                                className="input"
                                type="email"
                                placeholder="teacher@school.de"
                                value={teacherForm.email || ''}
                                onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">LinkedIn URL</label>
                            <input
                                className="input"
                                placeholder="https://linkedin.com/in/..."
                                value={teacherForm.linkedinUrl || ''}
                                onChange={e => setTeacherForm({ ...teacherForm, linkedinUrl: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="label">Request Sent Date</label>
                        <input
                            className="input"
                            type="date"
                            value={teacherForm.requestSentDate || ''}
                            onChange={e => setTeacherForm({ ...teacherForm, requestSentDate: e.target.value })}
                        />
                    </div>

                    {/* Outreach Tracking Section */}
                    <div style={{
                        padding: '16px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-default)',
                        marginTop: '8px'
                    }}>
                        <h4 style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            marginBottom: '16px',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            📊 Outreach Tracking
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="label">Contact Method</label>
                                <select
                                    className="input"
                                    value={teacherForm.contactMethod || ''}
                                    onChange={e => setTeacherForm({ ...teacherForm, contactMethod: e.target.value as ContactMethod })}
                                >
                                    <option value="">Not specified</option>
                                    <option value="linkedin">💼 LinkedIn</option>
                                    <option value="email">📧 Email</option>
                                    <option value="phone">📞 Phone</option>
                                    <option value="in-person">🤝 In-Person</option>
                                    <option value="other">📝 Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Response Date</label>
                                <input
                                    className="input"
                                    type="date"
                                    value={teacherForm.responseDate || ''}
                                    onChange={e => setTeacherForm({ ...teacherForm, responseDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="label">Last Contact Date</label>
                                <input
                                    className="input"
                                    type="date"
                                    value={teacherForm.lastContactDate || ''}
                                    onChange={e => setTeacherForm({ ...teacherForm, lastContactDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Next Follow-Up Date</label>
                                <input
                                    className="input"
                                    type="date"
                                    value={teacherForm.nextFollowUpDate || ''}
                                    onChange={e => setTeacherForm({ ...teacherForm, nextFollowUpDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '8px' }}>
                            <label className="label" style={{ marginBottom: '12px' }}>Contact Attempts</label>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={teacherForm.linkedinMessageSent || false}
                                        onChange={e => setTeacherForm({ ...teacherForm, linkedinMessageSent: e.target.checked })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.9rem' }}>💼 LinkedIn Message</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={teacherForm.emailSent || false}
                                        onChange={e => setTeacherForm({ ...teacherForm, emailSent: e.target.checked })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.9rem' }}>📧 Email Sent</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={teacherForm.phoneCallMade || false}
                                        onChange={e => setTeacherForm({ ...teacherForm, phoneCallMade: e.target.checked })}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.9rem' }}>📞 Phone Call</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Notes</label>
                        <textarea
                            className="textarea"
                            placeholder="Any notes about this contact..."
                            value={teacherForm.notes || ''}
                            onChange={e => setTeacherForm({ ...teacherForm, notes: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>
            </Modal>

            {/* Interview Form Modal - Three Stage Flow */}
            <Modal
                isOpen={interviewModalOpen}
                onClose={() => resetInterviewModal()}
                title={
                    editingInterview ? 'Edit Interview' :
                        interviewStage === 'setup' ? 'Setup Interview' :
                            interviewStage === 'active' ? `Interview: ${selectedTeacher?.name}` :
                                'Complete Interview'
                }
                size="lg"
                footer={
                    <>
                        {interviewStage === 'setup' && (
                            <>
                                <button className="btn btn-secondary" onClick={() => resetInterviewModal()}>Cancel</button>
                                <button className="btn btn-primary" onClick={startInterview}>
                                    Start Interview
                                </button>
                            </>
                        )}
                        {interviewStage === 'active' && (
                            <>
                                <button className="btn btn-secondary" onClick={() => setTimerActive(!timerActive)}>
                                    {timerActive ? 'Pause Timer' : 'Resume Timer'}
                                </button>
                                <button className="btn btn-primary" onClick={completeInterview}>
                                    Complete Interview
                                </button>
                            </>
                        )}
                        {interviewStage === 'complete' && (
                            <>
                                <button className="btn btn-secondary" onClick={() => setInterviewStage('active')}>
                                    Back to Questions
                                </button>
                                <button className="btn btn-primary" onClick={handleInterviewSubmit}>
                                    Save Interview
                                </button>
                            </>
                        )}
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selectedTeacher && (
                        <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', marginBottom: '8px' }}>
                            <strong>Teacher:</strong> {selectedTeacher.name} • {selectedTeacher.school}
                        </div>
                    )}

                    {/* STAGE 1: SETUP */}
                    {interviewStage === 'setup' && (
                        <div>
                            <InfoBlock
                                icon={<Clock size={18} />}
                                title="Interview Setup"
                                description="Select the interview duration. The timer will start when you click 'Start Interview'."
                                variant="info"
                            />
                            <div style={{ marginTop: '20px' }}>
                                <label className="label" style={{ marginBottom: '12px' }}>Interview Duration</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    {([30, 45, 60] as const).map(dur => (
                                        <button
                                            key={dur}
                                            className={`btn ${interviewForm.duration === dur ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => setInterviewForm({ ...interviewForm, duration: dur })}
                                            style={{ padding: '20px', fontSize: '1.1rem' }}
                                        >
                                            <div style={{ fontWeight: 700, fontSize: '1.5rem' }}>{dur}</div>
                                            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>minutes</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STAGE 2: ACTIVE INTERVIEW */}
                    {interviewStage === 'active' && (
                        <div>
                            <InterviewTimer
                                duration={interviewForm.duration || 30}
                                onDurationChange={(dur) => setInterviewForm({ ...interviewForm, duration: dur })}
                                isActive={timerActive}
                                onToggle={() => setTimerActive(!timerActive)}
                                onStop={completeInterview}
                                onTimeUp={() => {
                                    setTimerActive(false);
                                    showToast('Time is up! Complete the interview when ready.', 'info');
                                }}
                            />
                            <QuestionnaireForm
                                questions={interviewQuestions}
                                onChange={setInterviewQuestions}
                            />
                        </div>
                    )}

                    {/* STAGE 3: COMPLETE */}
                    {interviewStage === 'complete' && (
                        <div>
                            <InfoBlock
                                icon={<Star size={18} />}
                                title="Final Scoring"
                                description="Complete the interview by providing final scores and observations."
                                variant="success"
                            />
                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="label">Setup Time (seconds)</label>
                                        <input
                                            className="input"
                                            type="number"
                                            value={interviewForm.setupTime || 120}
                                            onChange={e => setInterviewForm({ ...interviewForm, setupTime: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Technical Success?</label>
                                        <select
                                            className="input"
                                            value={interviewForm.success || 'yes'}
                                            onChange={e => setInterviewForm({ ...interviewForm, success: e.target.value as 'yes' | 'no' })}
                                        >
                                            <option value="yes">✓ Success</option>
                                            <option value="no">✗ Technical Fail</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="label">Adoption Score (1-10): {interviewForm.score || 5}/10</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={interviewForm.score || 5}
                                        onChange={e => setInterviewForm({ ...interviewForm, score: parseInt(e.target.value) })}
                                        style={{ width: '100%' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <span>Not interested</span>
                                        <span>Would buy</span>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="label">Commitment Signal</label>
                                        <select
                                            className="input"
                                            value={interviewForm.commitment || 'maybe'}
                                            onChange={e => setInterviewForm({ ...interviewForm, commitment: e.target.value as Interview['commitment'] })}
                                        >
                                            <option value="none">None</option>
                                            <option value="maybe">Maybe</option>
                                            <option value="pilot">🚀 YES (Pilot)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Price Reaction (€{goals.pricePoint})</label>
                                        <select
                                            className="input"
                                            value={interviewForm.priceReaction || 'neutral'}
                                            onChange={e => setInterviewForm({ ...interviewForm, priceReaction: e.target.value as Interview['priceReaction'] })}
                                        >
                                            <option value="positive">👍 Positive</option>
                                            <option value="neutral">😐 Neutral</option>
                                            <option value="negative">👎 Negative</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MessageSquare size={14} /> Additional Notes
                                    </label>
                                    <textarea
                                        className="textarea"
                                        placeholder="Any additional observations, quotes, or insights..."
                                        value={interviewForm.notes || ''}
                                        onChange={e => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Delete Teacher Modal */}
            <Modal
                isOpen={deleteTeacherModalOpen !== null}
                onClose={() => setDeleteTeacherModalOpen(null)}
                title="Delete Teacher?"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setDeleteTeacherModalOpen(null)}>Cancel</button>
                        <button className="btn btn-danger" onClick={() => deleteTeacherModalOpen && handleDeleteTeacher(deleteTeacherModalOpen)}>Delete</button>
                    </>
                }
            >
                <p>Are you sure you want to delete this teacher and all their interviews? This cannot be undone.</p>
            </Modal>

            {/* Delete Interview Modal */}
            <Modal
                isOpen={deleteInterviewModalOpen !== null}
                onClose={() => setDeleteInterviewModalOpen(null)}
                title="Delete Interview?"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setDeleteInterviewModalOpen(null)}>Cancel</button>
                        <button className="btn btn-danger" onClick={() => deleteInterviewModalOpen && handleDeleteInterview(deleteInterviewModalOpen)}>Delete</button>
                    </>
                }
            >
                <p>Are you sure you want to delete this interview log? This cannot be undone.</p>
            </Modal>
        </div>
    );
};
