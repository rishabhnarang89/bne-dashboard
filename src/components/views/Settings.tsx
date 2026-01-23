import React, { useState, useRef } from 'react';
import { useValidationData } from '../../hooks/useValidationData';
import { Settings as SettingsIcon, Download, Upload, Trash2, Moon, Sun, Target, AlertTriangle } from 'lucide-react';
import { useToast, InfoBlock, Modal } from '../ui';

export const Settings = () => {
    const {
        goals, updateGoals, darkMode, setDarkMode,
        exportData, exportInterviewsCSV, importData, clearData
    } = useValidationData();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showClearModal, setShowClearModal] = useState(false);
    const [localGoals, setLocalGoals] = useState(goals);

    const handleSaveGoals = () => {
        updateGoals(localGoals);
        showToast('Goals updated successfully!', 'success');
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            importData(file);
            showToast('Data imported!', 'success');
        }
    };

    const handleClear = () => {
        clearData();
        showToast('All data cleared', 'info');
        setShowClearModal(false);
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <InfoBlock icon={<SettingsIcon size={20} />} title="Settings" description="Customize your validation goals, appearance, and manage your data." variant="info" />

            {/* Appearance */}
            <div className="glass-card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Appearance</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontWeight: 500 }}>Dark Mode</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Switch between light and dark themes</div>
                    </div>
                    <button className={`btn ${darkMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setDarkMode(!darkMode)}>
                        {darkMode ? <><Moon size={16} /> Dark</> : <><Sun size={16} /> Light</>}
                    </button>
                </div>
            </div>

            {/* Goals */}
            <div className="glass-card" style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={18} color="var(--primary)" /> Validation Goals
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                    <div className="form-group">
                        <label className="label">Target Interviews</label>
                        <input type="number" className="input" value={localGoals.targetInterviews} onChange={e => setLocalGoals({ ...localGoals, targetInterviews: parseInt(e.target.value) || 10 })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="label">High Scores Needed (≥8)</label>
                            <input type="number" className="input" value={localGoals.targetHighScores} onChange={e => setLocalGoals({ ...localGoals, targetHighScores: parseInt(e.target.value) || 5 })} />
                        </div>
                        <div className="form-group">
                            <label className="label">Pilots Needed</label>
                            <input type="number" className="input" value={localGoals.targetPilots} onChange={e => setLocalGoals({ ...localGoals, targetPilots: parseInt(e.target.value) || 3 })} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="label">Max Setup Time (seconds)</label>
                            <input type="number" className="input" value={localGoals.targetSetupTime} onChange={e => setLocalGoals({ ...localGoals, targetSetupTime: parseInt(e.target.value) || 180 })} />
                        </div>
                        <div className="form-group">
                            <label className="label">Price Point (€)</label>
                            <input type="number" className="input" value={localGoals.pricePoint} onChange={e => setLocalGoals({ ...localGoals, pricePoint: parseInt(e.target.value) || 180 })} />
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleSaveGoals}>Save Goals</button>
                </div>
            </div>

            {/* Data Management */}
            <div className="glass-card" style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '16px' }}>Data Management</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-secondary" onClick={exportData}><Download size={16} /> Export JSON</button>
                        <button className="btn btn-secondary" onClick={exportInterviewsCSV}><Download size={16} /> Export CSV</button>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}><Upload size={16} /> Import Data</button>
                        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '8px 0' }} />
                    <button className="btn btn-danger" onClick={() => setShowClearModal(true)}><Trash2 size={16} /> Clear All Data</button>
                </div>
            </div>

            <Modal isOpen={showClearModal} onClose={() => setShowClearModal(false)} title="Clear All Data?" footer={<><button className="btn btn-secondary" onClick={() => setShowClearModal(false)}>Cancel</button><button className="btn btn-danger" onClick={handleClear}>Clear Everything</button></>}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <AlertTriangle size={24} color="var(--danger)" />
                    <p>This will permanently delete all interviews, tasks, and reflections. This cannot be undone.</p>
                </div>
            </Modal>
        </div>
    );
};
