import { useState, useEffect, useCallback } from 'react';
import { d1Client } from '../lib/d1-client';

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

export type QuestionType = 'text' | 'single_choice' | 'multiple_choice' | 'scale';

export interface QuestionOption {
    value: string;
    label: string;
    nextQuestionId?: string;
}

export interface BranchingQuestion {
    id: string;
    question: string;
    type: QuestionType;
    options?: QuestionOption[];
    nextQuestionId?: string;
    required?: boolean;
    remarks?: boolean; // If true, show remarks field
}

// Deprecated: Legacy linear question format
export interface LegacyInterviewQuestion {
    id: string;
    question: string;
    answer?: string;
    remarks?: string;
}

export interface InterviewQuestionResponse {
    questionId: string;
    questionText: string;
    answer: string | string[];
    remarks?: string;
}

// Union for backward compatibility during migration if needed, 
// though we will try to migrate data structure.
// For the 'questions' field in Interview interface:
export type InterviewData = InterviewQuestionResponse[] | LegacyInterviewQuestion[];

export const BRANCHING_QUESTIONS: BranchingQuestion[] = [
    // TEIL 1: AKTUELLE SITUATION
    {
        id: 'q1',
        question: 'Wie oft nutzen Sie digitale Messgeräte oder IoT-Kits (z.B. Arduino, senseBox) aktuell im Unterricht?',
        type: 'single_choice',
        options: [
            { value: 'never', label: 'Nie', nextQuestionId: 'q2' },
            { value: 'rarely', label: 'Selten (1-2 mal im Jahr)', nextQuestionId: 'q2' },
            { value: 'sometimes', label: 'Gelegentlich (jedes Semester)', nextQuestionId: 'q2' },
            { value: 'often', label: 'Oft (regelmäßig)', nextQuestionId: 'q2' }
        ],
        nextQuestionId: 'q2',
        remarks: true
    },
    {
        id: 'q2',
        question: 'Was sind die größten Hindernisse bei der Nutzung dieser Geräte?',
        type: 'text',
        nextQuestionId: 'q3',
        remarks: true
    },
    {
        id: 'q3',
        question: 'Wie viel Vorbereitungszeit benötigen Sie typischerweise für eine IoT-Unterrichtsstunde?',
        type: 'text',
        nextQuestionId: 'q4',
        remarks: true
    },

    // TEIL 2: BNE-MANDATE
    {
        id: 'q4',
        question: 'Wie stark fühlen Sie sich durch die BNE-Vorgaben unter Druck gesetzt?',
        type: 'scale',
        options: [
            { value: '1', label: 'Gar nicht (1)' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: 'Sehr stark (5)' }
        ],
        nextQuestionId: 'q4_branch', // Example branching point
        remarks: true
    },
    // EXAMPLE BRANCHING QUESTION
    {
        id: 'q4_branch',
        question: 'Haben Sie bereits ein konkretes BNE-Projekt geplant?',
        type: 'single_choice',
        options: [
            { value: 'yes', label: 'Ja', nextQuestionId: 'q4_details' },
            { value: 'no', label: 'Nein', nextQuestionId: 'q5' }
        ],
        remarks: true
    },
    {
        id: 'q4_details',
        question: 'Bitte beschreiben Sie das geplante Projekt kurz:',
        type: 'text',
        nextQuestionId: 'q5',
        remarks: true
    },

    {
        id: 'q5',
        question: 'Welche BNE-Themen sind für Ihren Unterricht am relevantesten? (max. 3)',
        type: 'text',
        nextQuestionId: 'q6',
        remarks: true
    },
    {
        id: 'q6',
        question: 'Wäre ein System hilfreich, das Klimadaten OHNE IT-Freigabe direkt im Klassenzimmer visualisiert?',
        type: 'single_choice',
        options: [
            { value: 'yes', label: 'Ja' },
            { value: 'no', label: 'Nein' },
            { value: 'maybe', label: 'Vielleicht' }
        ],
        nextQuestionId: 'q7',
        remarks: true
    },

    // TEIL 3: "SOVEREIGN" LÖSUNG
    {
        id: 'q7',
        question: 'Wie wichtig ist es Ihnen, dass Schülerdaten das Schulgebäude niemals verlassen (Offline-Betrieb)?',
        type: 'scale',
        options: [
            { value: '1', label: 'Unwichtig (1)' },
            { value: '3', label: 'Neutral (3)' },
            { value: '5', label: 'Sehr wichtig (5)' }
        ],
        nextQuestionId: 'q8',
        remarks: true
    },
    {
        id: 'q8',
        question: 'Würden Sie ein System bevorzugen, das per QR-Code sofort einsatzbereit ist (< 60s Setup)?',
        type: 'single_choice',
        options: [
            { value: 'yes', label: 'Ja' },
            { value: 'no', label: 'Nein' }
        ],
        nextQuestionId: 'q9',
        remarks: true
    },
    {
        id: 'q9',
        question: 'Welche Features wären für Sie am wichtigsten? (Ranking)',
        type: 'text',
        nextQuestionId: 'q10',
        remarks: true
    },

    // TEIL 4: BUDGET & COMMITMENT
    {
        id: 'q10',
        question: 'Über welches Budget verfügen Sie für solche Anschaffungen pro Klassensatz?',
        type: 'text',
        nextQuestionId: 'q11',
        remarks: true
    },
    {
        id: 'q11',
        question: 'Was wäre ein realistischer Preis pro Klassensatz (6-8 Sensoren + Hub)?',
        type: 'text',
        nextQuestionId: 'q12',
        remarks: true
    },
    {
        id: 'q12',
        question: 'Wären Sie bereit, als Pilotschule an einer 4-wöchigen Testphase teilzunehmen?',
        type: 'single_choice',
        options: [
            { value: 'yes', label: 'Ja', nextQuestionId: 'q13' },
            { value: 'no', label: 'Nein', nextQuestionId: 'q14' } // Skip contact details if no
        ],
        nextQuestionId: 'q13',
        remarks: true
    },
    {
        id: 'q13',
        question: 'Bitte hinterlassen Sie Ihre Kontaktdaten für den Pilot:',
        type: 'text',
        nextQuestionId: 'q14',
        remarks: true
    },

    // TEIL 5: OFFENES FEEDBACK
    {
        id: 'q14',
        question: 'Was würde Sie davon abhalten, dieses System zu nutzen?',
        type: 'text',
        nextQuestionId: 'q15',
        remarks: true
    },
    {
        id: 'q15',
        question: 'Welche zusätzlichen Features wären für Sie wichtig?',
        type: 'text',
        remarks: true
    }
];

// Keep for backward compatibility types, but variable is unused
export const DEPRECATED_DEFAULT_QUESTIONS: LegacyInterviewQuestion[] = [];

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
    questions?: InterviewData;  // Structured questionnaire responses (v1 or v2)
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
    { id: 1, title: "Week 1: Outreach & Prep (Immediate)", dates: "Jan 23-29", startDate: '2026-01-23', endDate: '2026-01-29' },
    { id: 2, title: "Week 2: Interview Execution", dates: "Jan 30 - Feb 5", startDate: '2026-01-30', endDate: '2026-02-05' },
    { id: 3, title: "Week 3-4: Prototype Build", dates: "Feb 6-19", startDate: '2026-02-06', endDate: '2026-02-19' },
    { id: 4, title: "Week 5: Social Proof Package", dates: "Feb 20-26", startDate: '2026-02-20', endDate: '2026-02-26' },
    { id: 5, title: "Week 6: HM Professor Validation", dates: "Feb 27 - Mar 5", startDate: '2026-02-27', endDate: '2026-03-05' },
    { id: 6, title: "Week 7: EXIST Application Assembly", dates: "Mar 6-12", startDate: '2026-03-06', endDate: '2026-03-12' }
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
    // WEEK 1: Outreach Execution & Validation Prep
    // Outreach Execution
    { id: 'w1_t1', title: "Complete LinkedIn connection request templates (3 variants)", weekId: 1, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung', notes: 'OVERDUE, do first. A/B test different approaches.' },
    { id: 'w1_t2', title: "Draft interview outreach email template", weekId: 1, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung', notes: 'OVERDUE, critical blocker. Professional, concise, emphasize 15-min commitment.' },
    { id: 'w1_t3', title: "Create tracking spreadsheet for outreach pipeline", weekId: 1, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung', notes: 'OVERDUE, you need visibility. Columns: Name, School, Status, Notes.' },
    { id: 'w1_t4', title: "Send second batch of LinkedIn requests (15 more)", weekId: 1, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung' },
    { id: 'w1_t5', title: "Reach out to MINT21 Coordinator (Klaus Luber)", weekId: 1, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung', notes: 'OVERDUE, highest-value contact.' },
    // Validation Prep
    { id: 'w1_t6', title: "Create 2-page prototype overview PDF", weekId: 1, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'Tech specs + teacher benefits, German.' },
    { id: 'w1_t7', title: "Set up Calendly with 15-min teacher interview slots", weekId: 1, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'tung' },
    { id: 'w1_t8', title: "Draft LOI (Letter of Intent) template", weekId: 1, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: '1 page, German, non-binding commitment.' },

    // WEEK 2: Interview Execution
    { id: 'w2_t1', title: "Complete 10 teacher interviews", weekId: 2, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'Target: 10 interviews. Use tracker.' },
    { id: 'w2_t2', title: "Record interview insights template", weekId: 2, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'Pain points, willingness to pilot, budget info.' },
    { id: 'w2_t3', title: "Send prototype overview PDF to interested teachers", weekId: 2, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    { id: 'w2_t4', title: "Request LOIs from 3-5 most enthusiastic teachers", weekId: 2, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    { id: 'w2_t5', title: "Identify 1-2 'champion teachers' for deeper collaboration", weekId: 2, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },

    // WEEK 3-4: Prototype Build
    { id: 'w3_t1', title: "Order Raspberry Pi 5 + LoRa components", weekId: 3, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'rishabh', notes: 'BerryBase - do NOW, Pi 5 stock issues.' },
    { id: 'w3_t2', title: "Order sensors: SCD41, SPS30, soil moisture", weekId: 3, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'rishabh', notes: 'BerryBase/Conrad.' },
    { id: 'w3_t3', title: "Build Central Hub: Pi 5 + LoRa HAT + Ollama + Llama 3.2", weekId: 3, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'rishabh' },
    { id: 'w3_t4', title: "Assemble 2 sensor nodes (Climate + Air Quality)", weekId: 3, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'rishabh', notes: 'MVP demo units.' },
    { id: 'w3_t5', title: "Test LoRa range (500m urban target) + battery life", weekId: 3, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'rishabh' },
    { id: 'w3_t6', title: "Record 5-min demo video", weekId: 3, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'rishabh', notes: 'Unbox -> setup -> first data point -> dashboard.' },

    // WEEK 5: Social Proof Package
    { id: 'w5_t1', title: "Compile interview insights report", weekId: 4, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'Quantify pain points, % interested in pilot.' },
    { id: 'w5_t2', title: "Collect 5+ teacher quotes", weekId: 4, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'Even "this would solve X problem" counts.' },
    { id: 'w5_t3', title: "Calculate TAM", weekId: 4, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'Bayern Realschulen x MINT21 schools x €799.' },
    { id: 'w5_t4', title: "Create infographic: Teacher pain points -> BNE-Box solution", weekId: 4, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'Use Canva.' },
    { id: 'w5_t5', title: "Draft 8-slide pitch deck", weekId: 4, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'Using template from earlier conversation.' },

    // WEEK 6: HM Professor Validation
    { id: 'w6_t1', title: "Research HM München professors", weekId: 5, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'EdTech, MINT Didaktik, Sustainability (3-5 targets).' },
    { id: 'w6_t2', title: "Draft professor email", weekId: 5, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'Seeking academic feedback on BNE hardware solution.' },
    { id: 'w6_t3', title: "Schedule 30-min meeting with most responsive professor", weekId: 5, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
    { id: 'w6_t4', title: "Prepare EXIST questions", weekId: 5, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'Innovation criteria, team requirements, timeline.' },

    // WEEK 7: EXIST Application Assembly
    { id: 'w7_t1', title: "Write innovation narrative", weekId: 6, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'offline LLM + LoRa = GDPR-compliant novelty.' },
    { id: 'w7_t2', title: "Document competitive advantage", weekId: 6, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'vs. PHYWE/Vernier.' },
    { id: 'w7_t3', title: "Create 12-month milestone roadmap", weekId: 6, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'Prototype -> 10 pilots -> 100 units.' },
    { id: 'w7_t4', title: "Assemble team section", weekId: 6, priority: 'medium', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both', notes: 'Your CV + co-founders.' },
    { id: 'w7_t5', title: "Submit EXIST-Gründerstipendium application", weekId: 6, priority: 'high', completed: false, isDefault: true, createdAt: '2026-01-10', subtasks: [], assignee: 'both' },
];

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useValidationData() {
    const [isOnline, setIsOnline] = useState(true); // D1 is always available
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

            try {
                // Load from D1
                const [tasksData, teachersData, interviewsData, goalsData] = await Promise.all([
                    d1Client.tasks.getAll(),
                    d1Client.teachers.getAll(),
                    d1Client.interviews.getAll(),
                    d1Client.goals.get()
                ]);

                // Sync new default tasks if they don't exist
                const defaultTasks = createDefaultTasks();
                const existingIds = new Set(tasksData.map((t: Task) => t.id));
                const missingTasks = defaultTasks.filter(t => !existingIds.has(t.id));

                if (missingTasks.length > 0) {
                    // Add missing tasks to D1
                    for (const task of missingTasks) {
                        await d1Client.tasks.create(task);
                    }
                    // Update local state with merged tasks
                    setTasks([...tasksData, ...missingTasks]);
                } else {
                    setTasks(tasksData);
                }

                setTeachers(teachersData);
                setInterviews(interviewsData);

                if (goalsData && Object.keys(goalsData).length > 0) {
                    setGoals(goalsData);
                }

                setIsOnline(true);
                setSyncError(null);
            } catch (error: any) {
                console.error('D1 load error:', error);
                setSyncError(error.message);
                setIsOnline(false);
                // Fall back to localStorage
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
                let initialTasks: Task[] = [];

                if (oldTasks) {
                    const oldData = JSON.parse(oldTasks);
                    initialTasks = createDefaultTasks().map(t => ({ ...t, completed: oldData[t.id] || false }));
                } else {
                    initialTasks = createDefaultTasks();
                }

                // Merge with any potentially missing new defaults if we loaded from v2 but it has gaps
                // (Optimistic merge for simplicity in fallback mode)
                const existingIds = new Set(initialTasks.map(t => t.id));
                const missingDefaults = createDefaultTasks().filter(t => !existingIds.has(t.id));
                setTasks([...initialTasks, ...missingDefaults]);
            }

            // Ensure even if we loaded v2, we check for missing defaults
            if (savedTasks) {
                const loadedTasks = JSON.parse(savedTasks);
                const existingIds = new Set(loadedTasks.map((t: Task) => t.id));
                const missingDefaults = createDefaultTasks().filter(t => !existingIds.has(t.id));
                setTasks([...loadedTasks, ...missingDefaults]);
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
            try {
                await d1Client.tasks.update(id, {
                    completed: updates.completed,
                    completedAt: updates.completedAt || undefined
                });
            } catch (error) {
                console.error('Sync error:', error);
            }
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
            try {
                await d1Client.tasks.create(newTask);
            } catch (error) {
                console.error('Sync error:', error);
            }
        }

        return newTask;
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        setLastActivity(new Date().toISOString());

        if (isOnline) {
            try {
                await d1Client.tasks.update(id, updates);
            } catch (error) {
                console.error('Sync error:', error);
            }
        }
    };

    const deleteTask = async (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));

        if (isOnline) {
            try {
                await d1Client.tasks.delete(id);
            } catch (error) {
                console.error('Sync error:', error);
            }
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
            try {
                const result = await d1Client.teachers.create(newTeacher);
                if (result.id) {
                    newTeacher.id = result.id;
                }
            } catch (error) {
                console.error('Sync error:', error);
            }
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

            // Outreach tracking fields
            if (updates.contactMethod !== undefined) dbUpdates.contact_method = updates.contactMethod || null;
            if (updates.responseDate !== undefined) dbUpdates.response_date = updates.responseDate || null;
            if (updates.lastContactDate !== undefined) dbUpdates.last_contact_date = updates.lastContactDate || null;
            if (updates.nextFollowUpDate !== undefined) dbUpdates.next_follow_up_date = updates.nextFollowUpDate || null;
            if (updates.linkedinMessageSent !== undefined) dbUpdates.linkedin_message_sent = updates.linkedinMessageSent;
            if (updates.emailSent !== undefined) dbUpdates.email_sent = updates.emailSent;
            if (updates.phoneCallMade !== undefined) dbUpdates.phone_call_made = updates.phoneCallMade;

            await d1Client.teachers.update(id, updates);
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
            try {
                await d1Client.teachers.delete(id);
            } catch (error) {
                console.error('Sync error:', error);
            }
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
            try {
                const result = await d1Client.interviews.create(newInterview);
                if (result.id) {
                    newInterview.id = result.id;
                }
            } catch (error) {
                console.error('Sync error:', error);
            }
        }
    };

    const updateInterview = async (id: number, updates: Partial<Interview>) => {
        setInterviews(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
        setLastActivity(new Date().toISOString());

        if (isOnline) {
            try {
                await d1Client.interviews.update(id, updates);
            } catch (error) {
                console.error('Sync error:', error);
            }
        }
    };

    const deleteInterview = async (id: number) => {
        setInterviews(prev => prev.filter(i => i.id !== id));

        if (isOnline) {
            try {
                await d1Client.interviews.delete(id);
            } catch (error) {
                console.error('Sync error:', error);
            }
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
            try {
                await d1Client.goals.update(newGoals);
            } catch (error) {
                console.error('Sync error:', error);
            }
        }
    };

    const clearData = async () => {
        setTasks(createDefaultTasks());
        setInterviews([]);
        setReflections([]);

        if (isOnline) {
            try {
                // Delete all tasks and interviews, then recreate default tasks
                const allTasks = await d1Client.tasks.getAll();
                const allInterviews = await d1Client.interviews.getAll();

                for (const task of allTasks) {
                    await d1Client.tasks.delete(task.id);
                }
                for (const interview of allInterviews) {
                    await d1Client.interviews.delete(interview.id);
                }

                for (const task of createDefaultTasks()) {
                    await d1Client.tasks.create(task);
                }
            } catch (error) {
                console.error('Clear data error:', error);
            }
        }
    };

    // ========================================================================
    // EXPORT / IMPORT
    // ========================================================================

    const exportData = useCallback(() => {
        const data = { tasks, teachers, interviews, reflections, goals, exportedAt: new Date().toISOString(), version: '2.0' };
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
                if (data.teachers) setTeachers(data.teachers);
                if (data.interviews) setInterviews(data.interviews);
                if (data.reflections) setReflections(data.reflections);
                if (data.goals) setGoals(data.goals);

                // Sync to D1 if online
                if (isOnline) {
                    try {
                        // Clear existing data
                        const allTasks = await d1Client.tasks.getAll();
                        const allTeachers = await d1Client.teachers.getAll();
                        const allInterviews = await d1Client.interviews.getAll();

                        for (const task of allTasks) {
                            await d1Client.tasks.delete(task.id);
                        }
                        for (const teacher of allTeachers) {
                            await d1Client.teachers.delete(teacher.id);
                        }
                        for (const interview of allInterviews) {
                            await d1Client.interviews.delete(interview.id);
                        }

                        // Import new data
                        if (data.tasks) {
                            for (const task of data.tasks) {
                                await d1Client.tasks.create(task);
                            }
                        }
                        if (data.teachers) {
                            for (const teacher of data.teachers) {
                                await d1Client.teachers.create(teacher);
                            }
                        }
                        if (data.interviews) {
                            for (const interview of data.interviews) {
                                await d1Client.interviews.create(interview);
                            }
                        }
                        if (data.goals) {
                            await d1Client.goals.update(data.goals);
                        }
                    } catch (error) {
                        console.error('Import sync error:', error);
                    }
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
        if (daysSinceStart < 14) return 2;
        if (daysSinceStart < 28) return 3; // Week 3-4 are grouped as ID 3
        if (daysSinceStart < 35) return 4;
        if (daysSinceStart < 42) return 5;
        if (daysSinceStart < 49) return 6;
        return 6;
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
