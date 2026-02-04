import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { BRANCHING_QUESTIONS } from '../../hooks/useValidationData';
import type { InterviewQuestionResponse } from '../../hooks/useValidationData';

interface QuestionnaireFormProps {
    existingAnswers?: InterviewQuestionResponse[];
    onChange: (answers: InterviewQuestionResponse[]) => void;
}

export const QuestionnaireForm = ({ existingAnswers = [], onChange }: QuestionnaireFormProps) => {
    // State
    const [answers, setAnswers] = useState<Record<string, InterviewQuestionResponse>>({});
    const [currentQuestionId, setCurrentQuestionId] = useState<string>('q1');
    const [history, setHistory] = useState<string[]>([]); // Track path for "Back" button

    // Initialize state from props
    useEffect(() => {
        if (existingAnswers && existingAnswers.length > 0) {
            const answerMap: Record<string, InterviewQuestionResponse> = {};
            existingAnswers.forEach(a => {
                answerMap[a.questionId] = a;
            });
            setAnswers(answerMap);
        }
    }, [existingAnswers]);

    // Get current question object
    const currentQuestion = BRANCHING_QUESTIONS.find(q => q.id === currentQuestionId);

    // If we somehow get lost or finish, show something? 
    // Ideally we should have a 'complete' state or similar, but for now we assume valid ID.

    if (!currentQuestion) {
        return (
            <div className="p-4 text-center text-red-500">
                <AlertCircle className="mx-auto mb-2" />
                Error: Question {currentQuestionId} not found.
            </div>
        );
    }

    const currentAnswer = answers[currentQuestionId] || {
        questionId: currentQuestionId,
        questionText: currentQuestion.question,
        questionEn: currentQuestion.questionEn,
        answer: '',
        remarks: ''
    };

    const handleAnswerChange = (value: string | string[]) => {
        const updatedAnswers = {
            ...answers,
            [currentQuestionId]: {
                ...currentAnswer,
                questionText: currentQuestion.question, // Ensure text is up to date
                questionEn: currentQuestion.questionEn,
                answer: value
            }
        };
        setAnswers(updatedAnswers);

        // Propagate changes up as array
        onChange(Object.values(updatedAnswers));
    };

    const handleRemarksChange = (value: string) => {
        const updatedAnswers = {
            ...answers,
            [currentQuestionId]: {
                ...currentAnswer,
                questionText: currentQuestion.question,
                questionEn: currentQuestion.questionEn,
                remarks: value
            }
        };
        setAnswers(updatedAnswers);
        onChange(Object.values(updatedAnswers));
    };

    const handleNext = () => {
        // Determine next question ID
        let nextId = currentQuestion.nextQuestionId;

        // Check if selected option has a specific branch
        if (currentQuestion.options && typeof currentAnswer.answer === 'string') {
            const selectedOption = currentQuestion.options.find(opt => opt.value === currentAnswer.answer);
            if (selectedOption?.nextQuestionId) {
                nextId = selectedOption.nextQuestionId;
            }
        }

        if (nextId) {
            setHistory(prev => [...prev, currentQuestionId]);
            setCurrentQuestionId(nextId);
        } else {
            // End of questionnaire
            // Show toast or some completion indicator? 
            // For now, we stay on last question but maybe disable Next?
            // Actually, usually parent component handles "Complete" action.
        }
    };

    const handleBack = () => {
        if (history.length > 0) {
            const prevId = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            setCurrentQuestionId(prevId);
        }
    };

    const renderInput = () => {
        switch (currentQuestion.type) {
            case 'single_choice':
            case 'scale':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {currentQuestion.options?.map(opt => (
                            <label
                                key={opt.value}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-default)',
                                    cursor: 'pointer',
                                    background: currentAnswer.answer === opt.value ? 'var(--primary-light)' : 'var(--bg-card)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <input
                                    type="radio"
                                    name={currentQuestionId}
                                    value={opt.value}
                                    checked={currentAnswer.answer === opt.value}
                                    onChange={(e) => handleAnswerChange(e.target.value)}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{opt.label}</span>
                                    {opt.labelEn && (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            {opt.labelEn}
                                        </span>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                );

            case 'multiple_choice':
                const selectedAnswers = Array.isArray(currentAnswer.answer) ? currentAnswer.answer : [];
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {currentQuestion.options?.map(opt => (
                            <label
                                key={opt.value}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-default)',
                                    cursor: 'pointer',
                                    background: selectedAnswers.includes(opt.value) ? 'var(--primary-light)' : 'var(--bg-card)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    value={opt.value}
                                    checked={selectedAnswers.includes(opt.value)}
                                    onChange={(e) => {
                                        const newValue = e.target.checked
                                            ? [...selectedAnswers, opt.value]
                                            : selectedAnswers.filter(v => v !== opt.value);
                                        handleAnswerChange(newValue);
                                    }}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{opt.label}</span>
                                    {opt.labelEn && (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            {opt.labelEn}
                                        </span>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                );

            case 'text':
            default:
                return (
                    <textarea
                        className="textarea"
                        placeholder="Type response here..."
                        value={currentAnswer.answer as string || ''}
                        onChange={e => handleAnswerChange(e.target.value)}
                        rows={4}
                        style={{ fontSize: '0.95rem', width: '100%', background: 'var(--bg-card)' }}
                    />
                );
        }
    };

    const isLastQuestion = !currentQuestion.nextQuestionId &&
        (!currentQuestion.options || !currentQuestion.options.some(o => o.nextQuestionId));

    return (
        <div className="branching-questionnaire">
            {/* Progress Bar (Estimated) */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                            Step {history.length + 1}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            • {currentQuestionId.toUpperCase()}
                        </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                        BRANCHING FLOW
                    </span>
                </div>
                <div style={{ height: '4px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${Math.min(((history.length + 1) / 25) * 100, 100)}%`, // Estimated total of ~25 questions in a path
                        background: 'var(--primary)',
                        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                </div>
            </div>

            {/* Current Question */}
            <div style={{
                padding: '24px',
                background: 'var(--bg-elevated)',
                borderRadius: '12px',
                border: '1px solid var(--border-default)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                marginBottom: '24px'
            }}>
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', lineHeight: 1.4, fontWeight: 600 }}>
                        {currentQuestion.question}
                    </h3>
                    {currentQuestion.questionEn && (
                        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
                            {currentQuestion.questionEn}
                        </p>
                    )}
                </div>

                {/* Input Area */}
                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="label" style={{ marginBottom: '12px', display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        RESPONSE
                    </label>
                    {renderInput()}
                </div>

                {/* Remarks */}
                {currentQuestion.remarks && (
                    <div className="form-group" style={{ borderTop: '1px solid var(--border-default)', paddingTop: '20px' }}>
                        <label className="label" style={{ marginBottom: '8px', display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            INTERVIEWER NOTES
                            <span style={{ fontWeight: 400, marginLeft: '4px', opacity: 0.7 }}>
                                (optional)
                            </span>
                        </label>
                        <textarea
                            className="textarea"
                            placeholder="Add your observation or direct quote..."
                            value={currentAnswer.remarks || ''}
                            onChange={e => handleRemarksChange(e.target.value)}
                            rows={2}
                            style={{ fontSize: '0.9rem', background: 'var(--bg-inset)', border: 'none' }}
                        />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    className="btn btn-secondary"
                    onClick={handleBack}
                    disabled={history.length === 0}
                    style={{ gap: '8px' }}
                >
                    <ChevronLeft size={18} /> Previous
                </button>

                {!isLastQuestion ? (
                    <button
                        className="btn btn-primary"
                        onClick={handleNext}
                        disabled={!currentAnswer.answer || (Array.isArray(currentAnswer.answer) && currentAnswer.answer.length === 0)}
                        style={{ gap: '8px', minWidth: '120px' }}
                    >
                        Next <ChevronRight size={18} />
                    </button>
                ) : (
                    <div style={{
                        padding: '8px 16px',
                        background: 'var(--success-light)',
                        color: 'var(--success)',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <CheckCircle size={18} /> Final Step
                    </div>
                )}
            </div>
        </div>
    );
};
