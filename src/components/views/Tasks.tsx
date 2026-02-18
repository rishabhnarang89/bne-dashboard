import { useState, useMemo } from 'react';
import { useValidationData } from '../../hooks/useValidationData';
import type { Task, TeamMember } from '../../hooks/useValidationData';
import { useAuth } from '../../contexts/AuthContext';
import {
    CheckCircle2, Circle, Clock, Plus, Edit3, Trash2,
    Calendar, Search, Filter, List, LayoutGrid,
    User, GraduationCap
} from 'lucide-react';
import { InfoBlock, Modal, useToast } from '../ui';

// CONSTANTS
const PRIORITY_CONFIG = {
    high: { color: '#ef4444', bg: '#fef2f2', label: 'High' },
    medium: { color: '#f59e0b', bg: '#fffbeb', label: 'Medium' },
    low: { color: '#6b7280', bg: '#f3f4f6', label: 'Low' }
};

const ASSIGNEE_CONFIG: Record<TeamMember, { color: string; bg: string; label: string; emoji: string }> = {
    rishabh: { color: '#3b82f6', bg: '#eff6ff', label: 'Rishabh', emoji: 'Vr' }, // Using initials/emoji
    tung: { color: '#8b5cf6', bg: '#f5f3ff', label: 'Tung', emoji: 'Pt' },
    johannes: { color: '#f59e0b', bg: '#fffbeb', label: 'Johannes', emoji: 'Jk' },
    all: { color: '#10b981', bg: '#ecfdf5', label: 'All', emoji: '👥' },
    both: { color: '#10b981', bg: '#ecfdf5', label: 'Both', emoji: '👥' }
};

type GroupBy = 'none' | 'priority' | 'week';
type FilterStatus = 'all' | 'incomplete' | 'completed';

export const Tasks = () => {
    const {
        tasks, toggleTask, addTask, updateTask, deleteTask, WEEKS, teachers
    } = useValidationData();
    const { showToast } = useToast();
    const { user } = useAuth();

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [filterAssignee, setFilterAssignee] = useState<string>('all'); // 'all', 'me', or specific user
    const [groupBy, setGroupBy] = useState<GroupBy>('priority');

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
    const [isCreating, setIsCreating] = useState(false);

    // Delete Confirmation State
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

    // Filter Logic
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            // Search
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const teacherName = task.linkedTeacherId ? teachers.find(t => t.id === task.linkedTeacherId)?.name.toLowerCase() : '';
                if (!task.title.toLowerCase().includes(q) && !task.notes?.toLowerCase().includes(q) && !teacherName?.includes(q)) return false;
            }

            // Status
            if (filterStatus === 'incomplete' && task.completed) return false;
            if (filterStatus === 'completed' && !task.completed) return false;

            // Assignee
            if (filterAssignee === 'me') {
                if (!user) return true; // Show all if not logged in
                const assignees = task.assignees || (task.assignee ? [task.assignee] : []);
                if (!assignees.includes(user.id as TeamMember) && !assignees.includes('all')) return false;
            } else if (filterAssignee !== 'all') {
                const assignees = task.assignees || (task.assignee ? [task.assignee] : []);
                if (!assignees.includes(filterAssignee as TeamMember)) return false;
            }

            return true;
        }).sort((a, b) => {
            // Sort by completion, then priority, then due date
            if (a.completed !== b.completed) return a.completed ? 1 : -1;

            const pMap = { high: 0, medium: 1, low: 2 };
            if (pMap[a.priority] !== pMap[b.priority]) return pMap[a.priority] - pMap[b.priority];

            if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            return 0;
        });
    }, [tasks, searchQuery, filterStatus, filterAssignee, user]);

    // Grouping Logic
    const groupedTasks = useMemo(() => {
        if (groupBy === 'none') return { 'All Tasks': filteredTasks };

        const groups: Record<string, Task[]> = {};

        filteredTasks.forEach(task => {
            let key = '';
            if (groupBy === 'priority') {
                key = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            } else if (groupBy === 'week') {
                const week = WEEKS.find(w => w.id === task.weekId);
                key = week ? week.title : 'Unscheduled';
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(task);
        });

        // Sort keys (High -> Medium -> Low for priority)
        if (groupBy === 'priority') {
            return {
                'High': groups['High'] || [],
                'Medium': groups['Medium'] || [],
                'Low': groups['Low'] || []
            };
        }

        return groups;

    }, [filteredTasks, groupBy, WEEKS]);

    // Handlers
    const handleSave = async () => {
        try {
            if (!currentTask.title?.trim()) return;

            if (isCreating) {
                await addTask({
                    title: currentTask.title,
                    notes: currentTask.notes,
                    priority: currentTask.priority || 'medium',
                    weekId: currentTask.weekId || 1,
                    assignees: currentTask.assignees || [], // Default to empty
                    linkedTeacherId: currentTask.linkedTeacherId,
                    completed: false
                });
                showToast('Task created', 'success');
            } else if (currentTask.id) {
                await updateTask(currentTask.id, {
                    title: currentTask.title,
                    notes: currentTask.notes,
                    priority: currentTask.priority,
                    weekId: currentTask.weekId,
                    dueDate: currentTask.dueDate,
                    assignees: currentTask.assignees,
                    linkedTeacherId: currentTask.linkedTeacherId,
                    assignee: currentTask.assignees?.[0] // Backward compat
                });
                showToast('Task updated', 'success');
            }
            setEditModalOpen(false);
        } catch (error: any) {
            console.error('Error in handleSave:', error);
            showToast(`Failed to save task: ${error.message || 'Unknown error'}`, 'error');
            // Keep modal open so data isn't lost if there was a REAL crash
        }
    };

    const openEdit = (task: Task) => {
        // Ensure assignees is populated
        const assignees = task.assignees || (task.assignee ? [task.assignee] : []);
        setCurrentTask({ ...task, assignees });
        setIsCreating(false);
        setEditModalOpen(true);
    };

    const openCreate = () => {
        setCurrentTask({
            priority: 'medium',
            weekId: 1,
            assignees: user ? [user.id as TeamMember] : []
        });
        setIsCreating(true);
        setEditModalOpen(true);
    };

    const toggleAssignee = (member: TeamMember) => {
        const current = currentTask.assignees || [];
        if (current.includes(member)) {
            setCurrentTask({ ...currentTask, assignees: current.filter(m => m !== member) });
        } else {
            setCurrentTask({ ...currentTask, assignees: [...current, member] });
        }
    };

    // Components
    const TaskCard = ({ task }: { task: Task }) => {
        const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date();
        const assignees = Array.isArray(task.assignees) ? task.assignees : (task.assignee ? [task.assignee as TeamMember] : []);
        const linkedTeacher = task.linkedTeacherId ? teachers.find(t => t.id === task.linkedTeacherId) : null;
        const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];

        return (
            <div className="glass-panel" style={{
                marginBottom: '10px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderLeft: `4px solid ${PRIORITY_CONFIG[task.priority].color}`,
                background: task.completed ? 'var(--bg-elevated)' : 'var(--bg-card)',
                opacity: task.completed ? 0.7 : 1
            }}>
                <button
                    onClick={() => toggleTask(task.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: task.completed ? 'var(--success)' : 'var(--border-strong)' }}
                >
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div style={{ flex: 1 }}>
                    <div style={{
                        fontWeight: 600,
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'var(--text-muted)' : 'var(--text-main)',
                        fontSize: '0.95rem'
                    }}>
                        {task.title}
                        {linkedTeacher && (
                            <span style={{
                                marginLeft: '8px',
                                fontSize: '0.75rem',
                                background: 'var(--bg-elevated)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                color: 'var(--text-muted)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <GraduationCap size={12} />
                                {linkedTeacher.name}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {task.dueDate && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isOverdue ? 'var(--danger)' : 'inherit' }}>
                                <Calendar size={12} />
                                {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                        )}

                        {assignees.length > 0 && (
                            <div style={{ display: 'flex', gap: '2px' }}>
                                {assignees.map(a => (
                                    <span key={a} title={ASSIGNEE_CONFIG[a]?.label || 'Unassigned'} style={{
                                        width: '20px', height: '20px', borderRadius: '50%',
                                        background: ASSIGNEE_CONFIG[a]?.bg || 'var(--bg-elevated)',
                                        color: ASSIGNEE_CONFIG[a]?.color || 'var(--text-muted)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.65rem', border: '1px solid currentColor'
                                    }}>
                                        {ASSIGNEE_CONFIG[a]?.emoji?.substring(0, 2) || '?'}
                                    </span>
                                ))}
                            </div>
                        )}

                        {subtasks.length > 0 && (
                            <span>
                                {subtasks.filter(s => s.done).length}/{subtasks.length} subtasks
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(task)}>
                        <Edit3 size={16} />
                    </button>
                    {!task.isDefault && (
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setDeleteConfirmationId(task.id)} style={{ color: 'var(--danger)' }}>
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>
        );
    };


    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <InfoBlock
                    icon={<Clock size={20} />}
                    title="Task Hub"
                    description="Centralized task management for the team."
                    variant="info"
                />
                <button className="btn btn-primary" onClick={openCreate}>
                    <Plus size={18} /> New Task
                </button>
            </div>

            {/* Filter Bar */}
            <div className="glass-card" style={{ padding: '12px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input"
                        placeholder="Search tasks (title, notes, teacher)..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '34px', width: '100%' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={16} className="text-muted" />
                    <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)} style={{ width: 'auto' }}>
                        <option value="all">All Status</option>
                        <option value="incomplete">Incomplete</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} className="text-muted" />
                    <select className="input" value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} style={{ width: 'auto' }}>
                        <option value="all">All Assignees</option>
                        <option value="me">My Tasks</option>
                        <option value="rishabh">Rishabh</option>
                        <option value="tung">Tung</option>
                        <option value="johannes">Johannes</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                    <LayoutGrid size={16} className="text-muted" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Group by:</span>
                    <div className="btn-group">
                        <button className={`btn btn-sm ${groupBy === 'none' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setGroupBy('none')}>None</button>
                        <button className={`btn btn-sm ${groupBy === 'priority' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setGroupBy('priority')}>Priority</button>
                        <button className={`btn btn-sm ${groupBy === 'week' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setGroupBy('week')}>Week</button>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(groupedTasks).map(([group, tasks]) => {
                    if (tasks.length === 0) return null;
                    return (
                        <div key={group}>
                            <h3 style={{
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: 'var(--text-muted)',
                                marginBottom: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {group}
                                <span style={{
                                    background: 'var(--bg-elevated)',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '0.75rem'
                                }}>
                                    {tasks.length}
                                </span>
                            </h3>
                            <div>
                                {tasks.map(task => <TaskCard key={task.id} task={task} />)}
                            </div>
                        </div>
                    );
                })}

                {filteredTasks.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <List size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                        <p>No tasks found matching your filters.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title={isCreating ? "Create New Task" : "Edit Task"}
                size="lg"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSave}>Save Task</button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="label">Title</label>
                        <input
                            className="input"
                            placeholder="Do something amazing..."
                            value={currentTask.title || ''}
                            onChange={e => setCurrentTask({ ...currentTask, title: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="label">Priority</label>
                            <select
                                className="input"
                                value={currentTask.priority || 'medium'}
                                onChange={e => setCurrentTask({ ...currentTask, priority: e.target.value as any })}
                            >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="label">Due Date</label>
                            <input
                                type="date"
                                className="input"
                                value={currentTask.dueDate || ''}
                                onChange={e => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Assignees (Select multiple)</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {(['rishabh', 'tung', 'johannes', 'all'] as TeamMember[]).map(member => {
                                const isSelected = (currentTask.assignees || []).includes(member);
                                return (
                                    <button
                                        key={member}
                                        onClick={() => toggleAssignee(member)}
                                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                                        style={{
                                            borderRadius: '20px',
                                            border: isSelected ? 'none' : '1px solid var(--border-default)'
                                        }}
                                    >
                                        {isSelected && <CheckCircle2 size={14} style={{ marginRight: '4px' }} />}
                                        {ASSIGNEE_CONFIG[member].emoji} {ASSIGNEE_CONFIG[member].label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Linked Teacher (Optional)</label>
                        <select
                            className="input"
                            value={currentTask.linkedTeacherId || ''}
                            onChange={e => setCurrentTask({ ...currentTask, linkedTeacherId: e.target.value ? Number(e.target.value) : undefined })}
                        >
                            <option value="">-- No Teacher Linked --</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.school})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">Related Week</label>
                        <select
                            className="input"
                            value={currentTask.weekId || 1}
                            onChange={e => setCurrentTask({ ...currentTask, weekId: parseInt(e.target.value) })}
                        >
                            {WEEKS.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">Notes</label>
                        <textarea
                            className="textarea"
                            rows={3}
                            placeholder="Additional details..."
                            value={currentTask.notes || ''}
                            onChange={e => setCurrentTask({ ...currentTask, notes: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirmationId}
                onClose={() => setDeleteConfirmationId(null)}
                title="Confirm Deletion"
                size="sm"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setDeleteConfirmationId(null)}>Cancel</button>
                        <button
                            className="btn btn-primary"
                            style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
                            onClick={async () => {
                                if (deleteConfirmationId) {
                                    try {
                                        await deleteTask(deleteConfirmationId);
                                        showToast('Task deleted', 'success');
                                    } catch (e: any) {
                                        showToast(`Failed to delete task: ${e.message || 'Unknown error'}`, 'error');
                                    }
                                    setDeleteConfirmationId(null);
                                }
                            }}
                        >
                            Delete Task
                        </button>
                    </>
                }
            >
                <div style={{ padding: '10px 0', color: 'var(--text-muted)' }}>
                    Are you sure you want to delete this task? This action cannot be undone.
                </div>
            </Modal>
        </div>
    );
};
