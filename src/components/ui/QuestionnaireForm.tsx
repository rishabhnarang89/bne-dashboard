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
        answer: '',
        remarks: ''
    };

    const handleAnswerChange = (value: string | string[]) => {
        const updatedAnswers = {
            ...answers,
            [currentQuestionId]: {
                ...currentAnswer,
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
                                <span style={{ fontSize: '0.95rem' }}>{opt.label}</span>
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
                        style={{ fontSize: '0.95rem', width: '100%' }}
                    />
                );
        }
    };

    const isLastQuestion = !currentQuestion.nextQuestionId &&
        (!currentQuestion.options || !currentQuestion.options.some(o => o.nextQuestionId));

    return (
        <div>
            {/* Progress Bar (Linear estimation) */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        Current Queue: {history.length + 1}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Question {currentQuestionId}
                    </span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-default)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${Math.min(((history.length + 1) / BRANCHING_QUESTIONS.length) * 100, 100)}%`, // Rough estimate
                        background: 'var(--primary)',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>

            {/* Current Question */}
            <div style={{
                padding: '20px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--border-light)',
                marginBottom: '20px'
            }}>
                <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    Question
                </div>

                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', lineHeight: 1.5 }}>
                    {currentQuestion.question}
                </h3>

                {/* Input Area */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="label">Answer *</label>
                    {renderInput()}
                </div>

                {/* Remarks */}
                {currentQuestion.remarks && (
                    <div className="form-group">
                        <label className="label">
                            Your Remarks/Observations
                            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px' }}>
                                (optional)
                            </span>
                        </label>
                        <textarea
                            className="textarea"
                            placeholder="Add your observations..."
                            value={currentAnswer.remarks || ''}
                            onChange={e => handleRemarksChange(e.target.value)}
                            rows={2}
                            style={{ fontSize: '0.9rem' }}
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
                >
                    <ChevronLeft size={16} /> Previous
                </button>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {/* Optional: Show current Q ID */}
                </div>

                {!isLastQuestion ? (
                    <button
                        className="btn btn-primary"
                        onClick={handleNext}
                        disabled={!currentAnswer.answer} // Require answer to proceed
                    >
                        Next <ChevronRight size={16} />
                    </button>
                ) : (
                    <div className="text-sm font-semibold text-green-600 flex items-center gap-2">
                        <CheckCircle size={16} /> End of Questionnaire
                    </div>
                )}
            </div>
        </div>
    );
};
