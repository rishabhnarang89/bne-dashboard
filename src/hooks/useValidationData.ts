import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export type TeamMember = 'rishabh' | 'tung' | 'both';

export interface Task {
    id: string;
    title: string;
    notes?: string;
    weekId: number;
    priority: 'high' | 'medium' | 'low';
    dueDate?: string;
    completed: boolean;
    completedAt?: string;
    createdAt: string;
    isDefault: boolean;
    subtasks: Subtask[];
    linkedInterviewId?: number;
    assignee?: TeamMember;
}

export interface Subtask {
    id: string;
    text: string;
    done: boolean;
}

// Teacher CRM (Contact Management)
export type TeacherStatus = 'identified' | 'request_sent' | 'connected' | 'scheduled' | 'interviewed' | 'follow_up';
export type ContactMethod = 'linkedin' | 'email' | 'phone' | 'in-person' | 'other';

export interface Teacher {
    id: number;
    name: string;
    designation?: string;
    department?: string;
    school: string;
    schoolType: 'Gymnasium' | 'Realschule' | 'Gesamtschule' | 'Grundschule' | 'Other';
    email?: string;
    linkedinUrl?: string;
    requestSentDate?: string;
    status: TeacherStatus;
    notes?: string;
    createdAt: string;

    // Outreach tracking fields
    contactMethod?: ContactMethod;
    responseDate?: string;           // When they first responded
    lastContactDate?: string;        // Last outreach attempt
    nextFollowUpDate?: string;       // Scheduled follow-up
    linkedinMessageSent?: boolean;   // Track if LinkedIn message sent
    emailSent?: boolean;             // Track if email sent
    phoneCallMade?: boolean;         // Track if phone call made
}

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled';

export interface InterviewQuestion {
    id: string;
    question: string;
    answer?: string;
    remarks?: string;
}

export interface Interview {
    id: number;
    teacherId: number;  // Link to teacher
    date: string;
    scheduledDate?: string;
    status: InterviewStatus;
    duration?: 30 | 45 | 60;  // Interview duration in minutes
    timeSpent?: number;        // Actual time spent in seconds
    setupTime: number;
    success: 'yes' | 'no';
    score: number;
    commitment: 'none' | 'maybe' | 'pilot';
    priceReaction: 'positive' | 'neutral' | 'negative';
    notes?: string;
    questions?: InterviewQuestion[];  // Structured questionnaire responses
    keyInsights?: string[];
}

export interface WeeklyReflection {
    id: number;
    weekNumber: number;
    date: string;
    summary: string;
    lessonsLearned: string;
    nextWeekGoals: string;
}

export interface GoalSettings {
    targetInterviews: number;
    targetHighScores: number;
    targetPilots: number;
    targetSetupTime: number;
    pricePoint: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const SPRINT_START = new Date('2026-01-23');
export const SPRINT_END = new Date('2026-02-20');
export const DECISION_DATE = new Date('2026-02-20');

export const WEEKS = [
    { id: 1, title: "Week 1: Outreach & Prep", dates: "Jan 23-29", startDate: '2026-01-23', endDate: '2026-01-29' },
    { id: 2, title: "Week 2-3: Teacher Interviews", dates: "Jan 30 - Feb 12", startDate: '2026-01-30', endDate: '2026-02-12' },
    { id: 4, title: "Week 4: Analysis & Decision", dates: "Feb 13-20", startDate: '2026-02-13', endDate: '2026-02-20' }
];

export const DEFAULT_QUESTIONS: InterviewQuestion[] = [
    // TEIL 1: AKTUELLE SITUATION
    { id: 'q1', question: 'Q1: Wie oft nutzen Sie digitale Messgeräte oder IoT-Kits (z.B. Arduino, senseBox) aktuell im Unterricht?', answer: '', remarks: '' },
    { id: 'q2', question: 'Q2: Was sind die größten Hindernisse bei der Nutzung dieser Geräte?', answer: '', remarks: '' },
    { id: 'q3', question: 'Q3: Wie viel Vorbereitungszeit benötigen Sie typischerweise für eine IoT-Unterrichtsstunde?', answer: '', remarks: '' },

    // TEIL 2: BNE-MANDATE
    { id: 'q4', question: 'Q4: Wie stark fühlen Sie sich durch die BNE-Vorgaben (Bildung für nachhaltige Entwicklung) unter Druck gesetzt, praktische Projekte umzusetzen? (1=Gar nicht, 5=Sehr stark)', answer: '', remarks: '' },
    { id: 'q5', question: 'Q5: Welche BNE-Themen sind für Ihren Unterricht am relevantesten? (max. 3)', answer: '', remarks: '' },
    { id: 'q6', question: 'Q6: Wäre ein System hilfreich, das Klimadaten (CO₂, Bodenfeuchte) OHNE IT-Freigabe direkt im Klassenzimmer visualisiert?', answer: '', remarks: '' },

    // TEIL 3: "SOVEREIGN" LÖSUNG
    { id: 'q7', question: 'Q7: Wie wichtig ist es Ihnen, dass Schülerdaten das Schulgebäude niemals verlassen (100% Offline-Betrieb, keine Cloud)?', answer: '', remarks: '' },
    { id: 'q8', question: 'Q8: Würden Sie ein System bevorzugen, das per QR-Code sofort einsatzbereit ist (unter 60 Sekunden Setup, ohne Account)?', answer: '', remarks: '' },
    { id: 'q9', question: 'Q9: Welche Features wären für Sie am wichtigsten? (Bitte nummerieren: 1=wichtigste, 5=unwichtigste)', answer: '', remarks: '' },

    // TEIL 4: BUDGET & COMMITMENT
    { id: 'q10', question: 'Q10: Über welches Budget verfügen Sie für solche Anschaffungen pro Klassensatz?', answer: '', remarks: '' },
    { id: 'q11', question: 'Q11: Was wäre ein realistischer Preis pro Klassensatz (6-8 Sensoren + Hub)?', answer: '', remarks: '' },
    { id: 'q12', question: 'Q12: Wären Sie bereit, als Pilotschule an einer 4-wöchigen Testphase teilzunehmen (kostenlos)?', answer: '', remarks: '' },
    { id: 'q13', question: 'Q13: Falls ja zu Q12 - Bitte hinterlassen Sie Ihre Kontaktdaten (Name, Schule, Email, Unterrichtsfächer, Telefon)', answer: '', remarks: '' },

    // TEIL 5: OFFENES FEEDBACK
    { id: 'q14', question: 'Q14: Was würde Sie davon abhalten, dieses System zu nutzen?', answer: '', remarks: '' },
    { id: 'q15', question: 'Q15: Welche zusätzlichen Features wären für Sie wichtig?', answer: '', remarks: '' }
];

const DEFAULT_GOALS: GoalSettings = {
    targetInterviews: 10,
    targetHighScores: 5,
    targetPilots: 3,
    targetSetupTime: 180,
    pricePoint: 180
};

// Default tasks - Week 1 assigned to Tung (outreach & prep while Rishabh travels)
const createDefaultTasks = (): Task[] => [
    // WEEK 1: Outreach & Prep (Tung - non-tech tasks)
    { id: 'w1_t1', title: "Review customer profile sheet in Google Drive", weekId: 1, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung', notes: 'Understand our ideal customer profile: school type, teacher demographics, pain points' },
    { id: 'w1_t2', title: "Identify 30 target teachers (from profile criteria)", weekId: 1, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung', notes: 'Use LinkedIn, school websites, and education forums. Focus on STEM teachers in Gymnasium & Gesamtschule' },
    { id: 'w1_t3', title: "Create LinkedIn connection request templates (3 variants)", weekId: 1, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung', notes: 'A/B test different approaches: BNE focus, sustainability angle, tech innovation angle' },
    { id: 'w1_t4', title: "Draft interview outreach email template", weekId: 1, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung', notes: 'Professional, concise, emphasize 15-min commitment and value for schools' },
    { id: 'w1_t5', title: "Send first batch of LinkedIn connection requests (15)", weekId: 1, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung' },
    { id: 'w1_t6', title: "Research school email formats for cold outreach", weekId: 1, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung', notes: 'Common patterns: vorname.nachname@schule.de, info@schule.de, sekretariat@schule.de' },
    { id: 'w1_t7', title: "Create tracking spreadsheet for outreach pipeline", weekId: 1, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung', notes: 'Columns: Name, School, Contact Method, Status, Response Date, Notes' },
    { id: 'w1_t8', title: "Send second batch of LinkedIn requests (15)", weekId: 1, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung' },
    // WEEK 2-3: Interviews (Both)
    { id: 'w2_t1', title: "Complete Interview #1", weekId: 2, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    { id: 'w2_t2', title: "Complete Interview #2", weekId: 2, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    { id: 'w2_t3', title: "Complete Interview #3", weekId: 2, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    { id: 'w2_t4', title: "Complete Interview #4", weekId: 2, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    { id: 'w2_t5', title: "Complete Interview #5 (Mid-point)", weekId: 2, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    { id: 'w2_t6', title: "Complete Interview #6", weekId: 2, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    { id: 'w2_t7', title: "Complete Interview #7", weekId: 2, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    { id: 'w2_t8', title: "Complete Interview #8", weekId: 2, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    { id: 'w2_t9', title: "Complete Interview #9", weekId: 2, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    { id: 'w2_t10', title: "Complete Interview #10", weekId: 2, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    // WEEK 4: Analysis
    { id: 'w4_t1', title: "Compile quantitative metrics", weekId: 4, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'rishabh' },
    { id: 'w4_t2', title: "Draft recommendations document", weekId: 4, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    { id: 'w4_t3', title: "Prepare Pitch Deck for meeting", weekId: 4, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'rishabh' },
    { id: 'w4_t4', title: "Hold Go/No-Go Decision Meeting (Feb 9)", weekId: 4, priority: 'high', dueDate: '2026-02-09', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
];

// ============================================================================
// SUPABASE HELPERS
// ============================================================================

// Convert from camelCase to snake_case for Supabase
const toDbTask = (task: Task) => ({
    id: task.id,
    title: task.title,
    notes: task.notes || null,
    week_id: task.weekId,
    priority: task.priority,
    due_date: task.dueDate || null,
    completed: task.completed,
    completed_at: task.completedAt || null,
    created_at: task.createdAt,
    is_default: task.isDefault,
    subtasks: task.subtasks,
    linked_interview_id: task.linkedInterviewId || null,
    assignee: task.assignee || null
});

// Convert from snake_case to camelCase for app
const fromDbTask = (db: any): Task => ({
    id: db.id,
    title: db.title,
    notes: db.notes || undefined,
    weekId: db.week_id,
    priority: db.priority,
    dueDate: db.due_date || undefined,
    completed: db.completed,
    completedAt: db.completed_at || undefined,
    createdAt: db.created_at,
    isDefault: db.is_default,
    subtasks: db.subtasks || [],
    linkedInterviewId: db.linked_interview_id || undefined,
    assignee: db.assignee || undefined
});

const toDbInterview = (i: Interview) => ({
    id: i.id,
    teacher_id: i.teacherId,
    date: i.date,
    scheduled_date: i.scheduledDate || null,
    status: i.status,
    duration: i.duration || null,
    time_spent: i.timeSpent || null,
    setup_time: i.setupTime,
    success: i.success,
    score: i.score,
    commitment: i.commitment,
    price_reaction: i.priceReaction,
    notes: i.notes || null,
    questions: i.questions || null,
    key_insights: i.keyInsights || null
});

const fromDbInterview = (db: any): Interview => ({
    id: db.id,
    teacherId: db.teacher_id,
    date: db.date,
    scheduledDate: db.scheduled_date || undefined,
    status: db.status || 'completed',
    duration: db.duration || undefined,
    timeSpent: db.time_spent || undefined,
    setupTime: db.setup_time,
    success: db.success,
    score: db.score,
    commitment: db.commitment,
    priceReaction: db.price_reaction,
    notes: db.notes || undefined,
    questions: db.questions || undefined,
    keyInsights: db.key_insights || undefined
});

const toDbTeacher = (t: Teacher) => ({
    id: t.id,
    name: t.name,
    designation: t.designation || null,
    department: t.department || null,
    school: t.school,
    school_type: t.schoolType,
    email: t.email || null,
    linkedin_url: t.linkedinUrl || null,
    request_sent_date: t.requestSentDate || null,
    status: t.status,
    notes: t.notes || null,
    created_at: t.createdAt,
    // Outreach tracking fields
    contact_method: t.contactMethod || null,
    response_date: t.responseDate || null,
    last_contact_date: t.lastContactDate || null,
    next_follow_up_date: t.nextFollowUpDate || null,
    linkedin_message_sent: t.linkedinMessageSent || false,
    email_sent: t.emailSent || false,
    phone_call_made: t.phoneCallMade || false
});

const fromDbTeacher = (db: any): Teacher => ({
    id: db.id,
    name: db.name,
    designation: db.designation || undefined,
    department: db.department || undefined,
    school: db.school,
    schoolType: db.school_type,
    email: db.email || undefined,
    linkedinUrl: db.linkedin_url || undefined,
    requestSentDate: db.request_sent_date || undefined,
    status: db.status,
    notes: db.notes || undefined,
    createdAt: db.created_at,
    // Outreach tracking fields
    contactMethod: db.contact_method || undefined,
    responseDate: db.response_date || undefined,
    lastContactDate: db.last_contact_date || undefined,
    nextFollowUpDate: db.next_follow_up_date || undefined,
    linkedinMessageSent: db.linkedin_message_sent || false,
    emailSent: db.email_sent || false,
    phoneCallMade: db.phone_call_made || false
});

const toDbGoals = (g: GoalSettings) => ({
    id: 1, // Single row for goals
    target_interviews: g.targetInterviews,
    target_high_scores: g.targetHighScores,
    target_pilots: g.targetPilots,
    target_setup_time: g.targetSetupTime,
    price_point: g.pricePoint
});

const fromDbGoals = (db: any): GoalSettings => ({
    targetInterviews: db.target_interviews,
    targetHighScores: db.target_high_scores,
    targetPilots: db.target_pilots,
    targetSetupTime: db.target_setup_time,
    pricePoint: db.price_point
});

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useValidationData() {
    const [isOnline, setIsOnline] = useState(isSupabaseConfigured());
    const [isLoading, setIsLoading] = useState(true);
    const [syncError, setSyncError] = useState<string | null>(null);

    // State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [reflections, setReflections] = useState<WeeklyReflection[]>([]);
    const [goals, setGoals] = useState<GoalSettings>(DEFAULT_GOALS);
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [lastActivity, setLastActivity] = useState<string>(new Date().toISOString());

    // ========================================================================
    // INITIAL DATA LOAD
    // ========================================================================

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            if (isSupabaseConfigured()) {
                // Load from Supabase
                try {
                    const [tasksRes, teachersRes, interviewsRes, goalsRes] = await Promise.all([
                        supabase.from('tasks').select('*'),
                        supabase.from('teachers').select('*'),
                        supabase.from('interviews').select('*'),
                        supabase.from('goals').select('*').single()
                    ]);

                    if (tasksRes.error) throw tasksRes.error;

                    // If no tasks exist, initialize with defaults
                    if (tasksRes.data.length === 0) {
                        const defaultTasks = createDefaultTasks();
                        await supabase.from('tasks').insert(defaultTasks.map(toDbTask));
                        setTasks(defaultTasks);
                    } else {
                        setTasks(tasksRes.data.map(fromDbTask));
                    }

                    // Load teachers
                    if (!teachersRes.error && teachersRes.data) {
                        setTeachers(teachersRes.data.map(fromDbTeacher));
                    }

                    // Load interviews
                    if (!interviewsRes.error && interviewsRes.data) {
                        setInterviews(interviewsRes.data.map(fromDbInterview));
                    }

                    if (goalsRes.data) {
                        setGoals(fromDbGoals(goalsRes.data));
                    } else {
                        // Initialize goals
                        await supabase.from('goals').insert(toDbGoals(DEFAULT_GOALS));
                    }

                    setIsOnline(true);
                    setSyncError(null);
                } catch (error: any) {
                    console.error('Supabase load error:', error);
                    setSyncError(error.message);
                    setIsOnline(false);
                    // Fall back to localStorage
                    loadFromLocalStorage();
                }
            } else {
                // Load from localStorage
                loadFromLocalStorage();
            }

            setIsLoading(false);
        };

        const loadFromLocalStorage = () => {
            // Tasks
            const savedTasks = localStorage.getItem('bne_tasks_v2');
            if (savedTasks) {
                setTasks(JSON.parse(savedTasks));
            } else {
                const oldTasks = localStorage.getItem('bne_tasks');
                if (oldTasks) {
                    const oldData = JSON.parse(oldTasks);
                    const defaultTasks = createDefaultTasks().map(t => ({ ...t, completed: oldData[t.id] || false }));
                    setTasks(defaultTasks);
                } else {
                    setTasks(createDefaultTasks());
                }
            }

            // Interviews
            const savedInterviews = localStorage.getItem('bne_interviews_v2');
            if (savedInterviews) {
                setInterviews(JSON.parse(savedInterviews));
            }

            // Teachers
            const savedTeachers = localStorage.getItem('bne_teachers');
            if (savedTeachers) {
                setTeachers(JSON.parse(savedTeachers));
            }

            // Goals
            const savedGoals = localStorage.getItem('bne_goals');
            if (savedGoals) setGoals(JSON.parse(savedGoals));

            // Dark mode
            const savedDarkMode = localStorage.getItem('bne_darkMode');
            if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));

            // Last activity
            const savedLastActivity = localStorage.getItem('bne_lastActivity');
            if (savedLastActivity) setLastActivity(savedLastActivity);
        };

        loadData();
    }, []);

    // ========================================================================
    // REAL-TIME SUBSCRIPTIONS (Supabase)
    // ========================================================================

    useEffect(() => {
        if (!isSupabaseConfigured()) return;

        const tasksSubscription = supabase
            .channel('tasks-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTasks(prev => [...prev.filter(t => t.id !== payload.new.id), fromDbTask(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    setTasks(prev => prev.map(t => t.id === payload.new.id ? fromDbTask(payload.new) : t));
                } else if (payload.eventType === 'DELETE') {
                    setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                }
            })
            .subscribe();

        const interviewsSubscription = supabase
            .channel('interviews-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'interviews' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setInterviews(prev => [...prev.filter(i => i.id !== payload.new.id), fromDbInterview(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    setInterviews(prev => prev.map(i => i.id === payload.new.id ? fromDbInterview(payload.new) : i));
                } else if (payload.eventType === 'DELETE') {
                    setInterviews(prev => prev.filter(i => i.id !== payload.old.id));
                }
            })
            .subscribe();

        const goalsSubscription = supabase
            .channel('goals-changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'goals' }, (payload) => {
                setGoals(fromDbGoals(payload.new));
            })
            .subscribe();

        return () => {
            tasksSubscription.unsubscribe();
            interviewsSubscription.unsubscribe();
            goalsSubscription.unsubscribe();
        };
    }, []);

    // ========================================================================
    // PERSIST TO LOCALSTORAGE (always, as backup)
    // ========================================================================

    useEffect(() => { localStorage.setItem('bne_tasks_v2', JSON.stringify(tasks)); }, [tasks]);
    useEffect(() => { localStorage.setItem('bne_interviews', JSON.stringify(interviews)); }, [interviews]);
    useEffect(() => { localStorage.setItem('bne_goals', JSON.stringify(goals)); }, [goals]);
    useEffect(() => {
        localStorage.setItem('bne_darkMode', JSON.stringify(darkMode));
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);
    useEffect(() => { localStorage.setItem('bne_lastActivity', lastActivity); }, [lastActivity]);

    // ========================================================================
    // TASK ACTIONS
    // ========================================================================

    const toggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const updates = {
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : undefined
        };

        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        setLastActivity(new Date().toISOString());

        if (isOnline) {
            const { error } = await supabase.from('tasks').update({
                completed: updates.completed,
                completed_at: updates.completedAt || null
            }).eq('id', id);
            if (error) console.error('Sync error:', error);
        }
    };

    const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'isDefault' | 'subtasks'>) => {
        const newTask: Task = {
            ...taskData,
            id: `custom_${Date.now()}`,
            createdAt: new Date().toISOString(),
            isDefault: false,
            subtasks: []
        };

        setTasks(prev => [...prev, newTask]);
        setLastActivity(new Date().toISOString());

        if (isOnline) {
            const { error } = await supabase.from('tasks').insert(toDbTask(newTask));
            if (error) console.error('Sync error:', error);
        }

        return newTask;
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        setLastActivity(new Date().toISOString());

        if (isOnline) {
            const dbUpdates: any = {};
            if (updates.title !== undefined) dbUpdates.title = updates.title;
            if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
            if (updates.weekId !== undefined) dbUpdates.week_id = updates.weekId;
            if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
            if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate || null;
            if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
            if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
            if (updates.assignee !== undefined) dbUpdates.assignee = updates.assignee || null;
            if (updates.linkedInterviewId !== undefined) dbUpdates.linked_interview_id = updates.linkedInterviewId || null;

            const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
            if (error) console.error('Sync error:', error);
        }
    };

    const deleteTask = async (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));

        if (isOnline) {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) console.error('Sync error:', error);
        }
    };

    const moveTask = (id: string, newWeekId: number) => updateTask(id, { weekId: newWeekId });

    const addSubtask = (taskId: string, text: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            updateTask(taskId, { subtasks: [...task.subtasks, { id: `sub_${Date.now()}`, text, done: false }] });
        }
    };

    const toggleSubtask = (taskId: string, subtaskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            updateTask(taskId, {
                subtasks: task.subtasks.map(st => st.id === subtaskId ? { ...st, done: !st.done } : st)
            });
        }
    };

    const deleteSubtask = (taskId: string, subtaskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            updateTask(taskId, { subtasks: task.subtasks.filter(st => st.id !== subtaskId) });
        }
    };

    // ========================================================================
    // TEACHER ACTIONS (CRM)
    // ========================================================================

    const addTeacher = async (teacher: Omit<Teacher, 'id' | 'createdAt'>) => {
        const newTeacher: Teacher = {
            ...teacher,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };
        setTeachers(prev => [...prev, newTeacher]);
        setLastActivity(new Date().toISOString());

        if (isOnline) {
            const { error } = await supabase.from('teachers').insert(toDbTeacher(newTeacher));
            if (error) console.error('Sync error:', error);
        }
    };

    const updateTeacher = async (id: number, updates: Partial<Teacher>) => {
        setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        setLastActivity(new Date().toISOString());

        if (isOnline) {
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.designation !== undefined) dbUpdates.designation = updates.designation || null;
            if (updates.department !== undefined) dbUpdates.department = updates.department || null;
            if (updates.school !== undefined) dbUpdates.school = updates.school;
            if (updates.schoolType !== undefined) dbUpdates.school_type = updates.schoolType;
            if (updates.email !== undefined) dbUpdates.email = updates.email || null;
            if (updates.linkedinUrl !== undefined) dbUpdates.linkedin_url = updates.linkedinUrl || null;
            if (updates.requestSentDate !== undefined) dbUpdates.request_sent_date = updates.requestSentDate || null;
            if (updates.status !== undefined) dbUpdates.status = updates.status;
            if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;

            const { error } = await supabase.from('teachers').update(dbUpdates).eq('id', id);
            if (error) console.error('Sync error:', error);
        }
    };

    const deleteTeacher = async (id: number) => {
        setTeachers(prev => prev.filter(t => t.id !== id));
        // Also delete associated interviews
        const teacherInterviews = interviews.filter(i => i.teacherId === id);
        for (const interview of teacherInterviews) {
            await deleteInterview(interview.id);
        }

        if (isOnline) {
            const { error } = await supabase.from('teachers').delete().eq('id', id);
            if (error) console.error('Sync error:', error);
        }
    };

    const getTeacherById = (id: number) => teachers.find(t => t.id === id);
    const getInterviewsByTeacher = (teacherId: number) => interviews.filter(i => i.teacherId === teacherId);

    // ========================================================================
    // INTERVIEW ACTIONS
    // ========================================================================

    const addInterview = async (interview: Omit<Interview, 'id'>) => {
        const newInterview = { ...interview, id: Date.now() };
        setInterviews(prev => [...prev, newInterview]);
        setLastActivity(new Date().toISOString());

        // Update teacher status to 'interviewed'
        const teacher = teachers.find(t => t.id === interview.teacherId);
        if (teacher && teacher.status !== 'interviewed') {
            updateTeacher(teacher.id, { status: 'interviewed' });
        }

        if (isOnline) {
            const { error } = await supabase.from('interviews').insert(toDbInterview(newInterview));
            if (error) console.error('Sync error:', error);
        }
    };

    const updateInterview = async (id: number, updates: Partial<Interview>) => {
        setInterviews(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
        setLastActivity(new Date().toISOString());

        if (isOnline) {
            const dbUpdates: any = {};
            if (updates.teacherId !== undefined) dbUpdates.teacher_id = updates.teacherId;
            if (updates.status !== undefined) dbUpdates.status = updates.status;
            if (updates.setupTime !== undefined) dbUpdates.setup_time = updates.setupTime;
            if (updates.score !== undefined) dbUpdates.score = updates.score;
            if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
            if (updates.commitment !== undefined) dbUpdates.commitment = updates.commitment;
            if (updates.priceReaction !== undefined) dbUpdates.price_reaction = updates.priceReaction;
            if (updates.success !== undefined) dbUpdates.success = updates.success;

            const { error } = await supabase.from('interviews').update(dbUpdates).eq('id', id);
            if (error) console.error('Sync error:', error);
        }
    };

    const deleteInterview = async (id: number) => {
        setInterviews(prev => prev.filter(i => i.id !== id));

        if (isOnline) {
            const { error } = await supabase.from('interviews').delete().eq('id', id);
            if (error) console.error('Sync error:', error);
        }
    };

    // ========================================================================
    // GOALS & OTHER ACTIONS
    // ========================================================================

    const addReflection = (reflection: Omit<WeeklyReflection, 'id'>) => {
        const newReflection = { ...reflection, id: Date.now() };
        setReflections(prev => [...prev, newReflection]);
    };

    const updateGoals = async (newGoals: Partial<GoalSettings>) => {
        const merged = { ...goals, ...newGoals };
        setGoals(merged);

        if (isOnline) {
            const { error } = await supabase.from('goals').upsert(toDbGoals(merged));
            if (error) console.error('Sync error:', error);
        }
    };

    const clearData = async () => {
        setTasks(createDefaultTasks());
        setInterviews([]);
        setReflections([]);

        if (isOnline) {
            await Promise.all([
                supabase.from('tasks').delete().neq('id', 'x'),
                supabase.from('interviews').delete().neq('id', 0),
                supabase.from('tasks').insert(createDefaultTasks().map(toDbTask))
            ]);
        }
    };

    // ========================================================================
    // EXPORT / IMPORT
    // ========================================================================

    const exportData = useCallback(() => {
        const data = { tasks, interviews, reflections, goals, exportedAt: new Date().toISOString(), version: '2.0' };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bne-validation-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [tasks, interviews, reflections, goals]);

    const exportInterviewsCSV = useCallback(() => {
        const headers = ['Teacher Name', 'School', 'School Type', 'Date', 'Status', 'Setup Time', 'Success', 'Score', 'Commitment', 'Price Reaction', 'Notes'];
        const rows = interviews.map(i => {
            const teacher = teachers.find(t => t.id === i.teacherId);
            return [
                teacher?.name || 'Unknown',
                teacher?.school || '',
                teacher?.schoolType || '',
                i.date,
                i.status,
                i.setupTime,
                i.success,
                i.score,
                i.commitment,
                i.priceReaction,
                `"${(i.notes || '').replace(/"/g, '""')}"`
            ];
        });
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bne-interviews-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [interviews, teachers]);

    const importData = useCallback(async (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.tasks) setTasks(data.tasks);
                if (data.interviews) setInterviews(data.interviews);
                if (data.reflections) setReflections(data.reflections);
                if (data.goals) setGoals(data.goals);

                // Sync to Supabase if online
                if (isOnline) {
                    await supabase.from('tasks').delete().neq('id', 'x');
                    await supabase.from('interviews').delete().neq('id', 0);
                    if (data.tasks) await supabase.from('tasks').insert(data.tasks.map(toDbTask));
                    if (data.interviews) await supabase.from('interviews').insert(data.interviews.map(toDbInterview));
                    if (data.goals) await supabase.from('goals').upsert(toDbGoals(data.goals));
                }
            } catch (err) {
                console.error('Failed to import data:', err);
            }
        };
        reader.readAsText(file);
    }, [isOnline]);

    // ========================================================================
    // COMPUTED VALUES
    // ========================================================================

    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const avgScore = completedInterviews.length > 0 ? completedInterviews.reduce((a, b) => a + b.score, 0) / completedInterviews.length : 0;
    const avgSetupTime = completedInterviews.length > 0 ? completedInterviews.reduce((a, b) => a + b.setupTime, 0) / completedInterviews.length : 0;
    const pilotCount = completedInterviews.filter(i => i.commitment === 'pilot').length;
    const highScoreCount = completedInterviews.filter(i => i.score >= 8).length;
    const daysUntilDecision = Math.ceil((DECISION_DATE.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceLastActivity = Math.floor((new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));

    const getCurrentWeek = () => {
        const now = new Date();
        const daysSinceStart = Math.floor((now.getTime() - SPRINT_START.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceStart < 0) return 0;
        if (daysSinceStart < 7) return 1;
        if (daysSinceStart < 21) return 2;
        return 4;
    };

    const getTasksByWeek = (weekId: number) => tasks.filter(t => t.weekId === weekId);
    const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date());
    const todayTasks = tasks.filter(t => !t.completed && t.dueDate === new Date().toISOString().split('T')[0]);

    // ========================================================================
    // RETURN
    // ========================================================================

    return {
        // Status
        isOnline, isLoading, syncError,

        // Tasks
        tasks, toggleTask, addTask, updateTask, deleteTask, moveTask,
        addSubtask, toggleSubtask, deleteSubtask,
        getTasksByWeek, overdueTasks, todayTasks,

        // Teachers (CRM)
        teachers, addTeacher, updateTeacher, deleteTeacher,
        getTeacherById, getInterviewsByTeacher,

        // Interviews
        interviews, addInterview, updateInterview, deleteInterview,

        // Other
        reflections, addReflection,
        goals, updateGoals,
        darkMode, setDarkMode,
        clearData, exportData, exportInterviewsCSV, importData,

        // Computed
        completedInterviews, avgScore, avgSetupTime, pilotCount, highScoreCount,
        daysUntilDecision, daysSinceLastActivity, getCurrentWeek,

        // Constants
        SPRINT_START, SPRINT_END, DECISION_DATE
    };
}
