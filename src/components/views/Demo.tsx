import { useState, useEffect } from 'react';
import {
    Network, ChevronRight, ChevronLeft,
    ShieldCheck, GraduationCap,
    Thermometer, Droplets, Wind,
    Cpu, CheckCircle2, AlertTriangle,
    Building2, Leaf
} from 'lucide-react';
import { clsx } from 'clsx';

type Phase = 'promise' | 'bridge' | 'expansion';

export const Demo = () => {
    const [phase, setPhase] = useState<Phase>('promise');
    const [step, setStep] = useState(0);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextStep();
            if (e.key === 'ArrowLeft') prevStep();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase, step]);

    const nextStep = () => {
        if (phase === 'promise') {
            if (step < 2) setStep(step + 1);
            else { setPhase('bridge'); setStep(0); }
        } else if (phase === 'bridge') {
            if (step < 3) setStep(step + 1);
            else { setPhase('expansion'); setStep(0); }
        } else if (phase === 'expansion') {
            if (step < 2) setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (phase === 'promise') {
            if (step > 0) setStep(step - 1);
        } else if (phase === 'bridge') {
            if (step > 0) setStep(step - 1);
            else { setPhase('promise'); setStep(2); }
        } else if (phase === 'expansion') {
            if (step > 0) setStep(step - 1);
            else { setPhase('bridge'); setStep(3); }
        }
    };

    const renderPhaseHeader = () => (
        <div className="demo-header" style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {[
                { id: 'promise', label: '1. Administrative Shield', icon: ShieldCheck },
                { id: 'bridge', label: '2. Curriculum Bridge', icon: GraduationCap },
                { id: 'expansion', label: '3. Strategic Expansion', icon: Network }
            ].map((p) => (
                <button
                    key={p.id}
                    className={clsx("demo-phase-btn", phase === p.id && "active")}
                    onClick={() => { setPhase(p.id as Phase); setStep(0); }}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        background: phase === p.id ? 'var(--primary-light)' : 'var(--bg-elevated)',
                        color: phase === p.id ? 'white' : 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <p.icon size={18} />
                    <span>{p.label}</span>
                </button>
            ))}
        </div>
    );

    const renderPromise = () => {
        const messages = [
            {
                title: "The '2-Minute Promise'",
                desc: "Place the box. Press power. Data flows immediately.",
                meta: "Zero IT friction."
            },
            {
                title: "Offline-First BNE Station",
                desc: "No WiFi. No Passwords. No Accounts. No Parental Consent.",
                meta: "Works in basements & school gardens."
            },
            {
                title: "GDPR Shield",
                desc: "No personal data leaves the device. No cloud risks.",
                meta: "No DPIA (DSGVO-Folgenabschätzung) needed."
            }
        ];

        return (
            <div className="promise-phase" style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '320px', height: '400px', margin: '0 auto 32px', background: '#f8fafc', borderRadius: '12px', border: '8px solid #334155', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    {/* E-Ink Display Simulation */}
                    <div style={{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', color: '#1e293b', fontFamily: 'monospace' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '2px solid #334155', paddingBottom: '8px' }}>
                            <span style={{ fontWeight: 800 }}>LIVE DATA</span>
                            <span>LORA: OK</span>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <Wind size={40} />
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>CO2 LEVEL</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>482 <span style={{ fontSize: '1rem' }}>PPM</span></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <Thermometer size={40} />
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>TEMP</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>21.4 <span style={{ fontSize: '1rem' }}>°C</span></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <Droplets size={40} />
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>HUMIDITY</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>42.8 <span style={{ fontSize: '1rem' }}>%</span></div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #cbd5e1', fontSize: '0.75rem' }}>
                            OFFLINE MODE: NO INTERNET CONNECTED
                        </div>
                    </div>

                    {/* Yellow Box Frame Partials */}
                    <div style={{ position: 'absolute', top: '-12px', left: '-12px', width: '24px', height: '24px', background: '#fbbf24', borderRadius: '4px' }} />
                    <div style={{ position: 'absolute', top: '-12px', right: '-12px', width: '24px', height: '24px', background: '#fbbf24', borderRadius: '4px' }} />
                    <div style={{ position: 'absolute', bottom: '-12px', left: '-12px', width: '24px', height: '24px', background: '#fbbf24', borderRadius: '4px' }} />
                    <div style={{ position: 'absolute', bottom: '-12px', right: '-12px', width: '24px', height: '24px', background: '#fbbf24', borderRadius: '4px' }} />
                </div>

                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px', color: 'var(--primary)' }}>
                    {messages[step].title}
                </h2>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '8px', maxWidth: '600px', margin: '0 auto 16px' }}>
                    {messages[step].desc}
                </p>
                <div style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--primary-light)', color: 'white', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
                    {messages[step].meta}
                </div>
            </div>
        );
    };

    const renderBridge = () => {
        const weeks = [
            { week: "Week 1", title: "Monitoring", desc: "Log CO2 & climate in the classroom for 48 hours." },
            { week: "Week 2", title: "AI Analysis", desc: "Ask the Offline-AI: 'Why did the CO2 spike at 10 AM?'" },
            { week: "Week 3", title: "The Conflict", desc: "Heating cost vs. Air quality. A systemic goal conflict." },
            { week: "Week 4-6", title: "Shaping", desc: "Develop the school's own ventilation concept." }
        ];

        return (
            <div className="bridge-phase">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '48px' }}>
                    {weeks.map((w, i) => (
                        <div
                            key={w.week}
                            style={{
                                padding: '24px',
                                background: step === i ? 'var(--bg-elevated)' : 'transparent',
                                border: step === i ? '2px solid var(--primary)' : '2px solid var(--border-light)',
                                borderRadius: '16px',
                                transition: 'all 0.3s',
                                opacity: step >= i ? 1 : 0.4,
                                transform: step === i ? 'scale(1.05)' : 'scale(1)'
                            }}
                        >
                            <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>{w.week}</div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>{w.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{w.desc}</p>
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="glass-card" style={{ padding: '24px', background: 'white', borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <Cpu size={32} color="var(--primary)" />
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>OFFLINE AI TUTOR RESPONSE:</div>
                                <div style={{ fontStyle: 'italic', fontSize: '1.1rem', color: '#1e293b' }}>
                                    "I noticed the CO2 reached 1200ppm at 10:15. This correlates with your Physics class. With 28 people breathing, oxygen drops fast. Try opening windows for 3 mins—but calculate: how much heat energy will you lose?"
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ textAlign: 'center', padding: '32px', background: '#fff7ed', borderRadius: '16px', border: '2px dashed #f97316' }}>
                        <AlertTriangle size={48} color="#f97316" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#9a3412', marginBottom: '12px' }}>Systemic Target Conflict</h3>
                        <p style={{ fontSize: '1.1rem', color: '#c2410c', maxWidth: '600px', margin: '0 auto' }}>
                            This moves the lesson from thermodynamics to <strong>Gestaltungskompetenz</strong>. Students must balance health (CO2) with resources (Heat costs).
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const renderExpansion = () => {
        return (
            <div className="expansion-phase" style={{ textAlign: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center' }}>
                    <div>
                        <div style={{ background: 'var(--primary-light)', padding: '40px', borderRadius: '24px', color: 'white', marginBottom: '24px' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9, marginBottom: '8px' }}>SINGLE UNIT PRICE</div>
                            <div style={{ fontSize: '4.5rem', fontWeight: 900 }}>€799</div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9 }}>NETTO</div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 700 }}>
                            <CheckCircle2 size={24} />
                            <span>Geringwertiges Wirtschaftsgut (GWG)</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                            Buy directly with department funds. No tender required.
                        </p>
                    </div>

                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>Whole School Approach</h3>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', opacity: step >= 0 ? 1 : 0.3 }}>
                            <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '12px', color: '#1d4ed8' }}><Wind size={24} /></div>
                            <div>
                                <div style={{ fontWeight: 700 }}>Phase 1: Physics Dept</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Air Quality & Health Module</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', opacity: step >= 1 ? 1 : 0.3 }}>
                            <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '12px', color: '#047857' }}><Leaf size={24} /></div>
                            <div>
                                <div style={{ fontWeight: 700 }}>Phase 2: Biology Dept</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Automated School Garden & Soil</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', opacity: step >= 2 ? 1 : 0.3 }}>
                            <div style={{ padding: '12px', background: '#fff7ed', borderRadius: '12px', color: '#c2410c' }}><Building2 size={24} /></div>
                            <div>
                                <div style={{ fontWeight: 700 }}>Phase 3: Facility Mgt</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Energy Efficiency Monitoring</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '32px', padding: '20px', background: 'var(--bg-elevated)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>
                                <Network size={18} /> LO RA WAN Mesh Net
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Units connect automatically. You build infrastructure, invoice by invoice, bypassing bureaucracy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="demo-view" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 0' }}>
            {renderPhaseHeader()}

            <div style={{ minHeight: '550px', background: 'var(--bg-card)', padding: '48px', borderRadius: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}>
                {phase === 'promise' && renderPromise()}
                {phase === 'bridge' && renderBridge()}
                {phase === 'expansion' && renderExpansion()}
            </div>

            <div className="demo-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
                <button
                    className="btn btn-ghost"
                    onClick={prevStep}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                >
                    <ChevronLeft size={20} /> Back (←)
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Progress Dots */}
                    {Array.from({ length: phase === 'bridge' ? 4 : 3 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: '10px', height: '10px', borderRadius: '50%',
                                background: i === step ? 'var(--primary)' : 'var(--border-light)',
                                transition: 'all 0.3s'
                            }}
                        />
                    ))}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={nextStep}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1.1rem' }}
                >
                    <span>{(phase === 'expansion' && step === 2) ? 'Finish Demo' : 'Next (→)'}</span>
                    <ChevronRight size={20} />
                </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Tip: You can use the arrow keys to navigate during the interview.
            </div>
        </div>
    );
};
