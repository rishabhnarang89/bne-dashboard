import { useState, useEffect } from 'react';
import {
    ChevronRight, ChevronLeft,
    Clock, Wind,
    Bot,
    Settings, AlertTriangle, AlertCircle,
    CheckCircle2, Cpu, Zap,
    Users
} from 'lucide-react';

// Types for the demo steps
type DemoStepId = 'problem' | 'promise' | 'pulse' | 'fingerprint' | 'evaluation' | 'conflict' | 'ask';

export const Demo = () => {
    const [stepId, setStepId] = useState<DemoStepId>('problem');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'searching' | 'connecting' | 'connected'>('idle');
    const [windowOpen, setWindowOpen] = useState(0); // 0 to 100




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

    const activeStep = steps.indexOf(stepId);

    const renderProblem = () => (
        <div className="demo-step problem-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px' }}>The Detective Challenge</h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '10px 24px', background: 'var(--bg-elevated)', borderRadius: '32px', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>CASE FILE: <strong>Classroom 3B</strong></span>
                </div>
            </div>

            <div className="card" style={{ padding: '48px', background: 'white', borderRadius: '32px', border: '1px solid var(--border-light)', maxWidth: '900px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>

                {/* Mystery Headline */}
                <div style={{ marginBottom: '40px', borderLeft: '6px solid #ef4444', paddingLeft: '24px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px', lineHeight: 1.4 }}>
                        "Something happened in this room at exactly 10:15, 11:45, and 14:30. Can you solve it?"
                    </div>
                </div>

                {/* Graph Visualization */}
                <div style={{ position: 'relative', height: '300px', marginBottom: '40px' }}>
                    <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
                        {/* Grid Lines */}
                        {[0, 1, 2, 3].map(i => (
                            <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="#f1f5f9" strokeWidth="2" />
                        ))}

                        {/* Mystery Data Line */}
                        <path
                            d="M0,250 L100,250 L150,150 L200,80 L250,120 L300,50 L400,250 L500,250 L550,140 L600,70 L650,110 L700,40 L800,250 L1000,250"
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="4"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            opacity="0.5"
                        />

                        {/* Spikes Highlighted */}
                        <circle cx="200" cy="80" r="12" fill="#ef4444" style={{ animation: 'pulse-red 2s infinite' }} />
                        <text x="200" y="60" textAnchor="middle" fill="#ef4444" fontWeight="800" fontSize="20">????</text>

                        <circle cx="600" cy="70" r="12" fill="#ef4444" style={{ animation: 'pulse-red 2s infinite 0.5s' }} />
                        <text x="600" y="50" textAnchor="middle" fill="#ef4444" fontWeight="800" fontSize="20">????</text>

                        <circle cx="700" cy="40" r="12" fill="#ef4444" style={{ animation: 'pulse-red 2s infinite 1.0s' }} />
                        <text x="700" y="20" textAnchor="middle" fill="#ef4444" fontWeight="800" fontSize="20">????</text>
                    </svg>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginTop: '32px' }}>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>SUSPECT 1</div>
                        <div style={{ fontWeight: 700 }}>A fire?</div>
                    </div>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>SUSPECT 2</div>
                        <div style={{ fontWeight: 700 }}>Chemical leak?</div>
                    </div>
                    <div style={{ padding: '20px', background: '#fffbeb', borderRadius: '16px', border: '1px solid #fcd34d' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d97706', marginBottom: '8px' }}>THE REAL CULPRIT</div>
                        <div style={{ fontWeight: 900, color: '#b45309', fontSize: '1.1rem' }}>28 Ninth Graders.</div>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px', maxWidth: '700px', margin: '40px auto 0' }}>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
                    "Your classroom isn't just a room. It's a <strong style={{ color: 'var(--primary)' }}>living, breathing system</strong>. And until now, it's been invisible."
                </p>
            </div>
        </div>
    );

    const renderPromise = () => (
        <div className="demo-step promise-step" style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '24px' }}>The Live Experiment</h2>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px' }}>
                "Right now, this sensor reads <strong>450 ppm</strong> (outdoor air). <br />
                Now watch what happens when we breathe."
            </div>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '60px', borderRadius: '40px', background: 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.02)' }}>
                {/* Live Number */}
                <div style={{ fontSize: '8rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: connectionStatus === 'connected' ? '#ef4444' : 'var(--primary)', lineHeight: 1, letterSpacing: '-0.05em', transition: 'color 0.5s' }}>
                    {connectionStatus === 'connected' ? 538 : 452}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)', marginTop: '8px' }}>PPM CO₂</div>

                {/* Simulation Button/State */}
                <div style={{ marginTop: '48px', height: '80px' }}>
                    {connectionStatus !== 'connected' ? (
                        <button
                            className="btn btn-primary"
                            onClick={startConnection}
                            style={{ padding: '20px 48px', fontSize: '1.2rem', borderRadius: '50px', boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.4)' }}
                        >
                            <Wind size={24} style={{ marginRight: '12px' }} />
                            START BREATHING
                        </button>
                    ) : (
                        <div style={{ animation: 'fadeIn 0.5s' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '12px 24px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '32px', fontWeight: 900 }}>
                                <AlertCircle size={20} /> DETECTING RESPIRATION...
                            </div>
                            <div style={{ marginTop: '24px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                +86 ppm in 30 seconds
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Curriculum Callout */}
            <div style={{ marginTop: '48px', display: 'inline-block', padding: '16px 32px', background: '#ecfdf5', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', marginBottom: '4px', textTransform: 'uppercase' }}>CURRICULUM LINK</div>
                <div style={{ fontWeight: 900, color: '#064e3b', fontSize: '1rem' }}>Biology 9: Cellular Respiration (C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O)</div>
            </div>
        </div>
    );

    const renderPulse = () => (
        <div className="demo-step pulse-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' }}>The Classroom Metabolism</h2>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Room 3B • Period 3 Physics • 28 Students</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>

                {/* Hero Metric: Respiration Rate */}
                <div className="card" style={{ padding: '32px', background: 'white', gridColumn: 'span 4', border: '2px solid var(--primary-light)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Respiration Rate (CO₂)</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#f59e0b' }}>842</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)' }}>ppm</div>
                    </div>
                    <div style={{ marginTop: '16px', background: '#fef3c7', color: '#d97706', padding: '8px 16px', borderRadius: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={16} /> ELEVATED
                    </div>
                    <div style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        <span style={{ color: '#ef4444' }}>▲</span> Climbing 12 ppm/min
                    </div>
                </div>

                {/* Thermal Comfort */}
                <div className="card" style={{ padding: '32px', background: 'white', gridColumn: 'span 4' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Thermal Comfort</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#10b981' }}>20.4</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)' }}>°C</div>
                    </div>
                    <div style={{ marginTop: '16px', background: '#ecfdf5', color: '#059669', padding: '8px 16px', borderRadius: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} /> OPTIMAL
                    </div>
                </div>

                {/* Cognitive Load Indicator - THE HOOK */}
                <div className="card" style={{ padding: '32px', background: '#1e293b', color: 'white', gridColumn: 'span 4', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.3)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Cpu size={16} /> Cognitive Load
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', lineHeight: 1.4 }}>
                        At <strong>842 ppm</strong>, research indicates:
                    </div>
                    <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                            <span style={{ fontWeight: 600, opacity: 0.8 }}>Decision Making</span>
                            <span style={{ fontWeight: 900, color: '#f87171' }}>-11%</span>
                        </li>
                        <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600, opacity: 0.8 }}>Problem Solving</span>
                            <span style={{ fontWeight: 900, color: '#f87171' }}>-15%</span>
                        </li>
                    </ul>
                    <div style={{ marginTop: '24px', fontSize: '0.75rem', opacity: 0.5, fontStyle: 'italic' }}>
                        Source: Harvard T.H. Chan School of Public Health
                    </div>
                </div>

                {/* Real-time Insight */}
                <div className="glass-card" style={{ gridColumn: 'span 12', padding: '24px', display: 'flex', alignItems: 'center', gap: '24px', borderLeft: '6px solid #f59e0b' }}>
                    <div style={{ padding: '16px', background: '#FFF7ED', borderRadius: '50%', color: '#ea580c' }}>
                        <Clock size={32} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#1e293b', marginBottom: '4px' }}>PREDICTION: 1,000 PPM IN 13 MINUTES</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>
                            Current Load: 28 students × ~200ml CO₂/min = <span style={{ color: '#ea580c' }}>5.6 Liters/min</span> added.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );

    const renderFingerprint = () => (
        <div className="demo-step fingerprint-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px' }}>Decode Your School's Rhythm</h2>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>The building is telling a story. Can your students read it?</div>
            </div>

            <div style={{ height: '420px', background: 'white', borderRadius: '32px', padding: '48px 48px 24px', border: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.02)' }}>
                {/* Graph */}
                <svg width="100%" height="220" viewBox="0 0 1000 300" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="chartGradientHybrid" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                        {/* Reveal Animation Clip */}
                        <clipPath id="reveal">
                            <rect x="0" y="-50" width="1000" height="400">
                                <animate attributeName="width" from="0" to="1000" dur="2.5s" fill="freeze" />
                            </rect>
                        </clipPath>
                    </defs>

                    <g clipPath="url(#reveal)">
                        {/* The Line */}
                        <path
                            d="M0,250 L100,250 L150,150 L200,80 L250,120 L300,50 L400,250 L500,250 L550,140 L600,70 L650,110 L700,40 L800,250 L1000,250"
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                        {/* The Fill */}
                        <path
                            d="M0,250 L100,250 L150,150 L200,80 L250,120 L300,50 L400,250 L500,250 L550,140 L600,70 L650,110 L700,40 L800,250 L1000,250 V300 H0 Z"
                            fill="url(#chartGradientHybrid)"
                        />

                        {/* Interactivity Markers - Always visible for context */}
                        <line x1="300" y1="50" x2="300" y2="320" stroke="var(--primary)" strokeDasharray="4 4" opacity="0.4" />
                        <line x1="450" y1="250" x2="450" y2="320" stroke="#10b981" strokeDasharray="4 4" opacity="0.6" />
                        <line x1="700" y1="40" x2="700" y2="320" stroke="#f59e0b" strokeDasharray="4 4" opacity="0.6" />
                    </g>
                </svg>

                {/* Annotation Cards - Absolute Positioned */}
                {/* 1. The Rush */}
                <div style={{ position: 'absolute', top: '40px', left: '260px', animation: 'pop-in 0.4s both 1.8s' }}>
                    <div className="glass-card" style={{ padding: '12px 20px', borderRadius: '16px', borderLeft: '4px solid var(--primary)', background: 'rgba(255,255,255,0.9)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>MONDAY 10:15</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '4px' }}>Peak Load</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Biology (28 students)</div>
                    </div>
                </div>

                {/* 2. The Lunch Reset */}
                <div style={{ position: 'absolute', bottom: '90px', left: '410px', animation: 'pop-in 0.4s both 2.2s' }}>
                    <div className="glass-card" style={{ padding: '12px 20px', borderRadius: '16px', borderLeft: '4px solid #10b981', background: 'rgba(255,255,255,0.9)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>13:00 - 14:00</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '4px', color: '#059669' }}>The Reset</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Room Empty (Lunch)</div>
                    </div>
                </div>

                {/* 3. The Anomaly */}
                <div style={{ position: 'absolute', top: '30px', left: '620px', animation: 'pop-in 0.4s both 2.6s' }}>
                    <div className="glass-card" style={{ padding: '12px 20px', borderRadius: '16px', borderLeft: '4px solid #f59e0b', background: 'rgba(255,255,255,0.9)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>TUESDAY 14:30</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 900, background: '#fffbeb', color: '#d97706', padding: '2px 6px', borderRadius: '4px' }}>ANOMALY</div>
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '4px' }}>Theater Rehearsal</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>+15 Extra Students</div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '64px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>MONDAY</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>Regular Cycle</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>TUESDAY</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>Event Detection</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEvaluation = () => {
        // Updated text for Socratic Scientist
        const [socraticText, setSocraticText] = useState('');
        const fullSocraticResponse = "That's a great observation! A 28-person class exhales about 5.6 Liters of CO2 per minute. If the room is sealed, how long until we hit the 1,500 ppm limit?";

        useEffect(() => {
            if (activeStep === 4) {
                setSocraticText('');
                let i = 0;
                const interval = setInterval(() => {
                    setSocraticText(fullSocraticResponse.slice(0, i));
                    i++;
                    if (i > fullSocraticResponse.length) clearInterval(interval);
                }, 30); // Faster typing speed
                return () => clearInterval(interval);
            }
        }, [activeStep]);

        const highlightedText = socraticText
            .replace(/(5.6 Liters)/g, '<strong style="color:var(--primary)">$1</strong>')
            .replace(/(1,500 ppm)/g, '<strong style="color:#ef4444">$1</strong>');


        return (
            <div className="demo-step evaluation-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px' }}>The Socratic Scientist</h2>
                        <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>The AI doesn't just give answers. It guides discovery.</div>
                    </div>

                    {/* Chat Interface */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {/* 1. Student Observation */}
                        <div style={{ alignSelf: 'flex-start', maxWidth: '85%', animation: 'slideInRight 0.4s both' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>S</div>
                                STUDENT (GRADE 9)
                            </div>
                            <div style={{ background: 'white', padding: '24px 32px', borderRadius: '4px 24px 24px 24px', border: '1px solid var(--border-light)', fontWeight: 600, fontSize: '1.2rem', color: '#1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                "The graph goes up really fast during 3rd period. Is that just us breathing?"
                            </div>
                        </div>

                        {/* 2. AI Socratic Response */}
                        <div style={{ alignSelf: 'flex-end', maxWidth: '90%', animation: 'slideInRight 0.4s both 0.6s' }}>
                            <div style={{ textAlign: 'right', fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                SYSTEM AI <Bot size={20} />
                            </div>
                            <div className="glass-card" style={{ padding: '32px', background: 'radial-gradient(circle at top right, #eff6ff 0%, #ffffff 100%)', borderRadius: '24px 4px 24px 24px', border: '2px solid var(--primary-light)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1)', position: 'relative' }}>
                                <div
                                    style={{ fontSize: '1.35rem', color: '#1e293b', lineHeight: 1.5, fontWeight: 500, fontFamily: 'ui-serif, Georgia, Cambria, Times New Roman, Times, serif' }}
                                    dangerouslySetInnerHTML={{ __html: highlightedText }}
                                />
                                {socraticText.length < fullSocraticResponse.length && (
                                    <span style={{ display: 'inline-block', width: '8px', height: '1.35rem', background: 'var(--primary)', marginLeft: '4px', animation: 'blink 1s infinite' }} />
                                )}
                            </div>

                            {/* Follow-up Prompts */}
                            {socraticText.length === fullSocraticResponse.length && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', animation: 'fadeIn 0.5s' }}>
                                    <button className="btn btn-sm" style={{ background: 'white', border: '1px solid var(--primary-light)', color: 'var(--primary)', borderRadius: '20px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: 600 }}>
                                        Calculate Volume
                                    </button>
                                    <button className="btn btn-sm" style={{ background: 'white', border: '1px solid var(--primary-light)', color: 'var(--primary)', borderRadius: '20px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: 600 }}>
                                        Check Ventilation Rates
                                    </button>
                                </div>
                            )}
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
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px' }}>Join the Experiment</h2>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>We are looking for <strong>50 schools</strong> to validate this BNE station.</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>

                {/* 1. What You Get (Value) */}
                <div className="card" style={{ padding: '40px', background: 'white', borderRadius: '32px', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Zap size={28} className="text-secondary" />
                        The Pilot Package
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: 0, listStyle: 'none' }}>
                        <li style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={16} /></div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>1x CO2 Discovery Node</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Pre-calibrated, offline-ready.</div>
                            </div>
                        </li>
                        <li style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={16} /></div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>The "Science First" Curriculum</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>5 modules: Biology, Physics, Math, Ethics.</div>
                            </div>
                        </li>
                        <li style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={16} /></div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>3 Years of Updates</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>New experiments and firmware features.</div>
                            </div>
                        </li>
                    </ul>

                    <div style={{ marginTop: '40px', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>PARTICIPATION FEE</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b' }}>€799</div>
                            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>/ classroom</div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, marginTop: '8px' }}>✓ Qualifies as "Low Value Good" (GWG)</div>
                    </div>
                </div>


                {/* 2. What We Need (Ask) */}
                <div className="card" style={{ padding: '40px', background: '#1e1b4b', color: 'white', borderRadius: '32px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Users size={28} style={{ color: '#818cf8' }} />
                        Research Requirements
                    </h3>
                    <div style={{ marginBottom: '32px', fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6 }}>
                        We are validating this hardware for mass adoption. To join the pilot, we need:
                    </div>

                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: 0, listStyle: 'none' }}>
                        <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{ marginTop: '4px', flexShrink: 0, width: 20, height: 20, border: '2px solid #6366f1', borderRadius: '50%' }} />
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>One lead teacher (Physics/Bio).</div>
                        </li>
                        <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{ marginTop: '4px', flexShrink: 0, width: 20, height: 20, border: '2px solid #6366f1', borderRadius: '50%' }} />
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Permission to run the "Ventilation Olympics."</div>
                        </li>
                        <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{ marginTop: '4px', flexShrink: 0, width: 20, height: 20, border: '2px solid #6366f1', borderRadius: '50%' }} />
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>A 15-minute feedback call after 4 weeks.</div>
                        </li>
                    </ul>

                    <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                        <button className="btn btn-primary" style={{ width: '100%', padding: '24px', fontSize: '1.3rem', borderRadius: '16px', background: '#4f46e5', border: 'none', color: 'white' }}>
                            Apply for Pilot
                        </button>
                        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', opacity: 0.6 }}>
                            Only 14 spots remaining for Spring 2025.
                        </div>
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
