import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import type { InterviewQuestion } from '../../hooks/useValidationData';

interface QuestionnaireFormProps {
    questions: InterviewQuestion[];
    onChange: (questions: InterviewQuestion[]) => void;
}

export const QuestionnaireForm = ({ questions, onChange }: QuestionnaireFormProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentQuestion = questions[currentIndex];
    const answeredCount = questions.filter(q => q.answer && q.answer.trim().length > 0).length;
    const progress = (answeredCount / questions.length) * 100;

    const updateQuestion = (id: string, field: 'answer' | 'remarks', value: string) => {
        const updated = questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        );
        onChange(updated);
    };

    const goToNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const goToQuestion = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <div>
            {/* Progress Bar */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        Progress: {answeredCount} of {questions.length} answered
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {Math.round(progress)}%
                    </span>
                </div>
                <div style={{
                    height: '6px',
                    background: 'var(--border-default)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'var(--primary)',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>

            {/* Question Navigator */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                {questions.map((q, idx) => {
                    const isAnswered = q.answer && q.answer.trim().length > 0;
                    const isCurrent = idx === currentIndex;

                    return (
                        <button
                            key={q.id}
                            className={`btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => goToQuestion(idx)}
                            style={{
                                minWidth: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            {isAnswered ? <CheckCircle size={14} /> : <Circle size={14} />}
                            {idx + 1}
                        </button>
                    );
                })}
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
                    Question {currentIndex + 1} of {questions.length}
                </div>

                <h3 style={{
                    margin: '0 0 20px 0',
                    fontSize: '1.1rem',
                    lineHeight: 1.5
                }}>
                    {currentQuestion.question}
                </h3>

                {/* Answer */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="label">Answer *</label>
                    <textarea
                        className="textarea"
                        placeholder="Type the teacher's response here..."
                        value={currentQuestion.answer || ''}
                        onChange={e => updateQuestion(currentQuestion.id, 'answer', e.target.value)}
                        rows={4}
                        style={{ fontSize: '0.95rem' }}
                    />
                </div>

                {/* Remarks */}
                <div className="form-group">
                    <label className="label">
                        Your Remarks/Observations
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px' }}>
                            (optional)
                        </span>
                    </label>
                    <textarea
                        className="textarea"
                        placeholder="Add your observations, tone, body language, follow-up ideas..."
                        value={currentQuestion.remarks || ''}
                        onChange={e => updateQuestion(currentQuestion.id, 'remarks', e.target.value)}
                        rows={3}
                        style={{ fontSize: '0.9rem' }}
                    />
                </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    className="btn btn-secondary"
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft size={16} /> Previous
                </button>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {currentIndex + 1} / {questions.length}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={goToNext}
                    disabled={currentIndex === questions.length - 1}
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};
