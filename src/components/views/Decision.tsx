import { useValidationData } from '../../hooks/useValidationData';
import {
    CheckCircle, XCircle, AlertTriangle, TrendingUp, Clock,
    DollarSign, Rocket, Target
} from 'lucide-react';
import { InfoBlock } from '../ui';

export const Decision = () => {
    const { goals, completedInterviews, getTeacherById, avgScore, avgSetupTime, pilotCount, highScoreCount } = useValidationData();
    const count = completedInterviews.length;

    // Calculate metrics
    const fails = completedInterviews.filter(i => i.success === 'no').length;
    const failRate = count > 0 ? fails / count : 0;
    const posPrice = completedInterviews.filter(i => i.priceReaction === 'positive').length;

    // Checks with customizable goals
    const pass1 = highScoreCount >= goals.targetHighScores || (count < goals.targetHighScores && highScoreCount === count && count > 0);
    const pass2 = avgSetupTime < goals.targetSetupTime && failRate < 0.2 && count > 0;
    const pass3 = pilotCount >= goals.targetPilots;
    const pass4 = count > 0 && (posPrice / count) > 0.5;

    const totalPass = [pass1, pass2, pass3, pass4].filter(Boolean).length;

    const getRecommendation = () => {
        if (count < 3) {
            return {
                status: 'gathering',
                color: 'var(--info)',
                bg: 'var(--info-light)',
                title: '🔬 Gathering Data',
                description: `You have ${count} completed interview${count !== 1 ? 's' : ''}. Need at least ${goals.targetInterviews} for a reliable decision.`
            };
        }
        if (totalPass === 4) {
            return {
                status: 'go',
                color: 'var(--primary-dark)',
                bg: 'var(--success-light)',
                title: '🚀 STRONG GO',
                description: 'All criteria passed! Proceed with EXIST application and production design.'
            };
        }
        if (totalPass === 3) {
            return {
                status: 'conditional',
                color: '#92400e',
                bg: 'var(--warning-light)',
                title: '⚡ CONDITIONAL GO',
                description: 'Strong signal but one criterion failed. Fix the issue and re-validate.'
            };
        }
        if (totalPass === 2) {
            return {
                status: 'pivot',
                color: '#b45309',
                bg: 'var(--warning-light)',
                title: '🔄 PIVOT RECOMMENDED',
                description: 'Core concept has merit but approach needs significant adjustment.'
            };
        }
        return {
            status: 'nogo',
            color: 'var(--danger)',
            bg: 'var(--danger-light)',
            title: '🛑 NO-GO',
            description: 'Fundamental product-market misfit predicted. Consider shutdown or major pivot.'
        };
    };

    const recommendation = getRecommendation();

    const StatusRow = ({
        label,
        target,
        status,
        pass,
        icon: Icon,
        progress
    }: {
        label: string;
        target: string;
        status: string;
        pass: boolean;
        icon: React.ElementType;
        progress?: { current: number; max: number };
    }) => {
        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '20px',
                padding: '20px',
                borderBottom: '1px solid var(--border-light)',
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: pass ? 'var(--success-light)' : 'var(--danger-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Icon size={16} color={pass ? 'var(--primary)' : 'var(--danger)'} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{label}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '42px' }}>
                        Target: {target}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{status}</div>
                        {progress && (
                            <div style={{
                                height: '6px',
                                background: 'var(--border-default)',
                                borderRadius: '3px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${Math.min(100, (progress.current / progress.max) * 100)}%`,
                                    height: '100%',
                                    background: pass ? 'var(--primary)' : 'var(--warning)',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                        )}
                    </div>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: pass ? 'var(--success-light)' : 'var(--danger-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {pass ?
                            <CheckCircle size={20} color="var(--primary)" /> :
                            <XCircle size={20} color="var(--danger)" />
                        }
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <InfoBlock
                icon={<Target size={20} />}
                title="Decision Framework"
                description="This matrix automatically calculates your Go/No-Go recommendation based on the interview data you've collected. All 4 criteria must pass for a strong GO signal."
                variant="info"
            />

            {/* Stats Grid */}
            <div className="stats-grid" style={{ marginTop: '24px' }}>
                <StatCard
                    label="Sample Size"
                    value={count}
                    target={`of ${goals.targetInterviews} goal`}
                    progress={(count / goals.targetInterviews) * 100}
                />
                <StatCard
                    label="Adoption Score"
                    value={avgScore.toFixed(1)}
                    target="Target > 8.0"
                    progress={(avgScore / 10) * 100}
                    isGood={avgScore >= 8}
                />
                <StatCard
                    label="Avg Setup Time"
                    value={`${Math.round(avgSetupTime)}s`}
                    target={`Target < ${goals.targetSetupTime}s`}
                    progress={Math.max(0, 100 - (avgSetupTime / goals.targetSetupTime) * 100)}
                    isGood={avgSetupTime < goals.targetSetupTime && count > 0}
                />
                <StatCard
                    label="Pilot Commits"
                    value={pilotCount}
                    target={`Target ${goals.targetPilots}+`}
                    progress={(pilotCount / goals.targetPilots) * 100}
                    isGood={pilotCount >= goals.targetPilots}
                />
            </div>

            {/* Decision Matrix */}
            <div className="glass-card no-hover" style={{ padding: 0, overflow: 'hidden', marginTop: '24px' }}>
                <div style={{
                    padding: '20px 24px',
                    background: 'var(--bg-elevated)',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0 }}>Go/No-Go Decision Matrix</h3>
                    <div style={{
                        fontSize: '0.9rem',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        background: totalPass >= 3 ? 'var(--primary)' : totalPass >= 2 ? 'var(--warning)' : 'var(--danger)',
                        color: 'white',
                        fontWeight: 'bold'
                    }}>
                        {totalPass}/4 PASS
                    </div>
                </div>

                <StatusRow
                    label="Adoption Intent"
                    target={`${goals.targetHighScores}+ score 8-10`}
                    status={`${highScoreCount} teachers scored ≥ 8`}
                    pass={pass1}
                    icon={TrendingUp}
                    progress={{ current: highScoreCount, max: goals.targetHighScores }}
                />
                <StatusRow
                    label="Tech Feasibility"
                    target={`< ${goals.targetSetupTime}s & < 20% fail`}
                    status={`${Math.round(avgSetupTime)}s avg, ${Math.round(failRate * 100)}% fail rate`}
                    pass={pass2}
                    icon={Clock}
                />
                <StatusRow
                    label="Commitment Signal"
                    target={`${goals.targetPilots}+ Pilots`}
                    status={`${pilotCount} committed to pilot`}
                    pass={pass3}
                    icon={Rocket}
                    progress={{ current: pilotCount, max: goals.targetPilots }}
                />
                <StatusRow
                    label="Price Acceptance"
                    target="> 50% Positive"
                    status={`${posPrice} positive (${Math.round(count > 0 ? (posPrice / count) * 100 : 0)}%)`}
                    pass={pass4}
                    icon={DollarSign}
                />
            </div>

            {/* Recommendation */}
            <div style={{
                marginTop: '24px',
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                background: recommendation.bg,
                border: `1px solid ${recommendation.color}30`
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: recommendation.color + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <AlertTriangle size={24} color={recommendation.color} />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 8px 0', color: recommendation.color, fontSize: '1.1rem' }}>
                            {recommendation.title}
                        </h4>
                        <p style={{ margin: 0, color: recommendation.color, opacity: 0.9 }}>
                            {recommendation.description}
                        </p>
                    </div>
                </div>

                {count >= 3 && totalPass < 4 && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${recommendation.color}30` }}>
                        <h5 style={{ margin: '0 0 12px 0', color: recommendation.color, fontSize: '0.9rem' }}>
                            Suggested Actions:
                        </h5>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: recommendation.color, opacity: 0.9 }}>
                            {!pass1 && <li>Interview more teachers in your target segment to increase high scores</li>}
                            {!pass2 && <li>Simplify the setup process or add better onboarding guides</li>}
                            {!pass3 && <li>Focus on converting "maybe" responses to pilot commitments</li>}
                            {!pass4 && <li>Consider adjusting pricing or adding more perceived value</li>}
                        </ul>
                    </div>
                )}
            </div>

            {/* Quick insights from notes */}
            {completedInterviews.some(i => i.notes) && (
                <div className="glass-card" style={{ marginTop: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Key Insights from Notes</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {completedInterviews
                            .filter(i => i.notes)
                            .slice(0, 5)
                            .map(i => (
                                <div key={i.id} style={{
                                    padding: '12px',
                                    background: 'var(--bg-elevated)',
                                    borderRadius: 'var(--radius-sm)',
                                    borderLeft: `3px solid ${i.score >= 8 ? 'var(--primary)' : i.score >= 5 ? 'var(--warning)' : 'var(--danger)'}`
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        {getTeacherById(i.teacherId)?.name || 'Unknown'} • Score: {i.score}/10
                                    </div>
                                    <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                                        {i.notes!.substring(0, 150)}{i.notes!.length > 150 ? '...' : ''}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({
    label,
    value,
    target,
    progress,
    isGood
}: {
    label: string;
    value: string | number;
    target: string;
    progress?: number;
    isGood?: boolean;
}) => (
    <div className="stat-card">
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{ color: isGood === false ? 'var(--warning)' : undefined }}>
            {value}
        </div>
        <div className="stat-target">{target}</div>
        {progress !== undefined && (
            <div style={{
                height: '4px',
                background: 'var(--border-default)',
                borderRadius: '2px',
                marginTop: '8px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${Math.min(100, progress)}%`,
                    height: '100%',
                    background: progress >= 100 ? 'var(--primary)' : 'var(--primary-light)',
                    transition: 'width 0.5s ease'
                }} />
            </div>
        )}
    </div>
);
