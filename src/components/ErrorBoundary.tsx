import { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    fontFamily: 'system-ui, sans-serif'
                }}>
                    <h1 style={{ color: '#e74c3c', marginBottom: '16px' }}>Something went wrong</h1>
                    <p style={{ color: '#666', marginBottom: '24px' }}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Reload Page
                    </button>
                    <details style={{ marginTop: '32px', textAlign: 'left', maxWidth: '600px', margin: '32px auto' }}>
                        <summary style={{ cursor: 'pointer', color: '#666' }}>Error Details</summary>
                        <pre style={{
                            background: '#f5f5f5',
                            padding: '16px',
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontSize: '12px',
                            marginTop: '8px'
                        }}>
                            {this.state.error?.stack}
                        </pre>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}
