import { useMemo } from 'react';
import { useValidationData } from '../../hooks/useValidationData';
import { BarChart3, TrendingUp, Clock, Users, PieChart, Target, Crown } from 'lucide-react';
import { InfoBlock, InterviewScoreTrend, SchoolTypeBreakdown, SetupTimeImprovement, SimpleBarChart } from '../ui';

const OWNER_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
    rishabh: { emoji: '👨‍💻', label: 'Rishabh', color: '#3b82f6', bg: '#eff6ff' },
    tung: { emoji: '🎯', label: 'Tung', color: '#8b5cf6', bg: '#f5f3ff' },
    johannes: { emoji: '🔬', label: 'Johannes', color: '#f59e0b', bg: '#fffbeb' },
    unassigned: { emoji: '❓', label: 'Unassigned', color: '#6b7280', bg: '#f3f4f6' }
};

const STATUS_LABELS: Record<string, { label: string; emoji: string }> = {
    identified: { label: 'Identified', emoji: '🔍' },
    request_sent: { label: 'Sent', emoji: '📤' },
    connected: { label: 'Connected', emoji: '🤝' },
    scheduled: { label: 'Scheduled', emoji: '📅' },
    interviewed: { label: 'Done', emoji: '✅' },
    follow_up: { label: 'Follow-up', emoji: '🔄' }
};

export const Analytics = () => {
    const { interviews, completedInterviews, teachers, goals, avgScore, avgSetupTime, pilotCount, highScoreCount } = useValidationData();

    const commitmentData = useMemo(() => {
        const none = completedInterviews.filter(i => i.commitment === 'none').length;
        const maybe = completedInterviews.filter(i => i.commitment === 'maybe').length;
        const pilot = completedInterviews.filter(i => i.commitment === 'pilot').length;
        return [
            { label: 'None', value: none, color: '#94a3b8' },
            { label: 'Maybe', value: maybe, color: '#f59e0b' },
            { label: 'Pilot', value: pilot, color: '#10b981' }
        ];
    }, [completedInterviews]);

    const priceData = useMemo(() => {
        const positive = completedInterviews.filter(i => i.priceReaction === 'positive').length;
        const neutral = completedInterviews.filter(i => i.priceReaction === 'neutral').length;
        const negative = completedInterviews.filter(i => i.priceReaction === 'negative').length;
        return [
            { label: 'Positive', value: positive, color: '#10b981' },
            { label: 'Neutral', value: neutral, color: '#6b7280' },
            { label: 'Negative', value: negative, color: '#ef4444' }
        ];
    }, [completedInterviews]);

    const scoreDistribution = useMemo(() => {
        const dist: Record<number, number> = {};
        for (let i = 1; i <= 10; i++) dist[i] = 0;
        completedInterviews.forEach(i => dist[i.score]++);
        return Object.entries(dist).map(([score, count]) => ({
            label: score,
            value: count,
            color: parseInt(score) >= 8 ? '#10b981' : parseInt(score) >= 5 ? '#f59e0b' : '#ef4444'
        }));
    }, [completedInterviews]);

    // ========================================================================
    // OWNER-BASED ANALYTICS
    // ========================================================================

    const ownerMetrics = useMemo(() => {
        // Build a map of teacherId → owner
        const teacherOwnerMap = new Map<number, string>();
        teachers.forEach(t => teacherOwnerMap.set(t.id, t.owner || 'unassigned'));

        // Group teachers by owner
        const ownerTeachers: Record<string, typeof teachers> = {};
        teachers.forEach(t => {
            const owner = t.owner || 'unassigned';
            if (!ownerTeachers[owner]) ownerTeachers[owner] = [];
            ownerTeachers[owner].push(t);
        });

        // Group completed interviews by owner (via teacher)
        const ownerInterviews: Record<string, typeof completedInterviews> = {};
        completedInterviews.forEach(i => {
            const owner = teacherOwnerMap.get(i.teacherId) || 'unassigned';
            if (!ownerInterviews[owner]) ownerInterviews[owner] = [];
            ownerInterviews[owner].push(i);
        });

        // Compute per-owner metrics
        const owners = ['rishabh', 'tung', 'johannes', 'unassigned'];
        return owners.map(owner => {
            const ownedTeachers = ownerTeachers[owner] || [];
            const ownedInterviews = ownerInterviews[owner] || [];
            const avgScoreVal = ownedInterviews.length > 0
                ? ownedInterviews.reduce((sum, i) => sum + i.score, 0) / ownedInterviews.length
                : 0;
            const pilots = ownedInterviews.filter(i => i.commitment === 'pilot').length;
            const highScores = ownedInterviews.filter(i => i.score >= 8).length;

            // Pipeline breakdown
            const pipeline: Record<string, number> = {};
            Object.keys(STATUS_LABELS).forEach(s => pipeline[s] = 0);
            ownedTeachers.forEach(t => pipeline[t.status] = (pipeline[t.status] || 0) + 1);

            // Conversion rate: identified → interviewed
            const interviewed = ownedTeachers.filter(t => t.status === 'interviewed').length;
            const conversionRate = ownedTeachers.length > 0
                ? (interviewed / ownedTeachers.length) * 100
                : 0;

            return {
                owner,
                config: OWNER_CONFIG[owner],
                teacherCount: ownedTeachers.length,
                interviewCount: ownedInterviews.length,
                avgScore: avgScoreVal,
                pilots,
                highScores,
                pipeline,
                conversionRate
            };
        }).filter(o => o.teacherCount > 0 || o.interviewCount > 0); // Only show owners with data
    }, [teachers, completedInterviews]);

    // Chart data for owner comparison
    const ownerInterviewChartData = useMemo(() =>
        ownerMetrics.map(o => ({
            label: o.config.emoji,
            value: o.interviewCount,
            color: o.config.color
        }))
        , [ownerMetrics]);

    const ownerScoreChartData = useMemo(() =>
        ownerMetrics.map(o => ({
            label: o.config.emoji,
            value: parseFloat(o.avgScore.toFixed(1)),
            color: o.config.color
        }))
        , [ownerMetrics]);

    const ownerTeacherChartData = useMemo(() =>
        ownerMetrics.map(o => ({
            label: o.config.emoji,
            value: o.teacherCount,
            color: o.config.color
        }))
        , [ownerMetrics]);

    if (completedInterviews.length === 0) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <InfoBlock icon={<BarChart3 size={20} />} title="Analytics Dashboard" description="Complete at least one interview to see your analytics." variant="info" />
                <div className="empty-state" style={{ marginTop: '40px' }}>
                    <div className="empty-state-icon"><BarChart3 size={36} /></div>
                    <div className="empty-state-title">No Data Yet</div>
                    <div className="empty-state-description">Complete some interviews to see analytics.</div>
                </div>
            </div>
        );
    }

    // Find top performer
    const topPerformer = ownerMetrics.length > 0
        ? ownerMetrics.reduce((best, curr) =>
            curr.interviewCount > best.interviewCount ? curr : best
        )
        : null;

    // ========================================================================
    // QUALITATIVE INSIGHTS
    // ========================================================================
    const insights = useMemo(() => {
        const barriers: Record<string, number> = {};
        const features: string[] = [];
        const schoolTypeScores: Record<string, { total: number; count: number }> = {};

        completedInterviews.forEach(interview => {
            // School Type Correlation
            const teacher = teachers.find(t => t.id === interview.teacherId);
            if (teacher && teacher.schoolType) {
                if (!schoolTypeScores[teacher.schoolType]) schoolTypeScores[teacher.schoolType] = { total: 0, count: 0 };
                schoolTypeScores[teacher.schoolType].total += interview.score;
                schoolTypeScores[teacher.schoolType].count++;
            }

            // Extract questions
            if (interview.questions && Array.isArray(interview.questions)) {
                // Barriers (q10w - adoption, q8q - no digital tools)
                const q10w = interview.questions.find((q: any) => q.id === 'q10w');
                const q8q = interview.questions.find((q: any) => q.id === 'q8q');

                if (q10w && q10w.answer) {
                    const ans = q10w.answer as string;
                    barriers[ans] = (barriers[ans] || 0) + 1;
                }
                if (q8q && q8q.answer) {
                    const ans = q8q.answer as string;
                    barriers[ans] = (barriers[ans] || 0) + 1;
                }

                // Features (q10v)
                const q10v = interview.questions.find((q: any) => q.id === 'q10v');
                if (q10v && q10v.answer && typeof q10v.answer === 'string' && q10v.answer.length > 3) {
                    features.push(q10v.answer);
                }
            }
        });

        // Format barriers for chart
        const barrierData = Object.entries(barriers)
            .map(([label, value]) => ({
                label: label === 'price' || label === 'expensive' ? 'Price / Budget' :
                    label === 'features' ? 'Missing Features' :
                        label === 'curriculum' ? 'Curriculum Fit' :
                            label === 'complex' ? 'Too Complex' :
                                label === 'no_equipment' ? 'No Equipment' : label,
                value,
                color: '#ef4444'
            }))
            .sort((a, b) => b.value - a.value);

        // Format school scores
        const schoolScoreData = Object.entries(schoolTypeScores)
            .map(([type, data]) => ({
                label: type,
                value: parseFloat((data.total / data.count).toFixed(1)),
                color: '#3b82f6'
            }))
            .sort((a, b) => b.value - a.value);

        return { barrierData, features: features.slice(0, 5), schoolScoreData };
    }, [completedInterviews, teachers]);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <InfoBlock icon={<BarChart3 size={20} />} title="Analytics Dashboard" description="Track your progress with visual analytics." variant="info" />

            {/* Overall Stats */}
            <div className="stats-grid" style={{ marginTop: '24px' }}>
                <div className="stat-card"><div className="stat-label">Avg Score</div><div className="stat-value">{avgScore.toFixed(1)}</div></div>
                <div className="stat-card"><div className="stat-label">Avg Setup</div><div className="stat-value">{Math.round(avgSetupTime)}s</div></div>
                <div className="stat-card"><div className="stat-label">High Scores</div><div className="stat-value">{highScoreCount}</div></div>
                <div className="stat-card"><div className="stat-label">Pilots</div><div className="stat-value">{pilotCount}</div></div>
            </div>

            {/* ============================================================ */}
            {/* TEAM PERFORMANCE SECTION */}
            {/* ============================================================ */}
            {ownerMetrics.length > 0 && (
                <>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        marginTop: '32px', marginBottom: '16px'
                    }}>
                        <Crown size={22} color="var(--primary)" />
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Team Performance</h3>
                        {topPerformer && topPerformer.interviewCount > 0 && (
                            <span style={{
                                marginLeft: 'auto', fontSize: '0.8rem',
                                padding: '4px 12px', borderRadius: '12px',
                                background: topPerformer.config.bg,
                                color: topPerformer.config.color,
                                fontWeight: 700
                            }}>
                                🏆 {topPerformer.config.label} leads with {topPerformer.interviewCount} interviews
                            </span>
                        )}
                    </div>

                    {/* Per-Owner Scorecards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.min(ownerMetrics.length, 3)}, 1fr)`,
                        gap: '16px', marginBottom: '24px'
                    }}>
                        {ownerMetrics.map(o => (
                            <div key={o.owner} className="glass-card" style={{
                                padding: '20px',
                                borderLeft: `4px solid ${o.config.color}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{o.config.emoji}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{o.config.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {o.teacherCount} teachers · {o.interviewCount} interviews
                                        </div>
                                    </div>
                                </div>

                                {/* Mini stats grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <MiniStat
                                        label="Avg Score"
                                        value={o.avgScore > 0 ? o.avgScore.toFixed(1) : '—'}
                                        color={o.avgScore >= 8 ? '#10b981' : o.avgScore >= 5 ? '#f59e0b' : o.avgScore > 0 ? '#ef4444' : '#6b7280'}
                                    />
                                    <MiniStat
                                        label="High Scores"
                                        value={o.highScores}
                                        color={o.highScores > 0 ? '#10b981' : '#6b7280'}
                                    />
                                    <MiniStat
                                        label="Pilots"
                                        value={o.pilots}
                                        color={o.pilots > 0 ? '#10b981' : '#6b7280'}
                                    />
                                    <MiniStat
                                        label="Conversion"
                                        value={`${Math.round(o.conversionRate)}%`}
                                        color={o.conversionRate >= 50 ? '#10b981' : o.conversionRate > 0 ? '#f59e0b' : '#6b7280'}
                                    />
                                </div>

                                {/* Pipeline mini bars */}
                                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                                        Pipeline
                                    </div>
                                    <div style={{ display: 'flex', gap: '2px', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                        {Object.entries(o.pipeline).map(([status, count]) => {
                                            if (count === 0) return null;
                                            const pct = (count / o.teacherCount) * 100;
                                            const colors: Record<string, string> = {
                                                identified: '#94a3b8',
                                                request_sent: '#60a5fa',
                                                connected: '#34d399',
                                                scheduled: '#a78bfa',
                                                interviewed: '#10b981',
                                                follow_up: '#f59e0b'
                                            };
                                            return (
                                                <div
                                                    key={status}
                                                    title={`${STATUS_LABELS[status]?.label || status}: ${count}`}
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: colors[status] || '#6b7280',
                                                        minWidth: '4px'
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                                        {Object.entries(o.pipeline).map(([status, count]) => {
                                            if (count === 0) return null;
                                            return (
                                                <span key={status} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    {STATUS_LABELS[status]?.emoji} {count}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Owner Comparison Charts */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                        <div className="glass-card">
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={18} /> Interviews by Owner
                            </h4>
                            <SimpleBarChart data={ownerInterviewChartData} height={120} />
                            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '4px' }}>
                                {ownerMetrics.map(o => (
                                    <span key={o.owner} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{o.config.label}</span>
                                ))}
                            </div>
                        </div>
                        <div className="glass-card">
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUp size={18} /> Avg Score by Owner
                            </h4>
                            <SimpleBarChart data={ownerScoreChartData} height={120} />
                            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '4px' }}>
                                {ownerMetrics.map(o => (
                                    <span key={o.owner} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{o.config.label}</span>
                                ))}
                            </div>
                        </div>
                        <div className="glass-card">
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Target size={18} /> Teachers by Owner
                            </h4>
                            <SimpleBarChart data={ownerTeacherChartData} height={120} />
                            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '4px' }}>
                                {ownerMetrics.map(o => (
                                    <span key={o.owner} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{o.config.label}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Original Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
                <div className="glass-card"><h4><TrendingUp size={18} /> Score Trend</h4><InterviewScoreTrend interviews={interviews} /></div>
                <div className="glass-card"><h4><Clock size={18} /> Setup Time</h4><SetupTimeImprovement interviews={interviews} /></div>
                <div className="glass-card"><h4><PieChart size={18} /> School Types</h4><SchoolTypeBreakdown teachers={teachers} /></div>
                <div className="glass-card"><h4><BarChart3 size={18} /> Score Distribution</h4><SimpleBarChart data={scoreDistribution} height={120} /></div>
                <div className="glass-card"><h4><Users size={18} /> Commitment</h4><SimpleBarChart data={commitmentData} height={120} /></div>
                <div className="glass-card"><h4><Target size={18} /> Price (€{goals.pricePoint})</h4><SimpleBarChart data={priceData} height={120} /></div>
            </div>

            {/* Qualitative Insights */}
            <h3 style={{ marginTop: '32px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={22} color="var(--primary)" /> Qualitative Insights
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="glass-card">
                    <h4>🚧 Top Barriers to Adoption</h4>
                    {insights.barrierData.length > 0 ? (
                        <SimpleBarChart data={insights.barrierData} height={160} />
                    ) : (
                        <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No data on barriers yet.</div>
                    )}
                </div>
                <div className="glass-card">
                    <h4>🏫 Score by School Type</h4>
                    {insights.schoolScoreData.length > 0 ? (
                        <SimpleBarChart data={insights.schoolScoreData} height={160} />
                    ) : (
                        <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No data yet.</div>
                    )}
                </div>
                <div className="glass-card" style={{ gridColumn: '1/-1' }}>
                    <h4>✨ Feature Requests & Feedback</h4>
                    {insights.features.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                            {insights.features.map((feat, i) => (
                                <div key={i} style={{
                                    padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.9rem', borderLeft: '3px solid var(--accent)'
                                }}>
                                    "{feat}"
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No feature requests recorded yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Mini stat component for owner scorecards
const MiniStat = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
    <div style={{
        padding: '8px', background: 'var(--bg-card)',
        borderRadius: 'var(--radius-sm)', textAlign: 'center'
    }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{value}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
    </div>
);
