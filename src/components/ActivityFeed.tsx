import { useState, useEffect } from 'react';
import { Scroll, X, CheckCircle, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ActivityLog {
    id: number;
    user_name: string;
    action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'COMPLETE';
    entity_type: 'TEACHER' | 'INTERVIEW' | 'TASK';
    entity_id: number;
    entity_name: string;
    details: any;
    created_at: string;
}

export function ActivityFeed({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
        }
    }, [isOpen]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/activity?limit=50');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch activity logs', error);
        } finally {
            setLoading(false);
        }
    };

    const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

    const getIcon = (type: string) => {
        switch (type) {
            case 'CREATE': return <PlusCircle className="w-4 h-4 text-green-500" />;
            case 'UPDATE': return <Edit className="w-4 h-4 text-blue-500" />;
            case 'COMPLETE': return <CheckCircle className="w-4 h-4 text-purple-500" />;
            case 'DELETE': return <Trash2 className="w-4 h-4 text-red-500" />;
            default: return <Scroll className="w-4 h-4 text-gray-500" />;
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div className={cn(
                "fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-indigo-100",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="flex items-center justify-between p-4 border-b border-indigo-50 bg-indigo-50/50">
                    <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                        <Scroll className="w-5 h-5" />
                        Activity Feed
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white rounded-full transition-colors text-indigo-400 hover:text-indigo-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto h-[calc(100%-64px)] p-4 space-y-4">
                    {loading ? (
                        <div className="text-center py-8 text-indigo-400">Loading activity...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">No recent activity</div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="relative pl-6 pb-4 border-l-2 border-indigo-50 last:border-0">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[5px] top-0 bg-white p-0.5 rounded-full border border-indigo-100">
                                    {getIcon(log.action_type)}
                                </div>

                                <div className="text-sm">
                                    <div className="font-medium text-gray-900 flex flex-wrap gap-1 items-center">
                                        <span className="text-indigo-600 font-semibold">{log.user_name}</span>
                                        <span className="text-gray-500 text-xs lowercase">{log.action_type.replace('_', ' ')}d</span>
                                        <span className="text-gray-800">{log.entity_type.toLowerCase()}</span>
                                    </div>

                                    <div className="text-xs text-indigo-800 font-medium mt-0.5 truncate bg-indigo-50/50 p-1 rounded px-2 inline-block max-w-full">
                                        {log.entity_name || 'Unknown Item'}
                                    </div>

                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        {formatTime(log.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
