import { useState } from 'react';
import { useAuth, USER_PROFILES } from '../../contexts/AuthContext';
import { Lock, LogIn, AlertCircle } from 'lucide-react';

export const LoginScreen = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Small delay for feel
        setTimeout(() => {
            const result = login(username, password);
            if (!result.success) {
                setError(result.error || 'Login failed');
            }
            setIsLoading(false);
        }, 400);
    };

    const users = Object.values(USER_PROFILES);

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: '20px'
        }}>
            {/* Ambient glow */}
            <div style={{
                position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
                width: '600px', height: '600px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{
                width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
                    }}>
                        <Lock size={28} color="white" />
                    </div>
                    <h1 style={{
                        color: 'white', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px'
                    }}>
                        BNE Validation Hub
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Login Card */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(20px)',
                    borderRadius: '16px', padding: '32px',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                }}>
                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block', color: '#94a3b8', fontSize: '0.8rem',
                                fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => { setUsername(e.target.value); setError(''); }}
                                placeholder="Enter your name"
                                autoFocus
                                autoComplete="username"
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '10px',
                                    background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)',
                                    color: 'white', fontSize: '0.95rem', outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = '#6366f1'}
                                onBlur={e => e.target.style.borderColor = 'rgba(148, 163, 184, 0.15)'}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block', color: '#94a3b8', fontSize: '0.8rem',
                                fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '10px',
                                    background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)',
                                    color: 'white', fontSize: '0.95rem', outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = '#6366f1'}
                                onBlur={e => e.target.style.borderColor = 'rgba(148, 163, 184, 0.15)'}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 14px', borderRadius: '8px',
                                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#f87171', fontSize: '0.85rem', marginBottom: '20px'
                            }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !username || !password}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '10px',
                                background: isLoading ? '#4f46e5' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white', fontSize: '0.95rem', fontWeight: 700,
                                border: 'none', cursor: isLoading ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'opacity 0.2s, transform 0.1s',
                                opacity: (!username || !password) ? 0.5 : 1,
                                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
                            }}
                        >
                            {isLoading ? (
                                <div style={{
                                    width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white', borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }} />
                            ) : (
                                <><LogIn size={18} /> Sign In</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Team Avatars */}
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: '16px',
                    marginTop: '24px'
                }}>
                    {users.map(u => (
                        <button
                            key={u.id}
                            onClick={() => setUsername(u.name.toLowerCase())}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                background: username.toLowerCase() === u.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                border: username.toLowerCase() === u.id
                                    ? '1px solid rgba(99, 102, 241, 0.3)'
                                    : '1px solid transparent',
                                borderRadius: '12px', padding: '12px 16px', cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{u.emoji}</span>
                            <span style={{
                                fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600
                            }}>{u.name}</span>
                        </button>
                    ))}
                </div>

                {/* Spin animation */}
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        </div>
    );
};
