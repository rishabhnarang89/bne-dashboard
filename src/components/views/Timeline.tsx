import { useState, useEffect, useCallback } from 'react';
import { useValidationData, WEEKS } from '../../hooks/useValidationData';
import type { Task, TeamMember } from '../../hooks/useValidationData';
import {
    CheckCircle2, Circle, Clock, Plus, Edit3, Trash2, ChevronDown, ChevronUp,
    AlertTriangle, Calendar, Search, X, Check, ListTodo, PartyPopper
} from 'lucide-react';
import { InfoBlock, Modal, useToast } from '../ui';

type FilterType = 'all' | 'incomplete' | 'completed' | 'overdue' | 'today';
type SortType = 'default' | 'dueDate' | 'priority' | 'created';

const PRIORITY_CONFIG = {
    high: { color: '#ef4444', bg: '#fef2f2', label: 'High' },
    medium: { color: '#f59e0b', bg: '#fffbeb', label: 'Medium' },
    low: { color: '#6b7280', bg: '#f3f4f6', label: 'Low' }
};

const ASSIGNEE_CONFIG: Record<TeamMember, { color: string; bg: string; label: string; emoji: string }> = {
    rishabh: { color: '#3b82f6', bg: '#eff6ff', label: 'Rishabh', emoji: '👨‍💻' },
    tung: { color: '#8b5cf6', bg: '#f5f3ff', label: 'Tung', emoji: '🎯' },
    both: { color: '#10b981', bg: '#ecfdf5', label: 'Both', emoji: '👥' }
};

export const Timeline = () => {
    const {
        tasks, toggleTask, addTask, updateTask, deleteTask, moveTask,
        addSubtask, toggleSubtask, deleteSubtask,
        getCurrentWeek, daysUntilDecision, overdueTasks
    } = useValidationData();
    const { showToast } = useToast();
    const currentWeek = getCurrentWeek();

    // UI State
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortType>('default');
    const [searchQuery, setSearchQuery] = useState('');


    // Quick add state
    const [quickAddWeek, setQuickAddWeek] = useState<number | null>(null);
    const [quickAddText, setQuickAddText] = useState('');

    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Task>>({});

    // Delete confirmation
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Subtask add state
    const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null);
    const [newSubtaskText, setNewSubtaskText] = useState('');

    // Celebration state
    const [celebrating, setCelebrating] = useState<number | null>(null);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                setQuickAddWeek(currentWeek || 1);
            }
            if (e.key === 'Escape') {
                setQuickAddWeek(null);
                setEditModalOpen(false);
                setExpandedTaskId(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentWeek]);

    // Filter and sort tasks
    const getFilteredTasks = useCallback((weekId: number) => {
        let result = tasks.filter(t => t.weekId === weekId);

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.notes?.toLowerCase().includes(query)
            );
        }

        // Filter
        switch (filter) {
            case 'incomplete': result = result.filter(t => !t.completed); break;
            case 'completed': result = result.filter(t => t.completed); break;
            case 'overdue': result = result.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()); break;
            case 'today': {
                const today = new Date().toISOString().split('T')[0];
                result = result.filter(t => t.dueDate === today);
                break;
            }
        }

        // Sort
        switch (sortBy) {
            case 'dueDate':
                result.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                });
                break;
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
            case 'created':
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }

        return result;
    }, [tasks, searchQuery, filter, sortBy]);

    // Progress calculations
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const getWeekProgress = (weekId: number) => {
        const weekTasks = tasks.filter(t => t.weekId === weekId);
        const completed = weekTasks.filter(t => t.completed).length;
        return { completed, total: weekTasks.length };
    };

    // Check for week completion celebration
    useEffect(() => {
        WEEKS.forEach(week => {
            const { completed, total } = getWeekProgress(week.id);
            if (total > 0 && completed === total && !celebrating) {
                const wasJustCompleted = tasks.some(t =>
                    t.weekId === week.id &&
                    t.completedAt &&
                    new Date().getTime() - new Date(t.completedAt).getTime() < 2000
                );
                if (wasJustCompleted) {
                    setCelebrating(week.id);
                    showToast(`🎉 ${week.title} complete!`, 'success');
                    setTimeout(() => setCelebrating(null), 3000);
                }
            }
        });
    }, [tasks]);

    // Quick add handler
    const handleQuickAdd = (weekId: number) => {
        if (!quickAddText.trim()) return;
        addTask({
            title: quickAddText.trim(),
            weekId,
            priority: 'medium',
            completed: false
        });
        setQuickAddText('');
        setQuickAddWeek(null);
        showToast('Task added!', 'success');
    };

    // Edit handlers
    const openEditModal = (task: Task) => {
        setEditFormData({ ...task });
        setEditModalOpen(true);
        setEditingTaskId(task.id);
    };

    const saveEdit = () => {
        if (editingTaskId && editFormData.title?.trim()) {
            updateTask(editingTaskId, editFormData);
            setEditModalOpen(false);
            setEditingTaskId(null);
            showToast('Task updated!', 'success');
        }
    };

    // Delete handler
    const confirmDelete = (id: string) => {
        deleteTask(id);
        setDeleteConfirmId(null);
        showToast('Task deleted', 'info');
    };

    // Subtask handlers
    const handleAddSubtask = (taskId: string) => {
        if (!newSubtaskText.trim()) return;
        addSubtask(taskId, newSubtaskText.trim());
        setNewSubtaskText('');
        setAddingSubtaskTo(null);
    };

    // Is task overdue?
    const isOverdue = (task: Task) => !task.completed && task.dueDate && new Date(task.dueDate) < new Date();

    // Render task row
    const TaskRow = ({ task }: { task: Task }) => {
        const overdue = isOverdue(task);
        const expanded = expandedTaskId === task.id;
        const priorityConfig = PRIORITY_CONFIG[task.priority];
        const subtaskProgress = task.subtasks.length > 0
            ? task.subtasks.filter(s => s.done).length
            : null;

        return (
            <div style={{ borderBottom: '1px solid var(--border-light)' }}>
                {/* Main row */}
                <div
                    style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: task.completed ? 'var(--success-light)' : overdue ? 'var(--danger-light)' : undefined,
                        transition: 'background 0.2s'
                    }}
                >
                    {/* Checkbox */}
                    <button
                        onClick={() => toggleTask(task.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            color: task.completed ? 'var(--primary)' : 'var(--border-strong)',
                            flexShrink: 0
                        }}
                    >
                        {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>

                    {/* Priority indicator */}
                    <span
                        style={{
                            width: '6px',
                            height: '24px',
                            background: priorityConfig.color,
                            borderRadius: '3px',
                            flexShrink: 0
                        }}
                        title={`${priorityConfig.label} priority`}
                    />

                    {/* Task content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: task.completed ? 'var(--text-muted)' : 'var(--text-main)',
                                fontWeight: 500
                            }}>
                                {task.title}
                            </span>

                            {overdue && (
                                <span className="tag tag-danger" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                                    <AlertTriangle size={10} /> OVERDUE
                                </span>
                            )}

                            {task.dueDate && !overdue && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={12} />
                                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            )}

                            {subtaskProgress !== null && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    ({subtaskProgress}/{task.subtasks.length})
                                </span>
                            )}

                            {task.assignee && (
                                <span
                                    style={{
                                        fontSize: '0.7rem',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        background: ASSIGNEE_CONFIG[task.assignee].bg,
                                        color: ASSIGNEE_CONFIG[task.assignee].color,
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                    }}
                                >
                                    {ASSIGNEE_CONFIG[task.assignee].emoji} {ASSIGNEE_CONFIG[task.assignee].label}
                                </span>
                            )}
                        </div>

                        {task.notes && !expanded && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                📝 {task.notes.substring(0, 50)}{task.notes.length > 50 ? '...' : ''}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => setExpandedTaskId(expanded ? null : task.id)}
                            style={{ padding: '4px' }}
                        >
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => openEditModal(task)}
                            style={{ padding: '4px' }}
                        >
                            <Edit3 size={16} />
                        </button>
                        {!task.isDefault && (
                            <button
                                className="btn btn-ghost btn-icon btn-sm"
                                onClick={() => setDeleteConfirmId(task.id)}
                                style={{ padding: '4px', color: 'var(--danger)' }}
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Expanded details */}
                {expanded && (
                    <div style={{ padding: '12px 16px 16px 52px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)' }}>
                        {task.notes && (
                            <div style={{ marginBottom: '12px', padding: '10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                                {task.notes}
                            </div>
                        )}

                        {/* Subtasks */}
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ListTodo size={14} /> Subtasks
                            </div>
                            {task.subtasks.map(st => (
                                <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                                    <button
                                        onClick={() => toggleSubtask(task.id, st.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: st.done ? 'var(--primary)' : 'var(--text-muted)' }}
                                    >
                                        {st.done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                    </button>
                                    <span style={{ flex: 1, textDecoration: st.done ? 'line-through' : 'none', color: st.done ? 'var(--text-muted)' : 'var(--text-main)', fontSize: '0.9rem' }}>
                                        {st.text}
                                    </span>
                                    <button
                                        onClick={() => deleteSubtask(task.id, st.id)}
                                        className="btn btn-ghost btn-sm"
                                        style={{ padding: '2px', color: 'var(--text-muted)' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            {/* Add subtask */}
                            {addingSubtaskTo === task.id ? (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <input
                                        className="input"
                                        placeholder="Subtask description..."
                                        value={newSubtaskText}
                                        onChange={e => setNewSubtaskText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddSubtask(task.id)}
                                        autoFocus
                                        style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem' }}
                                    />
                                    <button className="btn btn-primary btn-sm" onClick={() => handleAddSubtask(task.id)}>
                                        <Check size={14} />
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setAddingSubtaskTo(null)}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setAddingSubtaskTo(task.id)}
                                    style={{ marginTop: '8px', color: 'var(--primary)' }}
                                >
                                    <Plus size={14} /> Add subtask
                                </button>
                            )}
                        </div>

                        {/* Move to week */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Move to:</span>
                            {WEEKS.filter(w => w.id !== task.weekId).map(w => (
                                <button
                                    key={w.id}
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => { moveTask(task.id, w.id); showToast(`Moved to ${w.title}`, 'success'); }}
                                >
                                    {w.title.split(':')[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <InfoBlock
                icon={<Clock size={20} />}
                title="Task Management"
                description="Add, track, and complete tasks. Press 'N' for quick add. Click tasks to expand details and subtasks."
                variant="info"
            />

            {/* Overdue alert */}
            {overdueTasks.length > 0 && (
                <div className="alert alert-danger" style={{ marginTop: '16px' }}>
                    <AlertTriangle size={20} />
                    <div>
                        <div className="alert-title">{overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}</div>
                        <div className="alert-description">
                            {overdueTasks.slice(0, 3).map(t => t.title).join(', ')}
                            {overdueTasks.length > 3 && ` and ${overdueTasks.length - 3} more`}
                        </div>
                    </div>
                </div>
            )}

            {/* Progress & Filters */}
            <div className="glass-card" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 'bold' }}>Overall Progress</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>{progress}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'var(--border-default)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>{completedTasks} of {totalTasks} tasks</span>
                    <span>{daysUntilDecision} days until decision</span>
                </div>

                {/* Filter bar */}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '34px' }}
                            />
                        </div>
                        <select className="input" value={filter} onChange={e => setFilter(e.target.value as FilterType)} style={{ width: 'auto' }}>
                            <option value="all">All Tasks</option>
                            <option value="incomplete">Incomplete</option>
                            <option value="completed">Completed</option>
                            <option value="overdue">Overdue</option>
                            <option value="today">Due Today</option>
                        </select>
                        <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value as SortType)} style={{ width: 'auto' }}>
                            <option value="default">Default Order</option>
                            <option value="dueDate">By Due Date</option>
                            <option value="priority">By Priority</option>
                            <option value="created">Newest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Week Cards */}
            {WEEKS.map(week => {
                const weekProgress = getWeekProgress(week.id);
                const isCurrentWeek = week.id === currentWeek || (week.id === 2 && currentWeek === 2);
                const isComplete = weekProgress.total > 0 && weekProgress.completed === weekProgress.total;
                const weekTasks = getFilteredTasks(week.id);

                return (
                    <div
                        key={week.id}
                        className="glass-panel"
                        style={{
                            marginTop: '20px',
                            overflow: 'hidden',
                            border: isCurrentWeek ? '2px solid var(--primary)' : undefined,
                            animation: celebrating === week.id ? 'celebrate 0.5s ease' : undefined
                        }}
                    >
                        {/* Week header */}
                        <div style={{ padding: '16px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {isCurrentWeek && <span className="tag tag-success" style={{ fontSize: '0.65rem' }}>CURRENT</span>}
                                    {celebrating === week.id && <PartyPopper size={18} color="var(--warning)" />}
                                    {week.title}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{week.dates}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 600, color: isComplete ? 'var(--primary)' : 'var(--text-main)' }}>
                                        {weekProgress.completed}/{weekProgress.total}
                                    </div>
                                </div>
                                {isComplete && <span className="tag tag-success">Complete</span>}
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setQuickAddWeek(quickAddWeek === week.id ? null : week.id)}
                                    style={{ color: 'var(--primary)' }}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Quick add input */}
                        {quickAddWeek === week.id && (
                            <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '10px' }}>
                                <input
                                    className="input"
                                    placeholder="What needs to be done?"
                                    value={quickAddText}
                                    onChange={e => setQuickAddText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleQuickAdd(week.id)}
                                    autoFocus
                                    style={{ flex: 1 }}
                                />
                                <button className="btn btn-primary btn-sm" onClick={() => handleQuickAdd(week.id)}>
                                    Add
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setQuickAddWeek(null)}>
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Tasks */}
                        {weekTasks.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                {filter !== 'all' || searchQuery ? 'No matching tasks' : 'No tasks in this week'}
                            </div>
                        ) : (
                            weekTasks.map(task => <TaskRow key={task.id} task={task} />)
                        )}
                    </div>
                );
            })}

            {/* Edit Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Task"
                size="lg"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="label">Task Title</label>
                        <input
                            className="input"
                            value={editFormData.title || ''}
                            onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="label">Priority</label>
                            <select
                                className="input"
                                value={editFormData.priority || 'medium'}
                                onChange={e => setEditFormData({ ...editFormData, priority: e.target.value as Task['priority'] })}
                            >
                                <option value="high">🔴 High</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="low">⚪ Low</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="label">Due Date</label>
                            <input
                                type="date"
                                className="input"
                                value={editFormData.dueDate || ''}
                                onChange={e => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="label">Week</label>
                        <select
                            className="input"
                            value={editFormData.weekId || 1}
                            onChange={e => setEditFormData({ ...editFormData, weekId: parseInt(e.target.value) })}
                        >
                            {WEEKS.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Assigned To</label>
                        <select
                            className="input"
                            value={editFormData.assignee || ''}
                            onChange={e => setEditFormData({ ...editFormData, assignee: (e.target.value || undefined) as TeamMember | undefined })}
                        >
                            <option value="">Not assigned</option>
                            <option value="rishabh">👨‍💻 Rishabh</option>
                            <option value="tung">🎯 Tung</option>
                            <option value="both">👥 Both</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Notes / Blockers</label>
                        <textarea
                            className="textarea"
                            placeholder="Add context, blockers, or reference links..."
                            value={editFormData.notes || ''}
                            onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                            rows={4}
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteConfirmId !== null}
                onClose={() => setDeleteConfirmId(null)}
                title="Delete Task?"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                        <button className="btn btn-danger" onClick={() => deleteConfirmId && confirmDelete(deleteConfirmId)}>Delete</button>
                    </>
                }
            >
                <p>Are you sure you want to delete this task? This cannot be undone.</p>
            </Modal>

            {/* Celebration animation style */}
            <style>{`
                @keyframes celebrate {
                    0%, 100% { transform: scale(1); }
                    25% { transform: scale(1.02); }
                    50% { transform: scale(1); }
                    75% { transform: scale(1.01); }
                }
            `}</style>
        </div>
    );
};
