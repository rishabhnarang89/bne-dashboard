import type { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
    content: string;
    children?: ReactNode;
}

export const Tooltip = ({ content, children }: TooltipProps) => {
    return (
        <div className="tooltip-container">
            {children || (
                <span className="tooltip-trigger">
                    <HelpCircle size={16} />
                </span>
            )}
            <div className="tooltip-content">
                {content}
            </div>
        </div>
    );
};

interface InfoBlockProps {
    title: string;
    description: string;
    icon?: ReactNode;
    variant?: 'info' | 'success' | 'warning' | 'danger';
}

export const InfoBlock = ({ title, description, icon, variant = 'info' }: InfoBlockProps) => {
    const variantColors = {
        info: { bg: 'var(--info-light)', border: '#bfdbfe', text: '#1e40af' },
        success: { bg: 'var(--success-light)', border: '#a7f3d0', text: 'var(--primary-dark)' },
        warning: { bg: 'var(--warning-light)', border: 'var(--accent-light)', text: '#92400e' },
        danger: { bg: 'var(--danger-light)', border: '#fecaca', text: 'var(--danger)' }
    };

    const colors = variantColors[variant];

    return (
        <div className="alert" style={{ background: colors.bg, borderColor: colors.border }}>
            {icon && <div style={{ color: colors.text, flexShrink: 0 }}>{icon}</div>}
            <div>
                <div className="alert-title" style={{ color: colors.text }}>{title}</div>
                <div className="alert-description" style={{ color: colors.text }}>{description}</div>
            </div>
        </div>
    );
};
