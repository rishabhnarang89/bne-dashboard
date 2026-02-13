import { useValidationData } from '../../hooks/useValidationData';
import { Printer, AlertTriangle, CheckCircle2, Target } from 'lucide-react';
import { useMemo } from 'react';

export const Report = () => {
    const {
        completedInterviews, teachers, goals,
        avgScore, pilotCount
    } = useValidationData();

    // Calculate Insights (duplicated from Analytics for standalone report)
    const insights = useMemo(() => {
        const barriers: Record<string, number> = {};
        const features: string[] = [];

        completedInterviews.forEach(interview => {
            if (interview.questions && Array.isArray(interview.questions)) {
                // Barriers
                const q10w = interview.questions.find((q: any) => q.id === 'q10w');
                const q8q = interview.questions.find((q: any) => q.id === 'q8q');
                if (q10w && q10w.answer) barriers[q10w.answer as string] = (barriers[q10w.answer as string] || 0) + 1;
                if (q8q && q8q.answer) barriers[q8q.answer as string] = (barriers[q8q.answer as string] || 0) + 1;

                // Features
                const q10v = interview.questions.find((q: any) => q.id === 'q10v');
                if (q10v && q10v.answer && typeof q10v.answer === 'string' && q10v.answer.length > 3) {
                    features.push(q10v.answer);
                }
            }
        });

        const barrierList = Object.entries(barriers)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([label]) => label === 'price' || label === 'expensive' ? 'Price Sensitivity' :
                label === 'features' ? 'Missing Features' :
                    label === 'curriculum' ? 'Curriculum Fit' :
                        label === 'complex' ? 'Complexity' :
                            label === 'no_equipment' ? 'No Equipment' : label);

        return { topBarriers: barrierList, topFeatures: features.slice(0, 3) };
    }, [completedInterviews]);

    const conversionRate = teachers.length > 0 ? Math.round((completedInterviews.length / teachers.length) * 100) : 0;
    const pilotRate = completedInterviews.length > 0 ? Math.round((pilotCount / completedInterviews.length) * 100) : 0;

    return (
        <div className="report-container" style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', color: 'black' }}>
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 2cm; }
                    body { background: white; color: black; -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .sidebar, .mobile-header { display: none !important; }
                    .main-content { margin: 0 !important; padding: 0 !important; }
                    .report-container { padding: 0 !important; max-width: none !important; }
                }
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px', borderBottom: '2px solid black', paddingBottom: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>BNE Validation Report</h1>
                    <div style={{ fontSize: '1rem', color: '#666', marginTop: '4px' }}>
                        Generated: {new Date().toLocaleDateString()}
                    </div>
                </div>
                <button
                    className="btn btn-primary no-print"
                    onClick={() => window.print()}
                    style={{ gap: '8px' }}
                >
                    <Printer size={16} /> Print Report
                </button>
            </div>

            {/* Executive Summary */}
            <section style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', color: '#333' }}>
                    Executive Summary
                </h3>
                <p style={{ lineHeight: 1.6, fontSize: '1rem', color: '#444' }}>
                    We have engaged with <strong>{teachers.length} teachers</strong> and completed <strong>{completedInterviews.length} interviews</strong>.
                    The current pilot conversation rate is <strong>{pilotRate}%</strong> ({pilotCount} pilots), with an average product score of <strong>{avgScore.toFixed(1)}/10</strong>.
                    {pilotCount >= goals.targetPilots
                        ? " We have met our pilot target, indicating strong initial traction."
                        : " We are currently below our pilot target and need to address key barriers."}
                </p>
            </section>

            {/* Key Metrics Grid */}
            <section style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', color: '#333' }}>
                    Key Performance Indicators
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111' }}>{completedInterviews.length}</div>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, color: '#666' }}>Interviews</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: avgScore >= 8 ? '#10b981' : '#f59e0b' }}>{avgScore.toFixed(1)}</div>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, color: '#666' }}>Avg Score</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111' }}>{pilotCount}</div>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, color: '#666' }}>Pilots</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111' }}>{conversionRate}%</div>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, color: '#666' }}>Conversion</div>
                    </div>
                </div>
            </section>

            {/* Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                <section>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
                        <AlertTriangle size={20} /> Top Barriers
                    </h3>
                    {insights.topBarriers.length > 0 ? (
                        <ul style={{ paddingLeft: '20px', marginTop: '12px' }}>
                            {insights.topBarriers.map((b, i) => (
                                <li key={i} style={{ marginBottom: '8px', color: '#444' }}>{b}</li>
                            ))}
                        </ul>
                    ) : <p style={{ color: '#888', fontStyle: 'italic' }}>No data collected yet.</p>}
                </section>
                <section>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
                        <Target size={20} /> Requested Features
                    </h3>
                    {insights.topFeatures.length > 0 ? (
                        <ul style={{ paddingLeft: '20px', marginTop: '12px' }}>
                            {insights.topFeatures.map((f, i) => (
                                <li key={i} style={{ marginBottom: '8px', color: '#444' }}>"{f}"</li>
                            ))}
                        </ul>
                    ) : <p style={{ color: '#888', fontStyle: 'italic' }}>No feature requests yet.</p>}
                </section>
            </div>

            {/* Traffic Light Assessment */}
            <section style={{ padding: '24px', background: avgScore >= 8 ? '#f0fdf4' : avgScore >= 5 ? '#fffbeb' : '#fef2f2', border: '1px solid currentColor', borderRadius: '8px', color: avgScore >= 8 ? '#166534' : avgScore >= 5 ? '#92400e' : '#991b1b' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={24} />
                    {avgScore >= 7 && pilotCount >= 1 ? "Positive Signal" : "Mixed Signals - Proceed with Caution"}
                </h3>
                <p style={{ margin: 0 }}>
                    {avgScore >= 8
                        ? "Strong product-market fit indications. Teachers are willing to pilot and scores are high."
                        : avgScore >= 5
                            ? "Some traction, but significant objections exist around budget/complexity. Refine pitch before building."
                            : "Major friction encountered. Consider pivoting or fundamentally changing the value prop."}
                </p>
            </section>
        </div>
    );
};
