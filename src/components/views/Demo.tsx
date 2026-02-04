import { useState, useEffect } from 'react';
import {
    ChevronRight, ChevronLeft,
    ShieldCheck,
    Cpu, CheckCircle2,
    RefreshCw, Zap,
    Calendar, AlertTriangle, AlertCircle, ClipboardCheck,
    Lock, WifiOff, Thermometer, Wind, Info, Activity
} from 'lucide-react';

// Types for the demo steps
type DemoStepId = 'problem' | 'promise' | 'pulse' | 'fingerprint' | 'evaluation' | 'conflict' | 'ask';

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

    // AI Typing effect
    useEffect(() => {
        if (stepId === 'evaluation') {
            let i = 0;
            const timer = setInterval(() => {
                setAiText(fullAiResponse.slice(0, i));
                i++;
                if (i > fullAiResponse.length) clearInterval(timer);
            }, 15);
            return () => clearInterval(timer);
        } else if (stepId !== 'conflict') {
            // We keep AI text visible in 'conflict' step as context, but reset elsewhere
            setAiText('');
        }
    }, [stepId]);

    const steps: DemoStepId[] = ['problem', 'promise', 'pulse', 'fingerprint', 'evaluation', 'conflict', 'ask'];

    const nextStep = () => {
        const currentIndex = steps.indexOf(stepId);
        if (currentIndex < steps.length - 1) {
            const next = steps[currentIndex + 1];
            setStepId(next);
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

    const renderPulse = () => (
        <div className="demo-step pulse-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>The Classroom Pulse</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Live Product Interface - Local Campus Network</p>
                </div>
                <div style={{ background: 'var(--bg-elevated)', padding: '12px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-light)' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981', animation: 'pulse-glow 2s infinite' }} />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em' }}>HUB-01 STREAMING</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="card" style={{ padding: '32px', background: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px', opacity: 0.1 }}><Wind size={80} /></div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>CO2 Concentration</div>
                        <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '8px' }}>842 <span style={{ fontSize: '1.2rem' }}>PPM</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#f59e0b', fontWeight: 800 }}>
                            <AlertCircle size={18} /> Moderate Air Quality
                        </div>
                    </div>
                    <div className="card" style={{ padding: '32px', background: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px', opacity: 0.1 }}><Thermometer size={80} /></div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>Temperature</div>
                        <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '8px' }}>20.4 <span style={{ fontSize: '1.2rem' }}>°C</span></div>
                        <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 800 }}>Optimal Learning Range</div>
                    </div>
                    <div className="card" style={{ padding: '32px', background: 'white', position: 'relative', overflow: 'hidden', gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{ fontWeight: 800 }}>Node Health: Classroom A1</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Uptime: 14d 2h 11m</div>
                        </div>
                        <div style={{ height: '60px', display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
                            {[...Array(40)].map((_, i) => (
                                <div key={i} style={{ flex: 1, background: 'var(--primary)', height: `${30 + Math.random() * 70}%`, borderRadius: '3px', opacity: 0.2 + (i / 40) * 0.8 }} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>System Observations</div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}><Info size={24} /></div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>Pattern Detected</div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>CO2 regularly exceeds 1200ppm between 09:45 and 10:30.</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}><CheckCircle2 size={24} /></div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>Module Ready</div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>BNE Week 2: "The Breathing Classroom" dataset complete.</div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', padding: '24px', background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px' }}>
                            <Lock size={16} /> DATA SOVEREIGNTY
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>Storage: On-Node (4.2GB)</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No data ever leaves the school campus.</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFingerprint = () => (
        <div className="demo-step fingerprint-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '32px' }}>48-Hour Dataset Fingerprint</h2>
            <div style={{ height: '400px', background: 'white', borderRadius: '32px', padding: '48px', border: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.02)' }}>
                <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none" style={{ filter: 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.1))' }}>
                    {[0, 1, 2, 3].map(i => (
                        <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="#f1f5f9" strokeWidth="2" />
                    ))}
                    <path
                        d="M0,250 L100,250 L150,150 L200,80 L250,120 L300,50 L400,250 L500,250 L550,140 L600,70 L650,110 L700,40 L800,250 L1000,250"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                    <path
                        d="M0,250 L100,250 L150,150 L200,80 L250,120 L300,50 L400,250 L500,250 L550,140 L600,70 L650,110 L700,40 L800,250 L1000,250 V300 H0 Z"
                        fill="url(#chartGradientHybrid)"
                        opacity="0.15"
                    />
                    <defs>
                        <linearGradient id="chartGradientHybrid" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" />
                            <stop offset="100%" stopColor="white" />
                        </linearGradient>
                    </defs>
                    <circle cx="300" cy="50" r="8" fill="#ef4444" style={{ animation: 'pulse-marker 2s infinite' }} />
                    <circle cx="700" cy="40" r="8" fill="#ef4444" style={{ animation: 'pulse-marker 2s infinite 1s' }} />
                </svg>

                <div style={{ position: 'absolute', top: '50px', left: '330px', background: '#ef4444', color: 'white', padding: '6px 16px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 900, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                    1,240 PPM SPIKE
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                    <span>MONDAY 07:00</span>
                    <span>MONDAY 14:00</span>
                    <span>TUESDAY 07:00</span>
                    <span>TUESDAY 14:00</span>
                </div>
            </div>

            <div style={{ marginTop: '48px', textAlign: 'center' }}>
                <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    "Every classroom has a unique fingerprint. Students analyze their own behavior, not just abstract theory."
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--primary)' }} /> CO2 Level (PPM)
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEvaluation = () => (
        <div className="demo-step evaluation-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '48px', maxWidth: '800px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '48px', background: 'white', borderLeft: '8px solid var(--primary)', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', color: 'var(--primary)' }}>
                        <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '16px', color: 'white' }}>
                            <Cpu size={32} />
                        </div>
                        <h3 style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0, letterSpacing: '-0.02em' }}>THE BUILT-IN TUTOR</h3>
                    </div>

                    <div style={{ minHeight: '160px', fontSize: '1.4rem', color: '#1e293b', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '40px', fontWeight: 500 }}>
                        {aiText}
                        <span className="cursor" style={{ display: 'inline-block', width: '3px', height: '1.4rem', background: 'var(--primary)', marginLeft: '6px' }} />
                    </div>

                    <div style={{ padding: '24px', background: 'var(--bg-elevated)', borderRadius: '20px', fontSize: '1rem', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                            <Activity size={18} /> Pedagogical Value
                        </div>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            This turns raw data into **Systemic Thinking**. Students stop seeing just "numbers" and start debating interconnected trade-offs.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderConflict = () => (
        <div className="demo-step magic-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#9a3412', marginBottom: '16px' }}>The Target Conflict</h2>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Health (CO2) vs. Energy (Heating) vs. Comfort (Temp)
                </p>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '48px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '32px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontWeight: 900, fontSize: '1.1rem' }}>
                            <span style={{ color: 'var(--text-primary)' }}>WINDOW STATUS</span>
                            <span style={{ color: '#f97316', fontSize: '1.5rem' }}>{windowOpen}% OPEN</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={windowOpen}
                            onChange={(e) => setWindowOpen(parseInt(e.target.value))}
                            style={{ width: '100%', height: '24px', accentColor: '#f97316', cursor: 'pointer', marginBottom: '64px' }}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            <div style={{ textAlign: 'center', padding: '24px', background: 'white', borderRadius: '20px', border: currentCO2 > 1000 ? '3px solid #fecaca' : '3px solid #d1fae5', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Health (CO2)</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: currentCO2 > 1000 ? '#ef4444' : '#10b981' }}>{currentCO2} <span style={{ fontSize: '0.9rem' }}>PPM</span></div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '24px', background: 'white', borderRadius: '20px', border: currentTemp < 19 ? '3px solid #fecaca' : '3px solid #f1f5f9', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Temp</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: currentTemp < 19 ? '#ef4444' : 'var(--text-primary)' }}>{currentTemp.toFixed(1)} <span style={{ fontSize: '0.9rem' }}>°C</span></div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '24px', background: 'white', borderRadius: '20px', border: windowOpen > 40 ? '3px solid #fecaca' : '3px solid #f1f5f9', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Heat Cost</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: windowOpen > 40 ? '#ef4444' : 'var(--text-primary)' }}>+{heatLoss}%</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 800, color: '#9a3412', background: 'rgba(249, 115, 22, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                        "There is no 'correct' answer. Students negotiate the best outcome for the climate."
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
                    <div style={{ background: 'var(--primary)', padding: '48px', borderRadius: '32px', color: 'white', marginBottom: '32px', boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3)' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, opacity: 0.9, marginBottom: '8px', letterSpacing: '0.05em' }}>UNIT PRICE:</div>
                        <div style={{ fontSize: '5.5rem', fontWeight: 900 }}>€799</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.2rem', fontWeight: 800, marginTop: '20px' }}>
                            <CheckCircle2 size={28} /> UNDER GWG LIMIT
                        </div>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 800, fontSize: '1.2rem' }}>
                            <div style={{ color: 'var(--primary)' }}><ShieldCheck size={28} /></div>
                            No municipal tender required.
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 800, fontSize: '1.2rem' }}>
                            <div style={{ color: 'var(--primary)' }}><ClipboardCheck size={28} /></div>
                            Complete 6-week module included.
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 800, fontSize: '1.2rem' }}>
                            <div style={{ color: 'var(--primary)' }}><Lock size={28} /></div>
                            100% DSGVO compliant (Local only).
                        </li>
                    </ul>
                </div>

                <div className="glass-card" style={{ padding: '48px', textAlign: 'left', borderRadius: '32px' }}>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.02em' }}>Help us validate this.</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.5 }}>
                        Would you be willing to give us honest feedback on a 4-week trial?
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                            "Trial this in my classroom next half-term",
                            "Recommend to my MINT department head",
                            "Present this at our next BNE teacher meeting",
                            "I have specific questions on the hardware"
                        ].map((item, i) => (
                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', background: 'var(--bg-elevated)', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border-light)' }} className="validation-item">
                                <input type="checkbox" style={{ width: '28px', height: '28px', accentColor: 'var(--primary)' }} />
                                <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>{item}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="demo-view" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
            {/* Nav Progress */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
                {steps.map((id, index) => (
                    <div
                        key={id}
                        style={{
                            flex: 1,
                            height: '8px',
                            borderRadius: '4px',
                            background: steps.indexOf(stepId) >= index ? 'var(--primary)' : 'var(--border-light)',
                            opacity: stepId === id ? 1 : steps.indexOf(stepId) > index ? 0.6 : 1,
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    />
                ))}
            </div>

            {/* Projector Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isTimerRunning ? '#ef4444' : 'var(--text-muted)', animation: isTimerRunning ? 'pulse 2s infinite' : 'none' }} />
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: isTimerRunning ? '#ef4444' : 'var(--text-muted)', letterSpacing: '0.05em' }}>
                        {isTimerRunning ? 'LIVE DEMO RUNNING' : 'DEMO IDLE'}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>PRESENTATION ELAPSED TIME</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{formatTime(elapsedTime)}</div>
                    </div>
                </div>
            </div>

            <div className="demo-stage" style={{ minHeight: '750px', background: 'var(--bg-card)', padding: '64px', borderRadius: '40px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-2xl)', position: 'relative' }}>
                {stepId === 'problem' && renderProblem()}
                {stepId === 'promise' && renderPromise()}
                {stepId === 'pulse' && renderPulse()}
                {stepId === 'fingerprint' && renderFingerprint()}
                {stepId === 'evaluation' && renderEvaluation()}
                {stepId === 'conflict' && renderConflict()}
                {stepId === 'ask' && renderAsk()}

                <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, opacity: 0.4 }}>
                    {stepId === 'ask' ? 'MAKE EYE CONTACT & WAIT' : 'PRESS [→] OR [←] TO NAVIGATE'}
                </div>
            </div>

            <div className="demo-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '48px' }}>
                <button
                    className="btn btn-ghost"
                    onClick={prevStep}
                    disabled={stepId === 'problem'}
                    style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '1.1rem', fontWeight: 800 }}
                >
                    <ChevronLeft size={24} /> <span>BACK</span>
                </button>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.1em' }}>
                        {stepId.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                        {steps.indexOf(stepId) + 1} / {steps.length}
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={nextStep}
                    disabled={stepId === 'ask'}
                    style={{ padding: '16px 56px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '1.25rem', fontWeight: 900, boxShadow: '0 12px 20px -5px rgba(59, 130, 246, 0.4)' }}
                >
                    <span>{stepId === 'ask' ? 'FINISH' : 'NEXT'}</span>
                    <ChevronRight size={28} />
                </button>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.97); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes pulse-glow {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                @keyframes pulse-marker {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.3; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
                }
                .card {
                    border: 1px solid var(--border-light);
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
                }
                .animate-spin {
                    animation: spin 3s linear infinite;
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
                .validation-item:hover {
                    border-color: var(--primary) !important;
                    background: var(--bg-card) !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
};
