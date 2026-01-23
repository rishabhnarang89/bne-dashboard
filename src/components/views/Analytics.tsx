import { useMemo } from 'react';
import { useValidationData } from '../../hooks/useValidationData';
import { BarChart3, TrendingUp, Clock, Users, PieChart, Target } from 'lucide-react';
import { InfoBlock, InterviewScoreTrend, SchoolTypeBreakdown, SetupTimeImprovement, SimpleBarChart } from '../ui';

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

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <InfoBlock icon={<BarChart3 size={20} />} title="Analytics Dashboard" description="Track your progress with visual analytics." variant="info" />

            <div className="stats-grid" style={{ marginTop: '24px' }}>
                <div className="stat-card"><div className="stat-label">Avg Score</div><div className="stat-value">{avgScore.toFixed(1)}</div></div>
                <div className="stat-card"><div className="stat-label">Avg Setup</div><div className="stat-value">{Math.round(avgSetupTime)}s</div></div>
                <div className="stat-card"><div className="stat-label">High Scores</div><div className="stat-value">{highScoreCount}</div></div>
                <div className="stat-card"><div className="stat-label">Pilots</div><div className="stat-value">{pilotCount}</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
                <div className="glass-card"><h4><TrendingUp size={18} /> Score Trend</h4><InterviewScoreTrend interviews={interviews} /></div>
                <div className="glass-card"><h4><Clock size={18} /> Setup Time</h4><SetupTimeImprovement interviews={interviews} /></div>
                <div className="glass-card"><h4><PieChart size={18} /> School Types</h4><SchoolTypeBreakdown teachers={teachers} /></div>
                <div className="glass-card"><h4><BarChart3 size={18} /> Score Distribution</h4><SimpleBarChart data={scoreDistribution} height={120} /></div>
                <div className="glass-card"><h4><Users size={18} /> Commitment</h4><SimpleBarChart data={commitmentData} height={120} /></div>
                <div className="glass-card"><h4><Target size={18} /> Price (€{goals.pricePoint})</h4><SimpleBarChart data={priceData} height={120} /></div>
            </div>
        </div>
    );
};
