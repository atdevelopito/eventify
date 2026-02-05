import React from 'react';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null, errorInfo: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', fontFamily: 'monospace', color: 'red', backgroundColor: '#fff0f0' }}>
                    <h1>Something went wrong.</h1>
                    <h2 style={{ color: '#333' }}>Error: {this.state.error?.toString()}</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.errorInfo?.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
