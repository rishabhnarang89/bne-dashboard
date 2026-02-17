import { useState, useEffect, useCallback } from 'react';
import { d1Client } from '../lib/d1-client';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// TYPES
// ============================================================================

export type TeamMember = 'rishabh' | 'tung' | 'johannes' | 'all' | 'both';

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
    linkedTeacherId?: number;
    assignee?: TeamMember; // Deprecated
    assignees?: TeamMember[];
    lastModifiedBy?: string;
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
    noteLog?: { date: string; author: string; text: string }[];
    createdAt: string;

    // Outreach tracking fields
    contactMethod?: ContactMethod;
    responseDate?: string;           // When they first responded
    lastContactDate?: string;        // Last outreach attempt
    nextFollowUpDate?: string;       // Scheduled follow-up
    linkedinMessageSent?: boolean;   // Track if LinkedIn message sent
    emailSent?: boolean;             // Track if email sent
    phoneCallMade?: boolean;         // Track if phone call made
    owner?: TeamMember;              // Account owner (Rishabh, Tung, Johannes)
    phoneNumber?: string;            // Phone number for contact
    lastModifiedBy?: string;
}

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled';

export type QuestionType = 'text' | 'single_choice' | 'multiple_choice' | 'scale';

export interface QuestionOption {
    value: string;
    label: string;
    labelEn?: string;
    nextQuestionId?: string;
}

export interface BranchingQuestion {
    id: string;
    question: string;
    questionEn?: string;
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
    questionEn?: string;
    answer: string | string[];
    remarks?: string;
}

// Union for backward compatibility during migration if needed, 
// though we will try to migrate data structure.
// For the 'questions' field in Interview interface:
export type InterviewData = InterviewQuestionResponse[] | LegacyInterviewQuestion[];

export const BRANCHING_QUESTIONS: BranchingQuestion[] = [
    // SCREENER SECTION
    {
        id: 'q1',
        question: 'Unterrichten Sie derzeit an einer weiterführenden Schule (Gymnasium, Realschule oder Gesamtschule) in Deutschland?',
        questionEn: 'Do you currently teach at a secondary school (Gymnasium, Realschule, or Gesamtschule) in Germany?',
        type: 'single_choice',
        options: [
            { value: 'yes', label: 'Ja', labelEn: 'Yes', nextQuestionId: 'q2' },
            { value: 'no', label: 'Nein', labelEn: 'No', nextQuestionId: 'end_not_secondary' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q2',
        question: 'Welche Fächer unterrichten Sie? (Alle zutreffenden auswählen)',
        questionEn: 'Which subjects do you teach? (Select all that apply)',
        type: 'multiple_choice',
        options: [
            { value: 'physics', label: 'Physik', labelEn: 'Physics' },
            { value: 'biology', label: 'Biologie', labelEn: 'Biology' },
            { value: 'chemistry', label: 'Chemie', labelEn: 'Chemistry' },
            { value: 'geography', label: 'Geographie', labelEn: 'Geography' },
            { value: 'other_mint', label: 'Andere MINT-Fächer', labelEn: 'Other MINT subjects' },
            { value: 'none', label: 'Keines der oben genannten', labelEn: 'None of the above' }
        ],
        nextQuestionId: 'q3', // Default, but we'll handle multiple choice branching in component if needed or simplify
        required: true,
        remarks: true
    },
    {
        id: 'q3',
        question: 'Sind Sie an der Umsetzung von BNE (Bildung für nachhaltige Entwicklung) an Ihrer Schule beteiligt?',
        questionEn: 'Are you involved in BNE (Bildung für nachhaltige Entwicklung) implementation at your school?',
        type: 'single_choice',
        options: [
            { value: 'lead', label: 'Ja, ich leite BNE-Initiativen', labelEn: 'Yes, I lead BNE initiatives', nextQuestionId: 'q4' },
            { value: 'teach', label: 'Ja, ich unterrichte BNE-bezogene Inhalte', labelEn: 'Yes, I teach BNE-related content', nextQuestionId: 'q4' },
            { value: 'interested', label: 'Nein, aber ich bin interessiert', labelEn: "No, but I'm interested", nextQuestionId: 'q4' },
            { value: 'not_relevant', label: 'Nein, nicht relevant für meine Rolle', labelEn: 'No, not relevant to my role', nextQuestionId: 'end_not_bne' }
        ],
        required: true,
        remarks: true
    },

    // SECTION 1: PAIN POINT INTENSITY
    {
        id: 'q4',
        question: 'Wie viele BNE-Projekte mit Datenerfassung (Sensoren, Messungen, Experimente) haben Sie in den letzten 12 Monaten durchgeführt?',
        questionEn: 'How many BNE projects involving data collection (sensors, measurements, experiments) have you run in the past 12 months?',
        type: 'single_choice',
        options: [
            { value: '0', label: '0', nextQuestionId: 'q4a' },
            { value: '1-2', label: '1-2', nextQuestionId: 'q4b' },
            { value: '3-5', label: '3-5', nextQuestionId: 'q4c' },
            { value: '6+', label: '6+', nextQuestionId: 'q4c' }
        ],
        required: true,
        remarks: true
    },

    // BRANCH A: No projects
    {
        id: 'q4a',
        question: 'Was hat Sie daran gehindert, datengesteuerte BNE-Projekte durchzuführen? (Ihre Top 3 Barrieren)',
        questionEn: 'What stopped you from running data-driven BNE projects? (Rank your top 3 barriers)',
        type: 'multiple_choice', // Simplified from ranking for now to fit schema
        options: [
            { value: 'equipment', label: 'Mangel an geeigneter Ausrüstung', labelEn: 'Lack of suitable equipment' },
            { value: 'gdpr', label: 'DSGVO/Datenschutzbedenken', labelEn: 'GDPR/data protection concerns' },
            { value: 'time', label: 'Unzureichende Vorbereitungszeit', labelEn: 'Insufficient preparation time' },
            { value: 'curriculum', label: 'Mangel an Lehrplanmaterialien', labelEn: 'Lack of curriculum materials' },
            { value: 'budget', label: 'Budgetbeschränkungen', labelEn: 'Budget constraints' },
            { value: 'wifi', label: 'Unzuverlässiges WLAN/IT-Infrastruktur', labelEn: 'Unreliable WiFi/IT infrastructure' },
            { value: 'training', label: 'Mangel an BNE-Schulung', labelEn: 'Lack of BNE training' },
            { value: 'other', label: 'Sonstiges', labelEn: 'Other' }
        ],
        nextQuestionId: 'q4a_f',
        required: true,
        remarks: true
    },
    {
        id: 'q4a_f',
        question: 'Können Sie einen konkreten Zeitpunkt beschreiben, an dem dies ein Projekt gestoppt hat?',
        questionEn: 'Can you describe a specific time when this stopped a project?',
        type: 'text',
        nextQuestionId: 'q5',
        remarks: true
    },

    // BRANCH B: 1-2 projects
    {
        id: 'q4b',
        question: 'Sie haben 1-2 Projekte durchgeführt. Was hat Sie daran gehindert, mehr zu tun?',
        questionEn: 'You ran 1-2 projects. What prevented you from doing more?',
        type: 'text',
        nextQuestionId: 'q4b_f',
        required: true,
        remarks: true
    },
    {
        id: 'q4b_f',
        question: 'Wenn diese Barrieren beseitigt würden, wie viele BNE-Projekte würden Sie realistischerweise pro Jahr durchführen?',
        questionEn: 'If those barriers were removed, how many BNE projects would you realistically run per year?',
        type: 'single_choice',
        options: [
            { value: '3-4', label: '3-4', nextQuestionId: 'q5' },
            { value: '5-6', label: '5-6', nextQuestionId: 'q5' },
            { value: '7-10', label: '7-10', nextQuestionId: 'q5' },
            { value: '10+', label: '10+', nextQuestionId: 'q5' }
        ],
        required: true,
        remarks: true
    },

    // BRANCH C: 3+ projects
    {
        id: 'q4c',
        question: 'Großartig! Welche Ausrüstung/welchen Ansatz verwenden Sie derzeit für diese Projekte?',
        questionEn: 'Great! What equipment/approach are you currently using for these projects?',
        type: 'text',
        nextQuestionId: 'q4c_f',
        required: true,
        remarks: true
    },
    {
        id: 'q4c_f',
        question: 'Was ist die größte Frustration mit Ihrem aktuellen Setup?',
        questionEn: "What's the biggest frustration with your current setup?",
        type: 'text',
        nextQuestionId: 'q5',
        required: true,
        remarks: true
    },
    // SECTION 2: GDPR & IT INFRASTRUCTURE
    {
        id: 'q5',
        question: 'Auf einer Skala von 1-5, wie sehr bremst die DSGVO/Datenschutzfreigabe Ihre Fähigkeit aus, digitale Tools für BNE zu nutzen?',
        questionEn: 'On a scale of 1-5, how much does GDPR/data protection approval slow down your ability to use digital tools for BNE?',
        type: 'scale',
        options: [
            { value: '1', label: 'Kein Hindernis (1)', labelEn: 'Not a barrier (1)', nextQuestionId: 'q5d' },
            { value: '2', label: '2', nextQuestionId: 'q5d' },
            { value: '3', label: '3', nextQuestionId: 'q5e' },
            { value: '4', label: '4', nextQuestionId: 'q5e' },
            { value: '5', label: 'Großes Hindernis (5)', labelEn: 'Major blocker (5)', nextQuestionId: 'q5f' }
        ],
        required: true,
        remarks: true
    },

    // BRANCH D: Light GDPR concern (1-2)
    {
        id: 'q5d',
        question: 'Da die DSGVO für Sie kein großes Thema ist, was IST Ihre größte IT/Infrastruktur-Herausforderung?',
        questionEn: "Since GDPR isn't a major issue for you, what IS your biggest IT/infrastructure challenge?",
        type: 'single_choice',
        options: [
            { value: 'wifi', label: 'Unzuverlässiges WLAN', labelEn: 'Unreliable WiFi', nextQuestionId: 'q6' },
            { value: 'devices', label: 'Mangel an Geräten (Tablets/Laptops)', labelEn: 'Lack of devices', nextQuestionId: 'q6' },
            { value: 'support', label: 'IT-Support nicht verfügbar', labelEn: 'IT support unavailable', nextQuestionId: 'q6' },
            { value: 'outdated', label: 'Ausrüstung ist veraltet', labelEn: 'Equipment is outdated', nextQuestionId: 'q6' },
            { value: 'not_it', label: 'Kein IT-Problem - andere Barrieren sind wichtiger', labelEn: 'Not an IT issue', nextQuestionId: 'q6' },
            { value: 'other', label: 'Sonstiges', labelEn: 'Other', nextQuestionId: 'q6' }
        ],
        required: true,
        remarks: true
    },

    // BRANCH E: Moderate GDPR concern (3-4)
    {
        id: 'q5e',
        question: 'Wie lange dauert eine typische DSGVO-Freigabe an Ihrer Schule für ein neues digitales Tool?',
        questionEn: 'How long does a typical GDPR approval take at your school for a new digital tool?',
        type: 'single_choice',
        options: [
            { value: 'week', label: 'Weniger als 1 Woche', labelEn: 'Less than 1 week', nextQuestionId: 'q5e_f' },
            { value: '1-4weeks', label: '1-4 Wochen', labelEn: '1-4 weeks', nextQuestionId: 'q5e_f' },
            { value: '1-3months', label: '1-3 Monate', labelEn: '1-3 months', nextQuestionId: 'q5e_f' },
            { value: '3+months', label: '3+ Monate / Nie genehmigt', labelEn: '3+ months / Never approved', nextQuestionId: 'q5e_f' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q5e_f',
        question: 'Würde ein System, das ALLE Daten lokal speichert (kein Internet erforderlich), die DSGVO-Freigabe umgehen?',
        questionEn: 'If a system stored ALL data locally (zero internet), would this bypass GDPR approval?',
        type: 'single_choice',
        options: [
            { value: 'yes', label: 'Ja, definitiv', labelEn: 'Yes, definitely', nextQuestionId: 'q6' },
            { value: 'probably', label: 'Wahrscheinlich - müsste bestätigt werden', labelEn: 'Probably', nextQuestionId: 'q6' },
            { value: 'no', label: 'Nein, erfordert trotzdem eine Genehmigung', labelEn: 'No, still requires approval', nextQuestionId: 'q6' },
            { value: 'unsure', label: 'Unsicher', labelEn: 'Unsure', nextQuestionId: 'q6' }
        ],
        required: true,
        remarks: true
    },

    // BRANCH F: Critical GDPR blocker (5)
    {
        id: 'q5f',
        question: 'Erzählen Sie uns von der letzten Situation, in der die DSGVO ein Projekt blockiert hat. Was ist passiert?',
        questionEn: 'Tell us about the last time GDPR blocked a project. What happened?',
        type: 'text',
        nextQuestionId: 'q5f_f',
        required: true,
        remarks: true
    },
    {
        id: 'q5f_f',
        question: 'Wenn wir garantieren könnten, dass NULL Schülerdaten das Gerät verlassen, würde das alles ändern?',
        questionEn: 'If we could guarantee ZERO student data leaves the device, would that change everything?',
        type: 'single_choice',
        options: [
            { value: 'yes', label: 'Ja - das würde unser Problem lösen', labelEn: 'Yes - this would solve our problem', nextQuestionId: 'q6' },
            { value: 'maybe', label: 'Vielleicht - bräuchte Bestätigung', labelEn: 'Maybe', nextQuestionId: 'q6' },
            { value: 'no', label: 'Nein - wir haben andere größere Probleme', labelEn: 'No', nextQuestionId: 'q6' },
            { value: 'unsure', label: 'Unsicher', labelEn: 'Unsure', nextQuestionId: 'q6' }
        ],
        required: true,
        remarks: true
    },

    // SECTION 3: PREPARATION TIME
    {
        id: 'q6',
        question: 'Für Ihr letztes BNE-Projekt (oder eines, das Sie geplant haben), wie viele Stunden hat die Vorbereitung gedauert?',
        questionEn: 'For your most recent BNE project, how many hours did preparation take?',
        type: 'single_choice',
        options: [
            { value: '0-2', label: '0-2 Stunden', labelEn: '0-2 hours', nextQuestionId: 'q6g' },
            { value: '3-5', label: '3-5 Stunden', labelEn: '3-5 hours', nextQuestionId: 'q6h' },
            { value: '6-10', label: '6-10 Stunden', labelEn: '6-10 hours', nextQuestionId: 'q6h' },
            { value: '11-20', label: '11-20 Stunden', labelEn: '11-20 hours', nextQuestionId: 'q6i' },
            { value: '20+', label: '20+ Stunden', labelEn: '20+ hours', nextQuestionId: 'q6i' },
            { value: 'none', label: 'Bisher noch keins gemacht', labelEn: "Haven't done one yet", nextQuestionId: 'q6j' }
        ],
        required: true,
        remarks: true
    },

    // BRANCH G: Efficient (0-2 hours)
    {
        id: 'q6g',
        question: 'Beeindruckend! Was ist Ihr Geheimnis? Welche Ressourcen machen die Vorbereitung für Sie schnell?',
        questionEn: "Impressive! What's your secret? What resources make prep fast for you?",
        type: 'text',
        nextQuestionId: 'q7',
        remarks: true
    },

    // BRANCH H: Moderate (3-10 hours)
    {
        id: 'q6h',
        question: 'Was hat bei der Vorbereitung am meisten Zeit in Anspruch genommen?',
        questionEn: 'What took the most time during prep?',
        type: 'single_choice',
        options: [
            { value: 'equipment', label: 'Ausrüstung finden/einrichten', labelEn: 'Finding/setting up equipment', nextQuestionId: 'q7' },
            { value: 'worksheets', label: 'Arbeitsblätter/Unterrichtspläne erstellen', labelEn: 'Creating worksheets', nextQuestionId: 'q7' },
            { value: 'curriculum', label: 'Verknüpfung mit Lehrplanstandards', labelEn: 'Linking to curriculum', nextQuestionId: 'q7' },
            { value: 'testing', label: 'Ausrüstung vorher testen', labelEn: 'Testing equipment', nextQuestionId: 'q7' },
            { value: 'approvals', label: 'Genehmigungen einholen', labelEn: 'Getting approvals', nextQuestionId: 'q7' },
            { value: 'other', label: 'Sonstiges', labelEn: 'Other', nextQuestionId: 'q7' }
        ],
        required: true,
        remarks: true
    },

    // BRANCH I: Heavy (11+ hours)
    {
        id: 'q6i',
        question: 'Das ist eine beträchtliche Zeit! Was genau hat so lange gedauert?',
        questionEn: "That's significant time! What specifically took so long?",
        type: 'text',
        nextQuestionId: 'q6i_f',
        required: true,
        remarks: true
    },
    {
        id: 'q6i_f',
        question: 'Wenn fertige Unterrichtsmodule die Vorbereitungszeit auf 2-3 Stunden verkürzen könnten, was wäre das Ihrer Fachschaft wert?',
        questionEn: 'If pre-made curriculum modules could cut prep to 2-3 hours, what would that be worth to your department?',
        type: 'single_choice',
        options: [
            { value: '0', label: '€0 - nicht wert zu zahlen', labelEn: '€0 - not worth paying for', nextQuestionId: 'q7' },
            { value: '50-150', label: '€50-150 pro Modul', labelEn: '€50-150 per module', nextQuestionId: 'q7' },
            { value: '200-400', label: '€200-400 pro Modul', labelEn: '€200-400 per module', nextQuestionId: 'q7' },
            { value: '500+', label: '€500+ pro Modul', labelEn: '€500+ per module', nextQuestionId: 'q7' },
            { value: 'unsure', label: 'Unsicher', labelEn: 'Unsure', nextQuestionId: 'q7' }
        ],
        required: true,
        remarks: true
    },

    // BRANCH J: Haven't done one
    {
        id: 'q6j',
        question: 'Wenn Sie morgen ein BNE-Projekt planen würden, wie hoch schätzen Sie die Vorbereitungszeit ein?',
        questionEn: 'If you were to plan a BNE project tomorrow, estimate the prep time:',
        type: 'single_choice',
        options: [
            { value: '2-5', label: '2-5 Stunden', labelEn: '2-5 hours', nextQuestionId: 'q6j_f' },
            { value: '6-10', label: '6-10 Stunden', labelEn: '6-10 hours', nextQuestionId: 'q6j_f' },
            { value: '10-20', label: '10-20 Stunden', labelEn: '10-20 hours', nextQuestionId: 'q6j_f' },
            { value: '20+', label: '20+ Stunden', labelEn: '20+ hours', nextQuestionId: 'q6j_f' },
            { value: 'no_idea', label: 'Keine Ahnung - scheint überwältigend', labelEn: 'No idea', nextQuestionId: 'q6j_f' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q6j_f',
        question: 'Was bereitet Ihnen bei der Vorbereitung am meisten Sorgen?',
        questionEn: 'What worries you most about the prep?',
        type: 'text',
        nextQuestionId: 'q7',
        remarks: true
    },

    // TEIL 4: BUDGET & COMMITMENT
    // SECTION 4: WHOLE SCHOOL APPROACH
    {
        id: 'q7',
        question: 'Wie oft führen (oder möchten) Sie BNE-Umweltdaten-Projekte außerhalb des Klassenzimmers durch (Garten, Kantine, Heizungsraum usw.)?',
        questionEn: 'How often do you (or would you like to) collect environmental data OUTSIDE the classroom?',
        type: 'single_choice',
        options: [
            { value: 'regular', label: 'Regelmäßig (3+ mal/Jahr)', labelEn: 'Regularly (3+ times/year)', nextQuestionId: 'q7k' },
            { value: 'rare', label: '1-2 mal versucht', labelEn: "1-2 times", nextQuestionId: 'q7l' },
            { value: 'want_to', label: 'Bisher nie, möchte es aber', labelEn: "Never, but want to", nextQuestionId: 'q7m' },
            { value: 'not_interested', label: 'Nicht interessiert / nicht relevant', labelEn: 'Not interested', nextQuestionId: 'q8' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q7k',
        question: 'Welche Ausrüstung verwenden Sie für Außenmessungen?',
        questionEn: 'What equipment do you use for outdoor monitoring?',
        type: 'text',
        nextQuestionId: 'q7k_f',
        required: true,
        remarks: true
    },
    {
        id: 'q7k_f',
        question: 'Was ist das Hauptproblem, das bei diesen Außenprojekten auftritt?',
        questionEn: "What's the #1 thing that fails in these outdoor projects?",
        type: 'single_choice',
        options: [
            { value: 'battery', label: 'Akku leer', labelEn: 'Battery dies', nextQuestionId: 'q8' },
            { value: 'weather', label: 'Nicht wetterfest', labelEn: 'Not weatherproof', nextQuestionId: 'q8' },
            { value: 'stolen', label: 'Diebstahl/Beschädigung', labelEn: 'Stolen/damaged', nextQuestionId: 'q8' },
            { value: 'wifi', label: 'WLAN-Reichweite', labelEn: 'WiFi reach', nextQuestionId: 'q8' },
            { value: 'data', label: 'Daten gehen verloren', labelEn: 'Data lost', nextQuestionId: 'q8' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q7l',
        question: 'Was hindert Sie daran, dies öfter zu tun?',
        questionEn: 'What prevents you from doing this more often?',
        type: 'single_choice',
        options: [
            { value: 'equipment', label: 'Ausrüstung nicht außentauglich', labelEn: 'Equipment not suitable', nextQuestionId: 'q8' },
            { value: 'battery', label: 'Akku/Stromprobleme', labelEn: 'Battery issues', nextQuestionId: 'q8' },
            { value: 'theft', label: 'Diebstahlrisiko', labelEn: 'Theft risk', nextQuestionId: 'q8' },
            { value: 'complex', label: 'Zu kompliziert einzurichten', labelEn: 'Too complex', nextQuestionId: 'q8' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q7m',
        question: 'Wenn Sie robuste Sensoren hätten (6 Monate Akku, wetterfest), welches Projekt würden Sie durchführen?',
        questionEn: 'If you had ruggedized sensors (6-month battery), what specific project would you run?',
        type: 'text',
        nextQuestionId: 'q8',
        remarks: true
    },

    // SECTION 5: CURRENT TOOLS & COMPETITIVE GAP
    {
        id: 'q8',
        question: 'Nutzen Sie derzeit eines dieser Tools für MINT/BNE-Projekte?',
        questionEn: 'Do you currently use any of these tools?',
        type: 'single_choice',
        options: [
            { value: 'micro', label: 'Calliope / Arduino / Micro:bit', labelEn: 'Microcontrollers', nextQuestionId: 'q8n' },
            { value: 'lab', label: 'CASSY / Vernier / Profigeräte', labelEn: 'Lab equipment', nextQuestionId: 'q8o' },
            { value: 'diy', label: 'DIY/Selbstbausensoren', labelEn: 'DIY sensors', nextQuestionId: 'q8p' },
            { value: 'none', label: 'Keines der oben genannten', labelEn: 'None of the above', nextQuestionId: 'q8q' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q8n',
        question: 'Sind Microcontroller wie Calliope für die Sekundarstufe ausreichend oder fehlt es an Präzision?',
        questionEn: 'Are microcontrollers like Calliope sufficient, or do they lack precision?',
        type: 'single_choice',
        options: [
            { value: 'sufficient', label: 'Ausreichend für unsere Bedürfnisse', labelEn: 'Sufficient', nextQuestionId: 'q9' },
            { value: 'too_simple', label: 'Zu einfach - brauchen mehr Präzision', labelEn: 'Too simple', nextQuestionId: 'q9' },
            { value: 'too_complex', label: 'Zu komplex für Schüler', labelEn: 'Too complex', nextQuestionId: 'q9' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q8o',
        question: 'Wie gut lässt sich Ihre Laborausrüstung (CASSY/Vernier) in den BNE-Lehrplan integrieren?',
        questionEn: 'How well does your lab equipment integrate with BNE curriculum?',
        type: 'single_choice',
        options: [
            { value: 'great', label: 'Funktioniert super', labelEn: 'Works great', nextQuestionId: 'q9' },
            { value: 'adaptation', label: 'Erfordert große Anpassungen', labelEn: 'Major adaptation', nextQuestionId: 'q9' },
            { value: 'poor_fit', label: 'Passt schlecht zu BNE', labelEn: 'Poor fit', nextQuestionId: 'q9' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q8p',
        question: 'Was funktioniert gut und was ist frustrierend an DIY-Sensoren?',
        questionEn: "What's working and what's frustrating about DIY sensors?",
        type: 'text',
        nextQuestionId: 'q9',
        required: true,
        remarks: true
    },
    {
        id: 'q8q',
        question: 'Was ist der Hauptgrund, warum Sie keine digitalen Messgeräte für BNE nutzen?',
        questionEn: "Main reason you don't use digital measurement tools for BNE?",
        type: 'single_choice',
        options: [
            { value: 'no_equipment', label: 'Haben keine Ausrüstung', labelEn: 'No equipment', nextQuestionId: 'q9' },
            { value: 'expensive', label: 'Zu teuer', labelEn: 'Too expensive', nextQuestionId: 'q9' },
            { value: 'complex', label: 'Zu komplex in der Anwendung', labelEn: 'Too complex', nextQuestionId: 'q9' }
        ],
        required: true,
        remarks: true
    },

    // SECTION 6: BUDGET & PROCUREMENT
    {
        id: 'q9',
        question: 'Wenn eine BNE-Sensorstation 750 € kostet, kann Ihre Fachschaft den Kauf direkt genehmigen?',
        questionEn: 'If a BNE sensor station costs €750, can your department approve directly?',
        type: 'single_choice',
        options: [
            { value: 'yes_direct', label: 'Ja, meine Fachschaft kann direkt entscheiden', labelEn: 'Yes, direct approval', nextQuestionId: 'q9r' },
            { value: 'principal', label: 'Benötigt Schulleitungs-Freigabe', labelEn: 'Need principal approval', nextQuestionId: 'q9s' },
            { value: 'municipal', label: 'Erfordert kommunales Ausschreibungsverfahren', labelEn: 'Municipal tender', nextQuestionId: 'q9t' },
            { value: 'unsure', label: 'Unsicher', labelEn: 'Unsure', nextQuestionId: 'q9u' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q9r',
        question: 'Wie hoch ist das jährliche Ausrüstungsbudget Ihrer Fachschaft?',
        questionEn: "What's your department's annual equipment budget?",
        type: 'single_choice',
        options: [
            { value: 'under_1k', label: 'Unter 1.000 €', labelEn: 'Under €1,000', nextQuestionId: 'q10' },
            { value: '1k-3k', label: '1.000 € - 3.000 €', labelEn: '€1,000-3,000', nextQuestionId: 'q10' },
            { value: '3k+', label: 'Über 3.000 €', labelEn: '€3,000+', nextQuestionId: 'q10' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q9s',
        question: 'Was würde die Schulleitung eher zum Ja oder zum Nein bewegen?',
        questionEn: 'What would make the principal say yes vs. no?',
        type: 'text',
        nextQuestionId: 'q10',
        remarks: true
    },
    {
        id: 'q9t',
        question: 'Ab welchem Preis könnten Sie das Tender-Verfahren umgehen?',
        questionEn: 'At what price could you avoid the tender process?',
        type: 'single_choice',
        options: [
            { value: '500', label: 'Unter 500 €', nextQuestionId: 'q10' },
            { value: '800', label: 'Unter 800 €', nextQuestionId: 'q10' },
            { value: '1000', label: 'Unter 1.000 €', nextQuestionId: 'q10' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q9u',
        question: 'Wen würden Sie beim Kauf neuer BNE-Ausrüstung fragen?',
        questionEn: 'Who would you ask about buying new equipment?',
        type: 'text',
        nextQuestionId: 'q10',
        remarks: true
    },

    // SECTION 7: SOLUTION VALIDATION
    {
        id: 'q10',
        question: 'KONZEPT-TEST: Robustes Offline-System, 6 Monate Akku, 750 €. Würde das Ihre Probleme lösen?',
        questionEn: 'CONCEPT TEST: Rugged offline system, 6mo battery, €750. Does this solve your problems?',
        type: 'scale',
        options: [
            { value: '1', label: 'Nicht nützlich (1)', nextQuestionId: 'q10v' },
            { value: '2', label: '2', nextQuestionId: 'q10v' },
            { value: '3', label: 'Mittel (3)', nextQuestionId: 'q10w' },
            { value: '4', label: '4', nextQuestionId: 'q10x' },
            { value: '5', label: 'Genau das, was wir brauchen (5)', nextQuestionId: 'q10x' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q10v',
        question: 'Was müsste sich ändern, damit das für Sie wertvoll ist?',
        questionEn: 'What would need to change to be valuable?',
        type: 'text',
        nextQuestionId: 'q11',
        remarks: true
    },
    {
        id: 'q10w',
        question: 'Was hält Sie von einer 4 oder 5 ab?',
        questionEn: "What's holding you back from a 4 or 5?",
        type: 'single_choice',
        options: [
            { value: 'price', label: 'Preis zu hoch', labelEn: 'Price too high', nextQuestionId: 'q11' },
            { value: 'features', label: 'Fehlende Features', labelEn: 'Missing features', nextQuestionId: 'q11' },
            { value: 'curriculum', label: 'Unklarer Lehrplan-Fit', labelEn: 'Unclear curriculum fit', nextQuestionId: 'q11' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q10x',
        question: 'Wenn dies heute verfügbar wäre, würden Sie es dieses Schuljahr kaufen?',
        questionEn: 'If available today, would you buy it this school year?',
        type: 'single_choice',
        options: [
            { value: 'yes', label: 'Ja, definitiv', labelEn: 'Yes, definitely', nextQuestionId: 'q10x_f' },
            { value: 'no', label: 'Nein', labelEn: 'No', nextQuestionId: 'q10x_f' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q10x_f',
        question: 'Wären Sie an einer Pilotphase im nächsten Halbjahr interessiert?',
        questionEn: 'Interested in a pilot next semester?',
        type: 'single_choice',
        options: [
            { value: 'yes', label: 'Ja!', nextQuestionId: 'q11' },
            { value: 'no', label: 'Nein danke', nextQuestionId: 'q11' }
        ],
        required: true,
        remarks: true
    },

    // SECTION 8: FINAL CONTEXT
    {
        id: 'q11',
        question: 'Wie dringend ist die Verbesserung der BNE-Umsetzung an Ihrer Schule?',
        questionEn: 'How urgent is improving BNE at your school?',
        type: 'single_choice',
        options: [
            { value: 'critical', label: 'Kritisch - Inspektionen stehen bevor', labelEn: 'Critical', nextQuestionId: 'q12' },
            { value: 'high', label: 'Hohe Priorität - Schulentwicklungsplan', labelEn: 'High', nextQuestionId: 'q12' },
            { value: 'important', label: 'Wichtig, aber nicht dringend', labelEn: 'Important', nextQuestionId: 'q12' }
        ],
        required: true,
        remarks: true
    },
    {
        id: 'q12',
        question: 'Gibt es noch etwas Wichtiges, das ich nicht gefragt habe?',
        questionEn: "Anything else I should have asked?",
        type: 'text',
        nextQuestionId: 'q13',
        remarks: true
    },
    {
        id: 'q13',
        question: 'Können wir Sie für ein kurzes Follow-up erneut kontaktieren?',
        questionEn: 'Can we follow up with you?',
        type: 'single_choice',
        options: [
            { value: 'yes', label: 'Ja', nextQuestionId: 'end_thank_you' },
            { value: 'no', label: 'Nein', nextQuestionId: 'end_thank_you' }
        ],
        required: true,
        remarks: true
    },

    // END SCREENS
    {
        id: 'end_not_secondary',
        question: 'Vielen Dank! Diese Umfrage konzentriert sich auf Lehrkräfte an weiterführenden Schulen.',
        questionEn: 'Thank you! This survey is focused on secondary school teachers.',
        type: 'text',
        remarks: false
    },
    {
        id: 'end_not_bne',
        question: 'Vielen Dank für Ihre Zeit! Diese Umfrage ist speziell für Lehrkräfte in der BNE-Umsetzung.',
        questionEn: 'Thank you! This survey is for teachers in BNE implementation.',
        type: 'text',
        remarks: false
    },
    {
        id: 'end_thank_you',
        question: 'Herzlichen Dank! Ihre Erkenntnisse helfen uns sehr beim Aufbau von BNE-Box.',
        questionEn: 'Thank you! Your insights help us build BNE-Box.',
        type: 'text',
        remarks: false
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
    interviewer?: TeamMember;   // Who conducted the interview
    observer?: TeamMember;      // Who observed (cannot equal interviewer)
    lastModifiedBy?: string;
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

export interface KnowledgeItem {
    id: string;
    cardId: string;
    type: 'link' | 'file' | 'note' | 'google_drive';
    title: string;
    url?: string;
    content?: string;
    sortOrder: number;
    createdAt?: string;
}

export interface KnowledgeCard {
    id: string;
    title: string;
    description?: string;
    icon: string;
    color: string;
    sortOrder: number;
    items: KnowledgeItem[];
    createdAt?: string;
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
    const { user } = useAuth();
    const [isOnline, setIsOnline] = useState(true); // D1 is always available
    const [isLoading, setIsLoading] = useState(true);
    const [syncError, setSyncError] = useState<string | null>(null);

    // State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [reflections, setReflections] = useState<WeeklyReflection[]>([]);
    const [goals, setGoals] = useState<GoalSettings>(DEFAULT_GOALS);
    const [knowledgeCards, setKnowledgeCards] = useState<KnowledgeCard[]>([]);
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('bne_darkMode');
            if (saved) {
                const value = JSON.parse(saved);
                document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light');
                return value;
            }
        } catch { /* ignore */ }
        return false;
    });

    // Immediate restore from localStorage to prevent blank UI on slow/broken API
    useEffect(() => {
        const savedKB = localStorage.getItem('bne_knowledge_cards');
        if (savedKB) {
            try {
                const parsed = JSON.parse(savedKB);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setKnowledgeCards(parsed);
                }
            } catch (e) {
                console.error('Initial KB restore error:', e);
            }
        }
    }, []);
    const [lastActivity, setLastActivity] = useState<string>(new Date().toISOString());

    // Immediate restore from localStorage to prevent blank UI on slow/broken API
    useEffect(() => {
        const restore = (key: string, setter: (val: any) => void) => {
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) setter(parsed);
                    else if (!Array.isArray(parsed) && parsed && Object.keys(parsed).length > 0) setter(parsed);
                } catch (e) { console.error(`Restore error for ${key}:`, e); }
            }
        };

        restore('bne_tasks_v2', setTasks);
        restore('bne_teachers_v2', setTeachers);
        restore('bne_interviews_v2', setInterviews);
        restore('bne_goals_v2', setGoals);
        restore('bne_knowledge_cards_v2', setKnowledgeCards);
    }, []);

    // ========================================================================
    // INITIAL DATA LOAD
    // ========================================================================


    // Default Knowledge Cards
    const DEFAULT_KNOWLEDGE_CARDS: KnowledgeCard[] = [
        {
            id: 'card_outreach',
            title: 'Outreach & Interviews',
            description: 'Scripts, email templates, and interview notes.',
            icon: 'Users',
            color: 'orange',
            sortOrder: 0,
            items: []
        },
        {
            id: 'card_sources',
            title: 'Important Sources',
            description: 'Competitor analysis, curriculum standards, and research.',
            icon: 'Globe',
            color: 'blue',
            sortOrder: 1,
            items: []
        },
        {
            id: 'card_exist',
            title: 'EXIST Application',
            description: 'Application drafts, business plan, and university documents.',
            icon: 'FileText',
            color: 'purple',
            sortOrder: 2,
            items: []
        },
        {
            id: 'card_prototype',
            title: 'Prototype Development',
            description: 'Hardware specs, sensor datasheets, and 3D print files.',
            icon: 'Cpu', // Lucid icon name
            color: 'green',
            sortOrder: 3,
            items: []
        },
        {
            id: 'card_pilot',
            title: 'Pilot Schools',
            description: 'LOI templates, onboarding checklists, and feedback forms.',
            icon: 'School', // Lucid icon name
            color: 'red',
            sortOrder: 4,
            items: []
        },
        {
            id: 'card_marketing',
            title: 'Marketing & Assets',
            description: 'Logos, pitch decks, and social proof quotes.',
            icon: 'Megaphone', // Lucid icon name
            color: 'gray',
            sortOrder: 5,
            items: []
        }
    ];

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            try {
                // Load from D1
                const [tasksData, teachersData, interviewsData, goalsData, knowledgeData] = await Promise.all([
                    d1Client.tasks.getAll(),
                    d1Client.teachers.getAll(),
                    d1Client.interviews.getAll(),
                    d1Client.goals.get(),
                    fetch('/api/knowledge').then(res => res.ok ? res.json() : null)
                ]);

                // ====================================================================
                // DEFENSIVE MERGE: Combine server state with local-only changes
                // ====================================================================

                // Tasks Merge
                if (Array.isArray(tasksData)) {
                    const localSaved = localStorage.getItem('bne_tasks_v2');
                    const localTasks: Task[] = localSaved ? JSON.parse(localSaved) : [];

                    // Keep any local-only tasks (ones not on the server)
                    const serverIds = new Set(tasksData.map((t: Task) => t.id));
                    const pendingLocal = localTasks.filter(t => !serverIds.has(t.id));

                    // ACTIVE SYNC: Push local-only tasks to server so they appear elsewhere
                    if (pendingLocal.length > 0) {
                        console.log('Syncing local pending tasks to server...', pendingLocal.length);
                        for (const task of pendingLocal) {
                            // Fire and forget sync to not block UI
                            d1Client.tasks.create(task).catch(err => console.error('Background sync failed for task:', task.title, err));
                        }
                    }

                    // Merge and handle defaults
                    const sanitizeTask = (t: any): Task => ({
                        ...t,
                        subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
                        assignees: Array.isArray(t.assignees) ? t.assignees : (t.assignee ? [t.assignee] : []),
                        priority: t.priority || 'medium',
                        weekId: t.weekId || 1
                    });

                    const mergedTasks = [...tasksData, ...pendingLocal].map(sanitizeTask);
                    const defaultTasks = createDefaultTasks().map(sanitizeTask);
                    const existingMergedIds = new Set(mergedTasks.map((t: Task) => t.id));
                    const missingDefaults = defaultTasks.filter(t => !existingMergedIds.has(t.id));

                    if (missingDefaults.length > 0) {
                        for (const task of missingDefaults) {
                            try { await d1Client.tasks.create(task); } catch (e) { /* ignore */ }
                        }
                        setTasks([...mergedTasks, ...missingDefaults]);
                    } else {
                        setTasks(mergedTasks);
                    }
                }

                // Teachers Merge
                if (Array.isArray(teachersData)) {
                    const localSaved = localStorage.getItem('bne_teachers_v2');
                    const localTeachers: any[] = localSaved ? JSON.parse(localSaved) : [];
                    const serverIds = new Set(teachersData.map((t: any) => t.id));
                    const pendingLocal = localTeachers.filter(t => !serverIds.has(t.id));
                    setTeachers([...teachersData, ...pendingLocal]);
                }

                // Interviews Merge
                if (Array.isArray(interviewsData)) {
                    const localSaved = localStorage.getItem('bne_interviews_v2');
                    const localInterviews: any[] = localSaved ? JSON.parse(localSaved) : [];
                    const serverIds = new Set(interviewsData.map((t: any) => t.id));
                    const pendingLocal = localInterviews.filter(t => !serverIds.has(t.id));
                    setInterviews([...interviewsData, ...pendingLocal]);
                }

                if (goalsData && Object.keys(goalsData).length > 0) {
                    setGoals(goalsData);
                }

                // Knowledge Hub Seeding / Merging
                if (Array.isArray(knowledgeData) && knowledgeData.length > 0) {
                    // Identify missing default cards
                    const existingCardIds = new Set(knowledgeData.map((c: any) => c.id));
                    const missingDefaults = DEFAULT_KNOWLEDGE_CARDS.filter(c => !existingCardIds.has(c.id));

                    if (missingDefaults.length > 0) {
                        const seededCards = [...knowledgeData];

                        for (const card of missingDefaults) {
                            try {
                                await fetch('/api/knowledge', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ entityType: 'card', ...card })
                                });
                                // Add timestamp for local state
                                seededCards.push({ ...card, createdAt: new Date().toISOString() });
                            } catch (e) { console.error('Seeding failed', e); }
                        }
                        setKnowledgeCards(seededCards);
                    } else {
                        setKnowledgeCards(knowledgeData);
                    }
                } else if (knowledgeData === null) {
                    // API errored, keep localStorage
                    console.warn('API Knowledge Hub failed (500), using cached data');
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

            // Knowledge Cards backup
            const savedKB = localStorage.getItem('bne_knowledge_cards');
            if (savedKB) setKnowledgeCards(JSON.parse(savedKB));
        };

        loadData();
    }, []);


    // ========================================================================
    // PERSIST TO LOCALSTORAGE (always, as backup)
    // ========================================================================


    useEffect(() => { localStorage.setItem('bne_tasks_v2', JSON.stringify(tasks)); }, [tasks]);
    useEffect(() => { localStorage.setItem('bne_teachers_v2', JSON.stringify(teachers)); }, [teachers]);
    useEffect(() => { localStorage.setItem('bne_interviews_v2', JSON.stringify(interviews)); }, [interviews]);
    useEffect(() => { localStorage.setItem('bne_goals_v2', JSON.stringify(goals)); }, [goals]);
    useEffect(() => { localStorage.setItem('bne_darkMode', JSON.stringify(darkMode)); document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light'); }, [darkMode]);
    useEffect(() => { localStorage.setItem('bne_lastActivity', lastActivity); }, [lastActivity]);
    useEffect(() => { localStorage.setItem('bne_knowledge_cards_v2', JSON.stringify(knowledgeCards)); }, [knowledgeCards]);

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
        const originalTask = tasks.find(t => t.id === id);
        if (!originalTask) return;

        const updatedTask = { ...updates };

        // Handle assignees update logic
        if (updatedTask.assignees) {
            // Ensure assignees is array
            if (!Array.isArray(updatedTask.assignees)) {
                // @ts-ignore
                updatedTask.assignees = [updatedTask.assignees];
            }
        } else if (updatedTask.assignee) {
            // Backwards compat in optimistic update
            updatedTask.assignees = [updatedTask.assignee];
        }

        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedTask } : t));
        setLastActivity(new Date().toISOString());

        if (isOnline) {
            try {
                await d1Client.tasks.update(id, { ...updatedTask, lastModifiedBy: user?.name });
            } catch (error) {
                console.error('Sync error:', error);
                // Revert on error
                setTasks(prev => prev.map(t => t.id === id ? originalTask : t));
            }
        }
    };

    const deleteTask = async (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));

        if (isOnline) {
            try {
                await d1Client.tasks.delete(id, user?.name);
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
            createdAt: new Date().toISOString(),
            lastModifiedBy: user?.name
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

            await d1Client.teachers.update(id, { ...updates, lastModifiedBy: user?.name });
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
                await d1Client.teachers.delete(id, user?.name);
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
        const newInterview = { ...interview, id: Date.now(), lastModifiedBy: user?.name };
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
                await d1Client.interviews.update(id, { ...updates, lastModifiedBy: user?.name });
            } catch (error) {
                console.error('Sync error:', error);
            }
        }
    };

    const deleteInterview = async (id: number) => {
        setInterviews(prev => prev.filter(i => i.id !== id));

        if (isOnline) {
            try {
                await d1Client.interviews.delete(id, user?.name);
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
    // KNOWLEDGE HUB ACTIONS
    // ========================================================================

    const addKnowledgeCard = async (card: Omit<KnowledgeCard, 'items' | 'createdAt'>) => {
        const newCard: KnowledgeCard = { ...card, items: [], createdAt: new Date().toISOString() };
        setKnowledgeCards(prev => [...prev, newCard]);

        if (isOnline) {
            try {
                await fetch('/api/knowledge', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        entityType: 'card',
                        id: card.id,
                        title: card.title,
                        description: card.description,
                        icon: card.icon,
                        color: card.color,
                        sort_order: card.sortOrder // Fix mapping
                    })
                });
            } catch (error) {
                console.error('KB Sync error:', error);
            }
        }
    };

    const updateKnowledgeCard = async (id: string, updates: Partial<KnowledgeCard>) => {
        setKnowledgeCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

        if (isOnline) {
            try {
                await fetch('/api/knowledge', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        entityType: 'card',
                        id,
                        ...updates,
                        sort_order: updates.sortOrder !== undefined ? updates.sortOrder : undefined // Fix mapping if present
                    })
                });
            } catch (error) {
                console.error('KB Sync error:', error);
            }
        }
    };

    const deleteKnowledgeCard = async (id: string) => {
        setKnowledgeCards(prev => prev.filter(c => c.id !== id));

        if (isOnline) {
            try {
                await fetch(`/api/knowledge?entityType=card&id=${id}`, { method: 'DELETE' });
            } catch (error) {
                console.error('KB Sync error:', error);
            }
        }
    };

    const addKnowledgeItem = async (item: KnowledgeItem) => {
        setKnowledgeCards(prev => prev.map(c => {
            if (c.id === item.cardId) {
                return { ...c, items: [...c.items, item] };
            }
            return c;
        }));

        if (isOnline) {
            try {
                await fetch('/api/knowledge', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        entityType: 'item',
                        id: item.id,
                        card_id: item.cardId,
                        type: item.type,
                        title: item.title,
                        url: item.url,
                        content: item.content,
                        sort_order: item.sortOrder
                    })
                });
            } catch (error) {
                console.error('KB Sync error:', error);
            }
        }
    };

    const updateKnowledgeItem = async (id: string, cardId: string, updates: Partial<KnowledgeItem>) => {
        setKnowledgeCards(prev => prev.map(c => {
            if (c.id === cardId) {
                return { ...c, items: c.items.map(i => i.id === id ? { ...i, ...updates } : i) };
            }
            return c;
        }));

        if (isOnline) {
            try {
                // Map camelCase to snake_case for API
                const apiUpdates: any = { entityType: 'item', id };
                if (updates.cardId) apiUpdates.card_id = updates.cardId;
                if (updates.type) apiUpdates.type = updates.type;
                if (updates.title) apiUpdates.title = updates.title;
                if (updates.url) apiUpdates.url = updates.url;
                if (updates.content) apiUpdates.content = updates.content;
                if (updates.sortOrder) apiUpdates.sort_order = updates.sortOrder;

                await fetch('/api/knowledge', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(apiUpdates)
                });
            } catch (error) {
                console.error('KB Sync error:', error);
            }
        }
    };

    const deleteKnowledgeItem = async (id: string, cardId: string) => {
        setKnowledgeCards(prev => prev.map(c => {
            if (c.id === cardId) {
                return { ...c, items: c.items.filter(i => i.id !== id) };
            }
            return c;
        }));

        if (isOnline) {
            try {
                await fetch(`/api/knowledge?entityType=item&id=${id}`, { method: 'DELETE' });
            } catch (error) {
                console.error('KB Sync error:', error);
            }
        }
    };

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
        getTasksByWeek, overdueTasks, todayTasks, WEEKS,

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

        // Knowledge Hub
        knowledgeCards, addKnowledgeCard, updateKnowledgeCard, deleteKnowledgeCard,
        addKnowledgeItem, updateKnowledgeItem, deleteKnowledgeItem,

        // Computed
        completedInterviews, avgScore, avgSetupTime, pilotCount, highScoreCount,
        daysUntilDecision, daysSinceLastActivity, getCurrentWeek,

        // Constants
        SPRINT_START, SPRINT_END, DECISION_DATE
    };
}
