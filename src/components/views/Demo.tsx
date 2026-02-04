import { useState, useEffect } from 'react';
import {
    ChevronRight, ChevronLeft,
    ShieldCheck,
    Cpu, CheckCircle2,
    RefreshCw, Zap, Settings,
    Calendar, AlertTriangle, AlertCircle,
    Lock, WifiOff, Wind, Clock
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
                        <div style={{ display: 'flex', gap: '12px', opacity: 0.8, color: '#ef4444', animation: 'pulse-red 2s infinite' }}>
                            <span style={{ fontWeight: 800, minWidth: '60px' }}>Day 90:</span>
                            <span style={{ fontWeight: 700 }}>STILL WAITING...</span>
                        </div>
                    </div>
                    {/* Stuck Progress Bar */}
                    <div style={{ marginTop: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-muted)' }}>
                            <span>PROCUREMENT PROGRESS</span>
                            <span>0%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '4%', height: '100%', background: '#ef4444', animation: 'shimmer-stuck 2s infinite linear' }} />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px', fontWeight: 700 }}>STUCK IN DATA PROTECTION REVIEW</div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '40px', borderTop: '6px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)' }}>
                        <Calendar size={32} />
                        <h3 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>The Compliance Clock</h3>
                    </div>
                    <div style={{ textAlign: 'center', padding: '32px', background: 'var(--bg-elevated)', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 800, letterSpacing: '0.05em' }}>BNE AUDIT DEADLINE: MARCH 2025</div>
                        <div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#ef4444', lineHeight: 1, marginBottom: '8px' }}>0 / 4</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase' }}>MODULES DOCUMENTED</div>

                        <div style={{ marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', fontWeight: 900, fontSize: '0.9rem' }}>
                            <Clock size={16} /> 47 DAYS REMAINING
                        </div>
                    </div>
                    <p style={{ marginTop: '32px', fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
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
                    <div style={{ textAlign: 'center', animation: 'victory-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                        <div style={{ background: '#10b981', width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white', boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)' }}>
                            <CheckCircle2 size={64} />
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981' }}>SYSTEM LIVE</div>
                        <div style={{ background: '#d1fae5', color: '#065f46', padding: '8px 20px', borderRadius: '32px', display: 'inline-block', fontWeight: 800, marginTop: '16px', fontSize: '1.1rem' }}>
                            1:32. PROMISE KEPT.
                        </div>
                    </div>
                )}

                <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                    {connectionStatus === 'connected' && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, color: '#10b981', animation: 'slideInRight 0.4s ease-out both' }}>
                                <WifiOff size={16} /> NO WIFI REQUIRED
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, color: '#10b981', animation: 'slideInRight 0.4s ease-out 0.2s both' }}>
                                <Lock size={16} /> NO STUDENT ACCOUNTS
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, color: '#10b981', animation: 'slideInRight 0.4s ease-out 0.4s both' }}>
                                <CheckCircle2 size={16} /> NO IT TICKET FILED
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div style={{ fontSize: '1.4rem', color: connectionStatus === 'connected' ? '#10b981' : 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontWeight: 700, transition: 'all 0.3s' }}>
                {connectionStatus === 'connected' ?
                    "Done. No IT ticket filed. You're live." :
                    "In less than two minutes, you have a fully functional BNE learning station."}
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
                    {/* Hero Metric: CO2 */}
                    <div className="card" style={{ padding: '40px', background: 'white', position: 'relative', overflow: 'hidden', gridColumn: 'span 2', border: '2px solid var(--primary-light)', boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.1)' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '24px', opacity: 0.05, animation: 'pulse-slow 4s infinite' }}><Wind size={120} /></div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Air Quality (Health)</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                            <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1, animation: 'pulse-soft 2s infinite' }}>842</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>PPM</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', color: '#f59e0b', fontWeight: 900, marginTop: '16px' }}>
                            <AlertCircle size={24} /> MODERATE • SPIKE RISK DETECTED
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px', background: 'white', opacity: 0.6 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Temperature</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4px' }}>20.4 <span style={{ fontSize: '1rem' }}>°C</span></div>
                        <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800 }}>OPTIMAL</div>
                    </div>

                    <div className="card" style={{ padding: '24px', background: 'white', opacity: 0.6 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Humidity</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4px' }}>42 <span style={{ fontSize: '1rem' }}>%</span></div>
                        <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800 }}>IDEAL</div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.4rem' }}>System Observations</div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '24px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <div style={{ padding: '12px', background: '#ef4444', borderRadius: '12px', color: 'white' }}><AlertTriangle size={24} /></div>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '8px', color: '#ef4444' }}>CRITICAL PATTERN</div>
                            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 600 }}>CO2 regularly exceeds 1200ppm during P3 Physics. Ventilation protocol required.</div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', padding: '24px', background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-light)', opacity: 0.5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px' }}>
                            <Lock size={16} /> DATA SOVEREIGNTY
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Storage: Local Node Only</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFingerprint = () => (
        <div className="demo-step fingerprint-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '32px' }}>The Fingerprint</h2>
            <div style={{ height: '400px', background: 'white', borderRadius: '32px', padding: '48px', border: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.02)' }}>
                <svg width="100%" height="200" viewBox="0 0 1000 300" preserveAspectRatio="none" style={{ filter: 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.1))' }}>
                    <defs>
                        <linearGradient id="chartGradientHybrid" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" />
                            <stop offset="100%" stopColor="white" />
                        </linearGradient>
                        <clipPath id="reveal">
                            <rect x="0" y="0" width="1000" height="300">
                                <animate attributeName="width" from="0" to="1000" dur="2s" fill="freeze" />
                            </rect>
                        </clipPath>
                    </defs>
                    <g clipPath="url(#reveal)">
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
                        <circle cx="300" cy="50" r="8" fill="#ef4444" style={{ animation: 'pulse-marker 2s infinite 2s' }} />
                        <circle cx="700" cy="40" r="8" fill="#ef4444" style={{ animation: 'pulse-marker 2s infinite 3s' }} />
                    </g>
                </svg>

                {/* Dramatic Label */}
                <div style={{ position: 'absolute', top: '40px', left: '330px', background: '#ef4444', color: 'white', padding: '8px 20px', borderRadius: '16px', fontSize: '1rem', fontWeight: 900, boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.4)', animation: 'pop-in 0.4s both 1.5s' }}>
                    1,240 PPM SPIKE
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '2px', opacity: 0.9 }}>P3 PHYSICS • 28 STUDENTS</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '64px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                    <span>MONDAY 07:00</span>
                    <span>MONDAY 14:00</span>
                    <span>TUESDAY 07:00</span>
                    <span>TUESDAY 14:00</span>
                </div>
            </div>

            <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    "The graph isn't just data. It's the unique fingerprint of your school's behavior."
                </p>
            </div>
        </div>
    );

    const renderEvaluation = () => {
        const highlightedText = aiText
            .replace(/(1,240 ppm)/g, '<strong style="color:var(--primary)">$1</strong>')
            .replace(/(30% harder)/g, '<strong style="color:#ef4444">$1</strong>')
            .replace(/(Zielkonflikt)/g, '<strong style="color:#f59e0b">$1</strong>');

        return (
            <div className="demo-step evaluation-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '40px', textAlign: 'center' }}>The Evaluation</h2>

                    {/* Chat Experience */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Student Question */}
                        <div style={{ alignSelf: 'flex-start', maxWidth: '80%', animation: 'slideInRight 0.4s both' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', marginLeft: '12px' }}>STUDENT (GRADE 9)</div>
                            <div style={{ background: 'var(--bg-elevated)', padding: '16px 24px', borderRadius: '4px 24px 24px 24px', border: '1px solid var(--border-light)', fontWeight: 600, fontSize: '1.1rem' }}>
                                "Why did our classroom CO2 spike so high at 10:15 AM?"
                            </div>
                        </div>

                        {/* AI Answer */}
                        <div style={{ alignSelf: 'flex-end', maxWidth: '90%', animation: 'slideInRight 0.4s both 0.5s' }}>
                            <div style={{ textAlign: 'right', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px', marginRight: '12px' }}>SYSTEM AI TUTOR</div>
                            <div className="glass-card" style={{ padding: '24px 32px', background: 'white', borderRadius: '24px 4px 24px 24px', border: '2px solid var(--primary-light)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1)', position: 'relative' }}>
                                <div
                                    style={{ fontSize: '1.3rem', color: '#1e293b', lineHeight: 1.5, fontWeight: 500 }}
                                    dangerouslySetInnerHTML={{ __html: highlightedText }}
                                />
                                {aiText.length < fullAiResponse.length && (
                                    <span className="cursor" style={{ display: 'inline-block', width: '3px', height: '1.3rem', background: 'var(--primary)', marginLeft: '4px' }} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '64px', padding: '24px', background: 'rgba(59, 130, 246, 0.03)', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.1)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                            <Cpu size={18} /> Deep Reasoning
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                            The AI connects abstract sensor data to human classroom behavior.
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderConflict = () => (
        <div className="demo-step magic-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#9a3412', marginBottom: '12px' }}>The Target Conflict</h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '8px 20px', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', borderRadius: '32px', fontWeight: 800, fontSize: '0.9rem' }}>
                    <Settings size={20} /> INTERACTIVE SIMULATION
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '48px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '40px', boxShadow: '0 25px 50px -12px rgba(249, 115, 22, 0.1)' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontWeight: 900, fontSize: '1.2rem' }}>
                            <span style={{ color: 'var(--text-primary)' }}>WINDOW OPENING</span>
                            <span style={{ color: '#f97316', fontSize: '2rem' }}>{windowOpen}%</span>
                        </div>

                        <div style={{ position: 'relative', marginBottom: '80px' }}>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={windowOpen}
                                onChange={(e) => setWindowOpen(parseInt(e.target.value))}
                                style={{ width: '100%', height: '32px', accentColor: '#f97316', cursor: 'grab', position: 'relative', zIndex: 2 }}
                            />
                            {/* Sweet Spot Indicator */}
                            <div style={{ position: 'absolute', top: '50%', left: '15%', right: '70%', height: '40px', background: 'rgba(16, 185, 129, 0.1)', border: '2px dashed #10b981', transform: 'translateY(-50%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10b981' }}>SWEET SPOT</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            <div style={{ textAlign: 'center', padding: '24px', background: 'white', borderRadius: '24px', border: currentCO2 > 1000 ? '4px solid #ef4444' : currentCO2 < 600 ? '4px solid #10b981' : '4px solid #fde68a', transition: 'all 0.1s linear', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Health (CO2)</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: currentCO2 > 1000 ? '#ef4444' : currentCO2 < 600 ? '#10b981' : 'var(--text-primary)' }}>{currentCO2}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>PPM</div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '24px', background: 'white', borderRadius: '24px', border: currentTemp < 19 ? '4px solid #ef4444' : '4px solid #f1f5f9', transition: 'all 0.1s linear', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Comfort (Temp)</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: currentTemp < 19 ? '#ef4444' : 'var(--text-primary)' }}>{currentTemp.toFixed(1)}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>°C</div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '24px', background: 'white', borderRadius: '24px', border: windowOpen > 20 ? '4px solid #ef4444' : '4px solid #f1f5f9', transition: 'all 0.1s linear', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Energy Cost</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: windowOpen > 20 ? '#ef4444' : 'var(--text-primary)' }}>+{heatLoss}%</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>LOSS</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 900, color: (windowOpen >= 15 && windowOpen <= 30) ? '#10b981' : '#9a3412', background: (windowOpen >= 15 && windowOpen <= 30) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)', padding: '20px', borderRadius: '24px', border: '1px solid currentColor', transition: 'all 0.2s' }}>
                        {(windowOpen >= 15 && windowOpen <= 30) ?
                            "✓ BALANCE FOUND: Sustainable Learning Environment" :
                            "✘ SYSTEMIC IMBALANCE: Negotiate the trade-offs."}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAsk = () => (
        <div className="demo-step ask-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px' }}>The Ask</h2>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Closing the Validation Loop</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px', maxWidth: '1000px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '48px', background: 'var(--primary)', color: 'white', borderRadius: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.3)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Investment</div>
                    <div style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '8px' }}>€799</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, opacity: 0.9 }}>One-time payment (GWG Limit)</div>
                    <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 900, fontSize: '1.1rem' }}>
                            <ShieldCheck size={24} /> 24-Month Warranty
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '40px', borderRadius: '40px' }}>
                    <h3 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: '32px' }}>Next Steps for Validation</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            "Would you trial this for 4 weeks in your Physics lab?",
                            "Can you introduce us to the BNE Coordinator?",
                            "Would you recommend this at the next Fachkonferenz?",
                            "Are you willing to pay from the Fachschaft budget?"
                        ].map((text, i) => (
                            <label
                                key={i}
                                className="validation-item"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    padding: '24px',
                                    background: 'var(--bg-elevated)',
                                    borderRadius: '24px',
                                    cursor: 'pointer',
                                    border: '1px solid var(--border-light)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            >
                                <input type="checkbox" style={{ width: '24px', height: '24px', accentColor: 'var(--primary)' }} />
                                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{text}</span>
                            </label>
                        ))}
                    </div>

                    <div style={{ marginTop: '40px', textAlign: 'center', padding: '20px', background: '#fef2f2', color: '#ef4444', borderRadius: '16px', fontWeight: 900, border: '2px dashed #fecaca', animation: 'pulse-soft 2s infinite' }}>
                        PRO-TIP: MAKE EYE CONTACT & WAIT.
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
                @keyframes pop-in {
                    0% { transform: scale(0.8) translateY(10px); opacity: 0; }
                    80% { transform: scale(1.05); }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                @keyframes pulse-soft {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.03); opacity: 0.9; }
                    100% { transform: scale(1); }
                }
                @keyframes pulse-slow {
                    0% { transform: scale(1) rotate(0deg); opacity: 0.05; }
                    50% { transform: scale(1.1) rotate(5deg); opacity: 0.1; }
                    100% { transform: scale(1) rotate(0deg); opacity: 0.05; }
                }
                @keyframes pulse-red {
                    0% { opacity: 0.8; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.02); color: #ef4444; text-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
                    100% { opacity: 0.8; transform: scale(1); }
                }
                @keyframes shimmer-stuck {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(400%); }
                }
                @keyframes victory-pop {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
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
                    background: white !important;
                    transform: translateX(8px);
                    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.1);
                }
            `}</style>
        </div>
    );
};
