import { useState, useRef } from 'react';
import { useValidationData, SPRINT_START, SPRINT_END, WEEKS } from '../../hooks/useValidationData';
import type { GoalSettings } from '../../hooks/useValidationData';
import {
    Target, Palette, Database, Info,
    Download, Upload, Trash2, FileSpreadsheet,
    Sun, Moon, Save, AlertTriangle, Cloud, CloudOff,
    Users, MessageSquare, CheckSquare, BookOpen
} from 'lucide-react';
import { useToast, Modal } from '../ui';

export const Settings = () => {
    const {
        goals, updateGoals,
        darkMode, setDarkMode,
        exportData, exportInterviewsCSV, importData, clearData,
        teachers, interviews: _unused, tasks, completedInterviews,
        isOnline, syncError
    } = useValidationData();

    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [goalDraft, setGoalDraft] = useState<GoalSettings>({ ...goals });
    const [goalsDirty, setGoalsDirty] = useState(false);

    const updateGoalField = (field: keyof GoalSettings, value: number) => {
        setGoalDraft(prev => ({ ...prev, [field]: value }));
        setGoalsDirty(true);
    };

    const saveGoals = async () => {
        await updateGoals(goalDraft);
        setGoalsDirty(false);
        showToast('Goals updated successfully', 'success');
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await importData(file);
            showToast('Data imported successfully', 'success');
        } catch {
            showToast('Import failed', 'error');
        }
        e.target.value = '';
    };

    const handleClearData = () => {
        clearData();
        setClearConfirmOpen(false);
        showToast('All data cleared', 'info');
    };

    // Section styles
    const sectionStyle: React.CSSProperties = {
        marginBottom: '24px'
    };
    const sectionHeaderStyle: React.CSSProperties = {
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '16px', paddingBottom: '12px',
        borderBottom: '1px solid var(--border-light)'
    };
    const gridStyle: React.CSSProperties = {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

            {/* ============================================================ */}
            {/* SECTION 1: VALIDATION GOALS */}
            {/* ============================================================ */}
            <div className="glass-card" style={sectionStyle}>
                <div style={sectionHeaderStyle}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'var(--primary-light-bg)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Target size={18} color="var(--primary)" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Validation Goals</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            These thresholds drive the Go/No-Go Decision Matrix
                        </p>
                    </div>
                    {goalsDirty && (
                        <button
                            className="btn btn-primary"
                            onClick={saveGoals}
                            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Save size={14} /> Save Changes
                        </button>
                    )}
                </div>

                <div style={gridStyle}>
                    <GoalInput
                        label="Target Interviews"
                        emoji="🎯"
                        value={goalDraft.targetInterviews}
                        onChange={v => updateGoalField('targetInterviews', v)}
                        min={1} max={50}
                        hint="Total interviews needed for a reliable decision"
                    />
                    <GoalInput
                        label="High Score Target"
                        emoji="⭐"
                        value={goalDraft.targetHighScores}
                        onChange={v => updateGoalField('targetHighScores', v)}
                        min={1} max={30}
                        hint="Interviews scoring ≥ 8/10"
                    />
                    <GoalInput
                        label="Pilot Commits"
                        emoji="🚀"
                        value={goalDraft.targetPilots}
                        onChange={v => updateGoalField('targetPilots', v)}
                        min={1} max={20}
                        hint="Teachers committing to a pilot"
                    />
                    <GoalInput
                        label="Max Setup Time"
                        emoji="⏱️"
                        value={goalDraft.targetSetupTime}
                        onChange={v => updateGoalField('targetSetupTime', v)}
                        min={30} max={600} step={10}
                        suffix="s"
                        hint="Acceptable product setup duration"
                    />
                    <GoalInput
                        label="Price Point"
                        emoji="💰"
                        value={goalDraft.pricePoint}
                        onChange={v => updateGoalField('pricePoint', v)}
                        min={0} max={1000} step={10}
                        prefix="€"
                        hint="Product price tested in interviews"
                    />
                </div>
            </div>

            {/* ============================================================ */}
            {/* SECTION 2: APPEARANCE */}
            {/* ============================================================ */}
            <div className="glass-card" style={sectionStyle}>
                <div style={sectionHeaderStyle}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'var(--primary-light-bg)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Palette size={18} color="var(--primary)" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Appearance</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Customize how the dashboard looks
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {darkMode ? <Moon size={20} color="var(--primary)" /> : <Sun size={20} color="#f59e0b" />}
                        <div>
                            <div style={{ fontWeight: 600 }}>{darkMode ? 'Dark Mode' : 'Light Mode'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {darkMode ? 'Easy on the eyes in low light' : 'Bright and clean interface'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        style={{
                            width: '52px', height: '28px', borderRadius: '14px',
                            background: darkMode ? 'var(--primary)' : 'var(--border-default)',
                            border: 'none', cursor: 'pointer', position: 'relative',
                            transition: 'background 0.2s ease'
                        }}
                    >
                        <div style={{
                            width: '22px', height: '22px', borderRadius: '50%',
                            background: 'white', position: 'absolute', top: '3px',
                            left: darkMode ? '27px' : '3px',
                            transition: 'left 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                    </button>
                </div>
            </div>

            {/* ============================================================ */}
            {/* SECTION 3: DATA MANAGEMENT */}
            {/* ============================================================ */}
            <div className="glass-card" style={sectionStyle}>
                <div style={sectionHeaderStyle}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'var(--primary-light-bg)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Database size={18} color="var(--primary)" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Data Management</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Export, import, or reset your dashboard data
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <DataAction
                        icon={<Download size={18} />}
                        label="Export Full Backup (JSON)"
                        description="Download all tasks, teachers, interviews, and goals"
                        buttonLabel="Export"
                        onClick={() => { exportData(); showToast('Backup downloaded', 'success'); }}
                        color="var(--primary)"
                    />
                    <DataAction
                        icon={<FileSpreadsheet size={18} />}
                        label="Export Interviews (CSV)"
                        description="Spreadsheet-compatible export of interview data"
                        buttonLabel="Export CSV"
                        onClick={() => { exportInterviewsCSV(); showToast('CSV downloaded', 'success'); }}
                        color="#10b981"
                    />
                    <DataAction
                        icon={<Upload size={18} />}
                        label="Import Data"
                        description="Restore from a previously exported JSON backup"
                        buttonLabel="Choose File"
                        onClick={() => fileInputRef.current?.click()}
                        color="#8b5cf6"
                    />
                    <DataAction
                        icon={<Trash2 size={18} />}
                        label="Clear All Data"
                        description="Reset everything to default — this cannot be undone"
                        buttonLabel="Clear Data"
                        onClick={() => setClearConfirmOpen(true)}
                        color="var(--danger)"
                        danger
                    />
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    style={{ display: 'none' }}
                />
            </div>

            {/* ============================================================ */}
            {/* SECTION 4: ABOUT */}
            {/* ============================================================ */}
            <div className="glass-card" style={sectionStyle}>
                <div style={sectionHeaderStyle}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'var(--primary-light-bg)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Info size={18} color="var(--primary)" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>About</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Dashboard info and quick stats
                        </p>
                    </div>
                </div>

                <div style={gridStyle}>
                    <StatBox icon={<Users size={16} />} label="Teachers" value={teachers.length} color="#3b82f6" />
                    <StatBox icon={<MessageSquare size={16} />} label="Interviews" value={completedInterviews.length} color="#10b981" />
                    <StatBox icon={<CheckSquare size={16} />} label="Tasks" value={tasks.length} color="#8b5cf6" />
                    <StatBox icon={<BookOpen size={16} />} label="Weeks" value={WEEKS.length} color="#f59e0b" />
                </div>

                <div style={{
                    marginTop: '16px', padding: '12px',
                    background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                    display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Version</span>
                        <span style={{ fontWeight: 600 }}>v2.1</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Sprint Period</span>
                        <span style={{ fontWeight: 600 }}>
                            {SPRINT_START.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {SPRINT_END.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Cloud Sync</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            {isOnline ? (
                                <><Cloud size={14} color="#10b981" /> Connected</>
                            ) : (
                                <><CloudOff size={14} color="var(--text-muted)" /> Local Only</>
                            )}
                        </span>
                    </div>
                    {syncError && (
                        <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>
                            ⚠️ Sync error: {syncError}
                        </div>
                    )}
                </div>
            </div>

            {/* Clear Data Confirmation Modal */}
            <Modal isOpen={clearConfirmOpen} onClose={() => setClearConfirmOpen(false)} title="⚠️ Clear All Data?">
                <div style={{ padding: '8px 0' }}>
                    <div style={{
                        padding: '16px', background: 'var(--danger-light)', borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--danger)', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start'
                    }}>
                        <AlertTriangle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.9rem', color: 'var(--danger)' }}>
                            This will permanently delete all teachers, interviews, tasks, and goals. This action cannot be undone.
                            <strong style={{ display: 'block', marginTop: '8px' }}>
                                Make sure to export a backup first!
                            </strong>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost" onClick={() => setClearConfirmOpen(false)}>
                            Cancel
                        </button>
                        <button
                            className="btn"
                            onClick={handleClearData}
                            style={{ background: 'var(--danger)', color: 'white' }}
                        >
                            <Trash2 size={14} /> Yes, Clear Everything
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

const GoalInput = ({
    label, emoji, value, onChange, min, max, step = 1, prefix, suffix, hint
}: {
    label: string; emoji: string; value: number;
    onChange: (v: number) => void;
    min: number; max: number; step?: number;
    prefix?: string; suffix?: string; hint: string;
}) => (
    <div style={{
        padding: '16px', background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            {prefix && <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{prefix}</span>}
            <input
                className="input"
                type="number"
                value={value}
                onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
                min={min} max={max} step={step}
                style={{ fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}
            />
            {suffix && <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{suffix}</span>}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</div>
    </div>
);

const DataAction = ({
    icon, label, description, buttonLabel, onClick, color, danger = false
}: {
    icon: React.ReactNode; label: string; description: string;
    buttonLabel: string; onClick: () => void; color: string; danger?: boolean;
}) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '16px', background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)'
    }}>
        <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: danger ? 'var(--danger-light)' : `${color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color, flexShrink: 0
        }}>
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{description}</div>
        </div>
        <button
            className={`btn ${danger ? '' : 'btn-ghost'}`}
            onClick={onClick}
            style={danger ? {
                background: 'transparent', color: 'var(--danger)',
                border: '1px solid var(--danger)', fontWeight: 600
            } : { color, fontWeight: 600 }}
        >
            {buttonLabel}
        </button>
    </div>
);

const StatBox = ({
    icon, label, value, color
}: {
    icon: React.ReactNode; label: string; value: number; color: string;
}) => (
    <div style={{
        padding: '16px', background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)',
        textAlign: 'center'
    }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color }}>{icon}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
    </div>
);
