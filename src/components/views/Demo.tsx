import { useState, useEffect } from 'react';
import {
    ChevronRight, ChevronLeft,
    ShieldCheck,
    Cpu, CheckCircle2,
    RefreshCw, Zap, Settings,
    Calendar, AlertTriangle, ClipboardCheck,
    Lock, WifiOff
} from 'lucide-react';

// Types for the demo steps
type DemoStepId = 'problem' | 'promise' | 'magic' | 'ask';

export const Demo = () => {
    const [stepId, setStepId] = useState<DemoStepId>('problem');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'searching' | 'connecting' | 'connected'>('idle');
    const [windowOpen, setWindowOpen] = useState(0); // 0 to 100
    const [aiText, setAiText] = useState('');

    const fullAiResponse = "CO2 spike at 10:15 AM (1,240 ppm) matches your Physics class. Ventilation clears it in 4 minutes but drops temperature 6°C—forcing heating to work 30% harder. This is the Zielkonflikt your students must solve.";

    // Global Elapsed Timer
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isTimerRunning) {
            timer = setInterval(() => setElapsedTime(t => t + 1), 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isTimerRunning]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextStep();
            if (e.key === 'ArrowLeft') prevStep();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [stepId]);

    // AI Typing effect (faster at 12ms)
    useEffect(() => {
        if (stepId === 'magic') {
            let i = 0;
            const timer = setInterval(() => {
                setAiText(fullAiResponse.slice(0, i));
                i++;
                if (i > fullAiResponse.length) clearInterval(timer);
            }, 12);
            return () => clearInterval(timer);
        } else {
            setAiText('');
        }
    }, [stepId]);

    const steps: DemoStepId[] = ['problem', 'promise', 'magic', 'ask'];

    const nextStep = () => {
        const currentIndex = steps.indexOf(stepId);
        if (currentIndex < steps.length - 1) {
            const next = steps[currentIndex + 1];
            setStepId(next);
            // Auto-start timer if moving to "promise"
            if (next === 'promise') setIsTimerRunning(true);
        }
    };

    const prevStep = () => {
        const currentIndex = steps.indexOf(stepId);
        if (currentIndex > 0) {
            setStepId(steps[currentIndex - 1]);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Connection Simulation (Speeded up)
    const startConnection = () => {
        setConnectionStatus('searching');
        setTimeout(() => setConnectionStatus('connecting'), 800);
        setTimeout(() => setConnectionStatus('connected'), 1600);
    };

    const currentCO2 = Math.max(450, 1240 - (windowOpen * 8));
    const currentTemp = Math.max(15, 21.5 - (windowOpen * 0.06));
    const heatLoss = (windowOpen * 1.5).toFixed(1);

    const renderProblem = () => (
        <div className="demo-step problem-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '16px' }}>
                    What if BNE compliance took 2 minutes, not 2 months?
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Offline-first. Zero IT friction. Ready now.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '40px', borderTop: '6px solid #ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#ef4444' }}>
                        <AlertTriangle size={32} />
                        <h3 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>The Bureaucratic Nightmare</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <span style={{ fontWeight: 800, color: 'var(--text-muted)', minWidth: '60px' }}>Day 1:</span>
                            <span>Submit IT ticket for new software.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', opacity: 0.8 }}>
                            <span style={{ fontWeight: 800, color: 'var(--text-muted)', minWidth: '60px' }}>Day 21:</span>
                            <span>"Forwarded to data protection officer."</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', opacity: 0.6 }}>
                            <span style={{ fontWeight: 800, color: 'var(--text-muted)', minWidth: '60px' }}>Day 45:</span>
                            <span>"Please provide DSGVO impact assessment."</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', opacity: 0.4, fontStyle: 'italic' }}>
                            <span style={{ fontWeight: 800, color: 'var(--text-muted)', minWidth: '60px' }}>Day 90:</span>
                            <span>Still waiting...</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '40px', borderTop: '6px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)' }}>
                        <Calendar size={32} />
                        <h3 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>The Compliance Clock</h3>
                    </div>
                    <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-elevated)', borderRadius: '16px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700 }}>BNE AUDIT DEADLINE: MARCH 2025</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ef4444' }}>0 / 4</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>REQUIRED MODULES DOCUMENTED</div>
                    </div>
                    <p style={{ marginTop: '24px', fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Every tool you find needs WiFi credentials you don't have, or patient accounts that require months of parental consent forms.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderPromise = () => (
        <div className="demo-step promise-step" style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '40px' }}>The 2-Minute Promise</h2>

            <div style={{ position: 'relative', width: '600px', height: '350px', margin: '0 auto 40px', background: 'var(--bg-elevated)', borderRadius: '32px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                {connectionStatus === 'idle' && (
                    <div style={{ textAlign: 'center', zIndex: 10 }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', maxWidth: '400px' }}>
                            Ready to prove "Zero IT Friction"? Start the connection flow.
                        </div>
                        <button className="btn btn-primary" onClick={startConnection} style={{ padding: '16px 40px', fontSize: '1.2rem', borderRadius: '16px' }}>
                            <Zap size={24} style={{ marginRight: '12px' }} /> Start Discovery
                        </button>
                    </div>
                )}

                {(connectionStatus === 'searching' || connectionStatus === 'connecting') && (
                    <div style={{ textAlign: 'center' }}>
                        <div className="animate-spin" style={{ marginBottom: '32px' }}>
                            <RefreshCw size={80} color="var(--primary)" />
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                            {connectionStatus === 'searching' ? 'Locating Hub...' : 'Encrypted Handshake...'}
                        </div>
                    </div>
                )}

                {connectionStatus === 'connected' && (
                    <div style={{ textAlign: 'center', animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                        <div style={{ background: '#10b981', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white' }}>
                            <CheckCircle2 size={56} />
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>SYSTEM LIVE</div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '1.1rem' }}>Local Mesh Station Active</div>
                    </div>
                )}

                {/* Seqeuntial Badges */}
                <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    {connectionStatus === 'connected' && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#10b981', animation: 'slideInRight 0.3s ease-out' }}>
                                <WifiOff size={16} /> NO WIFI REQUIRED
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#10b981', animation: 'slideInRight 0.3s ease-out 0.1s both' }}>
                                <Lock size={16} /> NO STUDENT ACCOUNTS
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#10b981', animation: 'slideInRight 0.3s ease-out 0.2s both' }}>
                                <CheckCircle2 size={16} /> NO IT TICKET NEEDED
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                "In less than two minutes, you have a fully functional BNE learning station. No credentials. No Waiting."
            </div>
        </div>
    );

    const renderMagic = () => (
        <div className="demo-step magic-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>The Curriculum Magic</h2>
                <div style={{ background: 'var(--primary-light)', color: 'white', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem' }}>
                    TOPIC: ENERGY VS HEALTH
                </div>
            </div>

            {/* 3-Panel Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Panel 1: 48h Timelapse */}
                    <div className="card" style={{ padding: '24px', background: 'white', height: '240px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>48-HOUR CLASSROOM CO2 FINGERPRINT</div>
                            <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 800 }}>SPIKE: 1,240 PPM</div>
                        </div>
                        <svg width="100%" height="140" viewBox="0 0 1000 140" preserveAspectRatio="none">
                            <path d="M0,120 L100,120 L150,80 L200,40 L250,60 L300,20 L400,120 L500,120 L550,70 L600,30 L650,55 L700,15 L800,120 L1000,120" fill="none" stroke="var(--primary)" strokeWidth="4" />
                            <rect x="290" y="10" width="20" height="20" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1" />
                        </svg>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                            <span>PERIOD 1</span>
                            <span>PERIOD 3 (PHYSICS)</span>
                            <span>PERIOD 5</span>
                            <span>NEXT DAY</span>
                        </div>
                    </div>

                    {/* Panel 2: AI Insight */}
                    <div className="glass-card" style={{ padding: '24px', background: 'white', borderLeft: '6px solid var(--primary)', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--primary)' }}>
                            <Cpu size={24} />
                            <h4 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>THE BUILT-IN TUTOR</h4>
                        </div>
                        <div style={{ fontSize: '1.1rem', color: '#1e293b', lineHeight: 1.5, fontStyle: 'italic', minHeight: '100px' }}>
                            {aiText}
                            <span className="cursor" style={{ display: 'inline-block', width: '2px', height: '1.1rem', background: 'var(--primary)', marginLeft: '4px' }} />
                        </div>
                    </div>
                </div>

                {/* Panel 3: High-Impact Simulator */}
                <div className="card" style={{ padding: '32px', background: '#fff7ed', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <Settings size={24} color="#f97316" />
                        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>TARGET CONFLICT SIMULATOR</h4>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: 800 }}>
                            <span>WINDOW STATUS</span>
                            <span style={{ color: '#f97316', fontSize: '1.25rem' }}>{windowOpen}% OPEN</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={windowOpen}
                            onChange={(e) => setWindowOpen(parseInt(e.target.value))}
                            style={{ width: '100%', height: '16px', accentColor: '#f97316', cursor: 'pointer', marginBottom: '48px' }}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '12px', border: currentCO2 > 1000 ? '2px solid #fecaca' : '2px solid #d1fae5', transition: 'all 0.2s' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Health (CO2)</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: currentCO2 > 1000 ? '#ef4444' : '#10b981' }}>{currentCO2} <span style={{ fontSize: '0.7rem' }}>PPM</span></div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '12px', border: currentTemp < 19 ? '2px solid #fecaca' : '2px solid #f1f5f9', transition: 'all 0.2s' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Temp</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: currentTemp < 19 ? '#ef4444' : 'var(--text-primary)' }}>{currentTemp.toFixed(1)} <span style={{ fontSize: '0.7rem' }}>°C</span></div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '12px', border: windowOpen > 40 ? '2px solid #fecaca' : '2px solid #f1f5f9', transition: 'all 0.2s' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Heat Cost</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: windowOpen > 40 ? '#ef4444' : 'var(--text-primary)' }}>+{heatLoss}%</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#9a3412', background: 'rgba(249, 115, 22, 0.1)', padding: '12px', borderRadius: '12px' }}>
                        Students must negotiate the trade-off.
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAsk = () => (
        <div className="demo-step ask-step" style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '48px' }}>The Ask</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px', maxWidth: '1000px', margin: '0 auto', alignItems: 'start' }}>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ background: 'var(--primary)', padding: '48px', borderRadius: '24px', color: 'white', marginBottom: '32px', boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.2)' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9, marginBottom: '8px' }}>UNIT PRICE:</div>
                        <div style={{ fontSize: '5rem', fontWeight: 900 }}>€799</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 700, marginTop: '16px' }}>
                            <CheckCircle2 size={24} /> UNDER GWG LIMIT
                        </div>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, fontSize: '1.1rem' }}>
                            <div style={{ color: 'var(--primary)' }}><ShieldCheck size={24} /></div>
                            No municipal tender required.
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, fontSize: '1.1rem' }}>
                            <div style={{ color: 'var(--primary)' }}><ClipboardCheck size={24} /></div>
                            Complete 6-week module included.
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, fontSize: '1.1rem' }}>
                            <div style={{ color: 'var(--primary)' }}><Lock size={24} /></div>
                            100% DSGVO compliant (Local only).
                        </li>
                    </ul>
                </div>

                <div className="glass-card" style={{ padding: '48px', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Help us validate this.</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem' }}>
                        Would you be willing to give us honest feedback on a trial?
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            "Trial this in my classroom this semester",
                            "Recommend to my department head",
                            "Connect us with other subject teachers",
                            "I have specific questions first"
                        ].map((item, i) => (
                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'var(--bg-elevated)', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border-light)' }}>
                                <input type="checkbox" style={{ width: '24px', height: '24px', accentColor: 'var(--primary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="demo-view" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
            {/* Projector Header (Hidden if needed) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isTimerRunning ? '#ef4444' : 'var(--text-muted)', animation: isTimerRunning ? 'pulse 2s infinite' : 'none' }} />
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: isTimerRunning ? '#ef4444' : 'var(--text-muted)' }}>
                        {isTimerRunning ? 'LIVE DEMO RUNNING' : 'DEMO IDLE'}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>ELAPSED TIME</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'monospace' }}>{formatTime(elapsedTime)}</div>
                    </div>
                </div>
            </div>

            <div className="demo-stage" style={{ minHeight: '700px', background: 'var(--bg-card)', padding: '60px', borderRadius: '32px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
                {stepId === 'problem' && renderProblem()}
                {stepId === 'promise' && renderPromise()}
                {stepId === 'magic' && renderMagic()}
                {stepId === 'ask' && renderAsk()}

                {/* Subtle Hint */}
                <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                    [DEMO TIP: {stepId === 'ask' ? 'Make eye contact and wait for response' : 'Use arrow keys to navigate'}]
                </div>
            </div>

            <div className="demo-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
                <button
                    className="btn btn-ghost"
                    onClick={prevStep}
                    disabled={stepId === 'problem'}
                    style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem' }}
                >
                    <ChevronLeft size={20} /> <span style={{ opacity: 0.6 }}>PREVIOUS</span>
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {steps.map((id) => (
                        <div
                            key={id}
                            style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                background: stepId === id ? 'var(--primary)' : 'var(--border-light)',
                                transition: 'all 0.3s'
                            }}
                        />
                    ))}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={nextStep}
                    disabled={stepId === 'ask'}
                    style={{ padding: '12px 48px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.2rem', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
                >
                    <span>{stepId === 'ask' ? 'FINISH' : 'NEXT STEP'}</span>
                    <ChevronRight size={24} />
                </button>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.6; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 20px;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
                }
                .card {
                    border: 1px solid var(--border-light);
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }
                .animate-spin {
                    animation: spin 2s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .cursor {
                    animation: blink 1s infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};
