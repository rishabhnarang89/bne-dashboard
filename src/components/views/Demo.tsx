import { useState, useEffect } from 'react';
import {
    Network, ChevronRight, ChevronLeft,
    ShieldCheck, GraduationCap,
    Thermometer, Wind,
    Cpu, CheckCircle2,
    Building2, Leaf, Activity,
    RefreshCw, Zap, Settings,
    Info, AlertCircle, Clock
} from 'lucide-react';

// Types for the demo steps
type DemoStepId = 'onboarding' | 'connection' | 'dashboard' | 'timelapse' | 'analysis' | 'expansion';

export const Demo = () => {
    const [stepId, setStepId] = useState<DemoStepId>('onboarding');
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'searching' | 'connecting' | 'connected'>('idle');
    const [windowOpen, setWindowOpen] = useState(0); // 0 to 100
    const [aiText, setAiText] = useState('');
    const fullAiResponse = "I've analyzed the 48-hour dataset. The CO2 spike at 10:15 AM (1,240 ppm) directly correlates with your Physics class with 28 students. Note that while 'Stoßlüften' (burst ventilation) clears the CO2 in 4 minutes, the classroom temperature drops by 6°C, forcing the heating system to work 30% harder. This is a perfect 'Zielkonflikt' (target conflict) for your students to solve.";

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
        if (stepId === 'analysis') {
            let i = 0;
            const timer = setInterval(() => {
                setAiText(fullAiResponse.slice(0, i));
                i++;
                if (i > fullAiResponse.length) clearInterval(timer);
            }, 20);
            return () => clearInterval(timer);
        } else {
            setAiText('');
        }
    }, [stepId]);

    const steps: DemoStepId[] = ['onboarding', 'connection', 'dashboard', 'timelapse', 'analysis', 'expansion'];

    const nextStep = () => {
        const currentIndex = steps.indexOf(stepId);
        if (currentIndex < steps.length - 1) {
            setStepId(steps[currentIndex + 1]);
        }
    };

    const prevStep = () => {
        const currentIndex = steps.indexOf(stepId);
        if (currentIndex > 0) {
            setStepId(steps[currentIndex - 1]);
        }
    };

    // Connection Simulation
    const startConnection = () => {
        setConnectionStatus('searching');
        setTimeout(() => setConnectionStatus('connecting'), 1500);
        setTimeout(() => setConnectionStatus('connected'), 3000);
    };

    // Derived values for simulator
    const currentCO2 = Math.max(450, 1240 - (windowOpen * 8));
    const currentTemp = Math.max(15, 21.5 - (windowOpen * 0.06));
    const heatLoss = (windowOpen * 1.5).toFixed(1);

    const renderOnboarding = () => (
        <div className="demo-step onboarding-step" style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'inline-flex', padding: '8px 16px', background: 'var(--primary-light)', color: 'white', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '24px', letterSpacing: '0.05em' }}>
                DEMO SCENARIO
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '16px', color: 'var(--primary)' }}>The Breathing Room</h1>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                A 6-week interdisciplinary BNE module for <strong>Grade 9 Physics</strong>.
                Move from thermodynamics to systemic shaping competence (Gestaltungskompetenz).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '32px', textAlign: 'left', borderTop: '4px solid var(--primary)' }}>
                    <div style={{ background: 'var(--bg-elevated)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '16px', color: 'var(--primary)' }}>
                        <GraduationCap size={24} />
                    </div>
                    <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>Pedagogical Goal</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Analyze thermodynamics through real-world environmental trade-offs.</p>
                </div>
                <div className="glass-card" style={{ padding: '32px', textAlign: 'left', borderTop: '4px solid #10b981' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#10b981' }}>
                        <Activity size={24} />
                    </div>
                    <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>The Action</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Students log 48 hours of class data to develop a ventilation concept.</p>
                </div>
                <div className="glass-card" style={{ padding: '32px', textAlign: 'left', borderTop: '4px solid #f59e0b' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#f59e0b' }}>
                        <Cpu size={24} />
                    </div>
                    <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>The Tech</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Offline Edge-AI processing ensures 100% GDPR compliance.</p>
                </div>
            </div>
        </div>
    );

    const renderConnection = () => (
        <div className="demo-step connection-step" style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '40px' }}>Zero-IT Connection Flow</h2>

            <div style={{ position: 'relative', width: '600px', height: '300px', margin: '0 auto 40px', background: 'var(--bg-elevated)', borderRadius: '24px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {/* Background Grid */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                {connectionStatus === 'idle' && (
                    <button className="btn btn-primary" onClick={startConnection} style={{ padding: '16px 32px', fontSize: '1.2rem', zIndex: 10 }}>
                        <Zap size={20} style={{ marginRight: '8px' }} /> Discover Local Hub
                    </button>
                )}

                {(connectionStatus === 'searching' || connectionStatus === 'connecting') && (
                    <div style={{ textAlign: 'center' }}>
                        <div className="animate-spin" style={{ marginBottom: '24px' }}>
                            <RefreshCw size={64} color="var(--primary)" />
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            {connectionStatus === 'searching' ? 'Scanning for LoRaWAN Hub...' : 'Establishing Private Handshake...'}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
                            No WiFi credentials requested. No internet required.
                        </div>
                    </div>
                )}

                {connectionStatus === 'connected' && (
                    <div style={{ textAlign: 'center', animation: 'scaleIn 0.3s ease-out' }}>
                        <div style={{ background: '#10b981', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white' }}>
                            <CheckCircle2 size={48} />
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>Connection Secured</div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '8px' }}>BNE-Hub-Classroom-A1 is now streaming locally.</div>
                    </div>
                )}

                {/* Status Bar */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 24px', background: 'rgba(0,0,0,0.05)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: connectionStatus === 'connected' ? '#10b981' : '#6b7280' }} />
                        SYSTEM: {connectionStatus.toUpperCase()}
                    </div>
                    <div>ENCRYPTION: AES-128 LOCAL ONLY</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '48px' }}>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, marginBottom: '8px' }}>
                        <ShieldCheck size={20} /> The Result:
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <li style={{ marginBottom: '4px' }}>✓ No student accounts needed</li>
                        <li style={{ marginBottom: '4px' }}>✓ Bypasses School WiFi restrictions</li>
                        <li style={{ marginBottom: '4px' }}>✓ 100% DSGVO / GDPR compliant</li>
                    </ul>
                </div>
                <div style={{ width: '1px', background: 'var(--border-light)' }} />
                <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, marginBottom: '8px' }}>
                        <Clock size={20} /> Setup Time:
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>112 <span style={{ fontSize: '1rem', fontWeight: 600 }}>seconds</span></div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From unboxing to live dashboard.</div>
                </div>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="demo-step dashboard-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Live Product Interface</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Teacher's Backend View - Offline Campus Network</p>
                </div>
                <div style={{ background: 'var(--bg-elevated)', padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>HUB-01 STREAMING</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="card" style={{ padding: '24px', background: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '8px', opacity: 0.1 }}><Wind size={64} /></div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>CO2 Concentration</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4px' }}>842 <span style={{ fontSize: '1rem' }}>PPM</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>
                            <AlertCircle size={14} /> Moderate Air Quality
                        </div>
                    </div>
                    <div className="card" style={{ padding: '24px', background: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '8px', opacity: 0.1 }}><Thermometer size={64} /></div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Temperature</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4px' }}>{currentTemp.toFixed(1)} <span style={{ fontSize: '1rem' }}>°C</span></div>
                        <div style={{ fontSize: '0.8rem', color: currentTemp < 19 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>{currentTemp < 19 ? 'Low Temperature' : 'Optimal Learning Range'}</div>
                    </div>
                    <div className="card" style={{ padding: '24px', background: 'white', position: 'relative', overflow: 'hidden', gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ fontWeight: 800 }}>Node Health: Classroom A1</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uptime: 14d 2h 11m</div>
                        </div>
                        <div style={{ height: '40px', display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
                            {[...Array(30)].map((_, i) => (
                                <div key={i} style={{ flex: 1, background: 'var(--primary-light)', height: `${20 + Math.random() * 80}%`, borderRadius: '2px', opacity: 0.3 + (i / 30) * 0.7 }} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>System Observations</div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: '#3b82f6' }}><Info size={18} /></div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Pattern Detected</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>CO2 regularly exceeds 1200ppm between 09:45 and 10:30.</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}><CheckCircle2 size={18} /></div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Module Ready</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>BNE Week 2: "The Breathing Classroom" dataset complete.</div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>DATA PERSISTENCE</div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Storage: On-Node (4.2GB available)</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No data ever leaves the school campus.</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTimelapse = () => (
        <div className="demo-step timelapse-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '24px' }}>48-Hour Dataset Snapshot</h2>
            <div style={{ height: '350px', background: 'white', borderRadius: '24px', padding: '40px', border: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden' }}>
                {/* Simulated Chart */}
                <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    {[0, 1, 2, 3].map(i => (
                        <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="#f1f5f9" strokeWidth="2" />
                    ))}

                    {/* The Path */}
                    <path
                        d="M0,250 L100,250 L150,150 L200,80 L250,120 L300,50 L400,250 L500,250 L550,140 L600,70 L650,110 L700,40 L800,250 L1000,250"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="4"
                        strokeLinejoin="round"
                    />
                    {/* Fill Area */}
                    <path
                        d="M0,250 L100,250 L150,150 L200,80 L250,120 L300,50 L400,250 L500,250 L550,140 L600,70 L650,110 L700,40 L800,250 L1000,250 V300 H0 Z"
                        fill="url(#chartGradient)"
                        opacity="0.1"
                    />
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" />
                            <stop offset="100%" stopColor="white" />
                        </linearGradient>
                    </defs>

                    {/* Annotations */}
                    <circle cx="300" cy="50" r="6" fill="#ef4444" />
                    <circle cx="700" cy="40" r="6" fill="#ef4444" />
                </svg>

                <div style={{ position: 'absolute', top: '60px', left: '320px', background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                    1,240 PPM SPIKE
                </div>

                {/* Timeline Axis */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
                    <span>MONDAY 07:00</span>
                    <span>MONDAY 14:00</span>
                    <span>TUESDAY 07:00</span>
                    <span>TUESDAY 14:00</span>
                </div>
            </div>

            <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                    "The graph isn't just a line. It's the **fingerprint of your school's behavior**."
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--primary)' }} /> CO2 Concentration (PPM)
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAnalysis = () => (
        <div className="demo-step analysis-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div className="glass-card" style={{ padding: '32px', background: 'white', borderLeft: '6px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)' }}>
                        <Cpu size={32} />
                        <h3 style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>OFFLINE AI ANALYSIS</h3>
                    </div>

                    <div style={{ minHeight: '180px', fontSize: '1.2rem', color: '#1e293b', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '24px' }}>
                        {aiText}
                        <span className="cursor" style={{ display: 'inline-block', width: '2px', height: '1.2rem', background: 'var(--primary)', marginLeft: '4px' }} />
                    </div>

                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>BNE PEDAGOGY NOTE:</div>
                        This drives **Systemic Thinking**. Students stop seeing just "numbers" and start seeing "interconnected trade-offs."
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: '32px', background: '#fff7ed' }}>
                        <h3 style={{ fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Settings size={20} color="#f97316" /> Target Conflict Simulator
                        </h3>

                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                                <span>Classroom Ventilation (Window Status)</span>
                                <span style={{ color: '#f97316' }}>{windowOpen}% Open</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={windowOpen}
                                onChange={(e) => setWindowOpen(parseInt(e.target.value))}
                                style={{ width: '100%', height: '8px', accentColor: '#f97316', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #fde68a' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CO2 Level</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: currentCO2 > 1000 ? '#ef4444' : '#10b981' }}>{currentCO2} <span style={{ fontSize: '0.8rem' }}>PPM</span></div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #fde68a' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Heating Cost Impact</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: windowOpen > 20 ? '#ef4444' : 'var(--text-primary)' }}>+{heatLoss}%</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#9a3412' }}>
                            Finding the "Goldilocks Zone" is the lesson.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderExpansion = () => (
        <div className="demo-step expansion-step" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'inline-flex', padding: '6px 16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '16px' }}>
                        THE PROCUREMENT SHIELD
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px' }}>Bypassing the Bureaucracy</h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        Designed to fit into the **GWG (Geringwertiges Wirtschaftsgut)** budget.
                        No municipal tender process required.
                    </p>

                    <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-light)', marginBottom: '32px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 700 }}>SINGLE UNIT PRICE:</div>
                        <div style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--primary)' }}>€799</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 800, marginTop: '8px' }}>
                            <CheckCircle2 size={24} /> Sub-€800 Limit Approved
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button className="btn btn-ghost" style={{ border: '1px solid var(--border-light)' }}>Download Quote PDF</button>
                        <button className="btn btn-ghost" style={{ border: '1px solid var(--border-light)' }}>See KMK Compliance Doc</button>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '40px', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Network size={24} color="var(--primary)" /> Whole School Approach Rollout
                    </h3>

                    <div style={{ position: 'relative', height: '240px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ padding: '12px', background: 'var(--primary-light)', borderRadius: '12px', color: 'white' }}><Wind size={24} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800 }}>Phase 1: Physics Dept (Today)</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>"Breathing Room" Sustainability Module</div>
                            </div>
                            <div style={{ color: '#10b981', fontWeight: 800 }}>€799</div>
                        </div>
                        <div style={{ height: '30px', width: '2px', background: 'var(--border-light)', marginLeft: '24px' }} />
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', opacity: 0.6 }}>
                            <div style={{ padding: '12px', background: '#10b981', borderRadius: '12px', color: 'white' }}><Leaf size={24} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800 }}>Phase 2: Biology Dept</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Automated Campus Garden & Soil Health</div>
                            </div>
                            <div style={{ fontWeight: 700 }}>€799</div>
                        </div>
                        <div style={{ height: '30px', width: '2px', background: 'var(--border-light)', marginLeft: '24px' }} />
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', opacity: 0.4 }}>
                            <div style={{ padding: '12px', background: '#f59e0b', borderRadius: '12px', color: 'white' }}><Building2 size={24} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800 }}>Phase 3: Shared Infrastructure</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Facility Resource Efficiency Tracking</div>
                            </div>
                            <div style={{ fontWeight: 700 }}>€799</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px', padding: '20px', background: 'var(--bg-elevated)', borderRadius: '16px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
                            <Activity size={16} /> Campus Mesh Network
                        </div>
                        Units connect via LoRaWAN. You are building school-wide BNE infrastructure, invoice by invoice.
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStepContent = () => {
        switch (stepId) {
            case 'onboarding': return renderOnboarding();
            case 'connection': return renderConnection();
            case 'dashboard': return renderDashboard();
            case 'timelapse': return renderTimelapse();
            case 'analysis': return renderAnalysis();
            case 'expansion': return renderExpansion();
            default: return renderOnboarding();
        }
    };

    return (
        <div className="demo-view" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
            {/* Phase Navigation */}
            <div className="demo-nav" style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                {steps.map((id, index) => {
                    const isActive = stepId === id;
                    const isCompleted = steps.indexOf(stepId) > index;
                    return (
                        <div
                            key={id}
                            onClick={() => setStepId(id)}
                            style={{
                                flex: 1,
                                height: '6px',
                                background: isActive ? 'var(--primary)' : isCompleted ? 'var(--primary-light)' : 'var(--border-light)',
                                borderRadius: '3px',
                                transition: 'all 0.3s',
                                cursor: 'pointer'
                            }}
                        />
                    );
                })}
            </div>

            <div className="demo-stage" style={{ minHeight: '650px', background: 'var(--bg-card)', padding: '60px', borderRadius: '32px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
                {renderStepContent()}
            </div>

            <div className="demo-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
                <button
                    className="btn btn-ghost"
                    onClick={prevStep}
                    disabled={stepId === 'onboarding'}
                    style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem' }}
                >
                    <ChevronLeft size={20} /> <span style={{ opacity: 0.6 }}>PREVIOUS</span>
                </button>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        STEP {steps.indexOf(stepId) + 1} OF {steps.length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>
                        {stepId.toUpperCase()}
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={nextStep}
                    disabled={stepId === 'expansion'}
                    style={{ padding: '12px 48px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.2rem', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
                >
                    <span>{stepId === 'expansion' ? 'READY' : 'NEXT STEP'}</span>
                    <ChevronRight size={24} />
                </button>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.4; }
                    100% { opacity: 1; }
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
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
