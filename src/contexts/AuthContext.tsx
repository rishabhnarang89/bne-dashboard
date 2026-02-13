import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type AuthUser = 'rishabh' | 'tung' | 'johannes';

export interface UserProfile {
    id: AuthUser;
    name: string;
    emoji: string;
    color: string;
    bg: string;
}

export const USER_PROFILES: Record<AuthUser, UserProfile> = {
    rishabh: { id: 'rishabh', name: 'Rishabh', emoji: '👨‍💻', color: '#3b82f6', bg: '#eff6ff' },
    tung: { id: 'tung', name: 'Tung', emoji: '🎯', color: '#8b5cf6', bg: '#f5f3ff' },
    johannes: { id: 'johannes', name: 'Johannes', emoji: '🔬', color: '#f59e0b', bg: '#fffbeb' }
};

// Simple credentials (client-side only)
const CREDENTIALS: Record<string, string> = {
    rishabh: 'bne2026',
    tung: 'bne2026',
    johannes: 'bne2026'
};

// ============================================================================
// CONTEXT
// ============================================================================

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => { success: boolean; error?: string };
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

// ============================================================================
// PROVIDER
// ============================================================================

const STORAGE_KEY = 'bne_auth_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const userId = JSON.parse(saved) as AuthUser;
                return USER_PROFILES[userId] || null;
            }
        } catch { /* ignore */ }
        return null;
    });

    const login = useCallback((username: string, password: string) => {
        const normalizedUser = username.toLowerCase().trim();
        const expectedPassword = CREDENTIALS[normalizedUser];

        if (!expectedPassword) {
            return { success: false, error: 'User not found' };
        }
        if (password !== expectedPassword) {
            return { success: false, error: 'Invalid password' };
        }

        const profile = USER_PROFILES[normalizedUser as AuthUser];
        setUser(profile);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
        return { success: true };
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
