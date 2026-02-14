// D1 API Client - Replaces Supabase client
// Handles all database operations via Cloudflare Functions

const API_BASE = '/api';

// Helper to convert snake_case DB results to camelCase
const toCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(toCamelCase);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            const value = obj[key];
            acc[camelKey] = (value !== null && typeof value === 'object') ? toCamelCase(value) : value;
            return acc;
        }, {} as any);
    }
    return obj;
};

// Helper to convert camelCase to snake_case for DB
const toSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(toSnakeCase);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            acc[snakeKey] = toSnakeCase(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
};

export const d1Client = {
    tasks: {
        async getAll() {
            const res = await fetch(`${API_BASE}/tasks`);
            if (!res.ok) {
                console.error('Tasks API error:', res.status, res.statusText);
                throw new Error(`Tasks API failed: ${res.status}`);
            }
            const data = await res.json();
            return toCamelCase(data);
        },
        async create(task: any) {
            const res = await fetch(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toSnakeCase(task))
            });
            return res.json();
        },
        async update(id: string, updates: any) {
            const res = await fetch(`${API_BASE}/tasks?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toSnakeCase(updates))
            });
            return res.json();
        },
        async delete(id: string, user?: string) {
            const params = new URLSearchParams({ id });
            if (user) params.set('user', user);
            const res = await fetch(`${API_BASE}/tasks?${params}`, { method: 'DELETE' });
            return res.json();
        }
    },

    teachers: {
        async getAll() {
            const res = await fetch(`${API_BASE}/teachers`);
            const data = await res.json();
            return toCamelCase(data);
        },
        async create(teacher: any) {
            const res = await fetch(`${API_BASE}/teachers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toSnakeCase(teacher))
            });
            return res.json();
        },
        async update(id: number, updates: any) {
            const res = await fetch(`${API_BASE}/teachers?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toSnakeCase(updates))
            });
            return res.json();
        },
        async delete(id: number, user?: string) {
            const params = new URLSearchParams({ id: String(id) });
            if (user) params.set('user', user);
            const res = await fetch(`${API_BASE}/teachers?${params}`, { method: 'DELETE' });
            return res.json();
        }
    },

    interviews: {
        async getAll() {
            const res = await fetch(`${API_BASE}/interviews`);
            const data = await res.json();
            return toCamelCase(data);
        },
        async create(interview: any) {
            const res = await fetch(`${API_BASE}/interviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toSnakeCase(interview))
            });
            return res.json();
        },
        async update(id: number, updates: any) {
            const res = await fetch(`${API_BASE}/interviews?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toSnakeCase(updates))
            });
            return res.json();
        },
        async delete(id: number, user?: string) {
            const params = new URLSearchParams({ id: String(id) });
            if (user) params.set('user', user);
            const res = await fetch(`${API_BASE}/interviews?${params}`, { method: 'DELETE' });
            return res.json();
        }
    },

    goals: {
        async get() {
            const res = await fetch(`${API_BASE}/goals`);
            const data = await res.json();
            return toCamelCase(data);
        },
        async update(updates: any) {
            const res = await fetch(`${API_BASE}/goals`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toSnakeCase(updates))
            });
            return res.json();
        }
    }
};
