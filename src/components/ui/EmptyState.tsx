import type { ReactNode } from 'react';
import { FileText, Users, ClipboardList, Search } from 'lucide-react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
    return (
        <div className="empty-state">
            {icon && (
                <div className="empty-state-icon">
                    {icon}
                </div>
            )}
            <div className="empty-state-title">{title}</div>
            <div className="empty-state-description">{description}</div>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};

// Pre-configured empty states
export const NoInterviewsEmpty = ({ onAction }: { onAction?: () => void }) => (
    <EmptyState
        icon={<Users size={36} />}
        title="No interviews logged yet"
        description="Start logging teacher interviews to track feedback and calculate your adoption score."
        action={
            onAction && (
                <button className="btn btn-primary" onClick={onAction}>
                    Log Your First Interview
                </button>
            )
        }
    />
);

export const NoSearchResultsEmpty = () => (
    <EmptyState
        icon={<Search size={36} />}
        title="No results found"
        description="Try adjusting your search or filter criteria."
    />
);

export const NoTasksEmpty = () => (
    <EmptyState
        icon={<ClipboardList size={36} />}
        title="All tasks completed!"
        description="Congratulations! You've completed all tasks in this phase."
    />
);

export const NoReflectionsEmpty = () => (
    <EmptyState
        icon={<FileText size={36} />}
        title="No weekly reflections yet"
        description="Add reflections at the end of each week to track your learnings."
    />
);
