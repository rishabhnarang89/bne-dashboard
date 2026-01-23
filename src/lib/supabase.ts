import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These will be replaced with your actual Supabase project credentials
// You'll get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
    return SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';
};

// Only create the client if we have valid credentials
// Using a placeholder URL when not configured to prevent crashes
export const supabase: SupabaseClient = isSupabaseConfigured()
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Database types for TypeScript
export interface DbTask {
    id: string;
    title: string;
    notes: string | null;
    week_id: number;
    priority: 'high' | 'medium' | 'low';
    due_date: string | null;
    completed: boolean;
    completed_at: string | null;
    created_at: string;
    is_default: boolean;
    subtasks: { id: string; text: string; done: boolean }[];
    linked_interview_id: number | null;
}

export interface DbInterview {
    id: number;
    name: string;
    email: string | null;
    school_name: string | null;
    school_type: string;
    date: string;
    scheduled_date: string | null;
    status: 'contacted' | 'scheduled' | 'completed' | 'follow_up';
    setup_time: number;
    success: 'yes' | 'no';
    score: number;
    commitment: 'none' | 'maybe' | 'pilot';
    price_reaction: 'positive' | 'neutral' | 'negative';
    notes: string | null;
    key_insights: string[] | null;
}

export interface DbGoals {
    id: number;
    target_interviews: number;
    target_high_scores: number;
    target_pilots: number;
    target_setup_time: number;
    price_point: number;
}
