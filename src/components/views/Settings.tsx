import { InfoBlock } from '../ui';
import { Settings as SettingsIcon } from 'lucide-react';

export const Settings = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <InfoBlock
                icon={<SettingsIcon size={20} />}
                title="Settings"
                description="Customize your dashboard preferences, goals, and data management."
                variant="info"
            />
            <div className="glass-card" style={{ marginTop: '20px', textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-muted)' }}>Settings panel coming soon.</p>
            </div>
        </div>
    );
};
