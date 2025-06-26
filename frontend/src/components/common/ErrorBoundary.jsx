import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f9fafb'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        width: '100%',
                        backgroundColor: 'white',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        padding: '24px',
                        margin: '20px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            margin: '0 auto',
                            backgroundColor: '#fee2e2',
                            borderRadius: '50%',
                            marginBottom: '24px'
                        }}>
                            <svg
                                style={{ width: '24px', height: '24px', color: '#dc2626' }}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>

                        <h2 style={{
                            marginTop: '24px',
                            textAlign: 'center',
                            fontSize: '1.875rem',
                            fontWeight: '800',
                            color: '#dc2626',
                            marginBottom: '16px'
                        }}>
                            Something went wrong
                        </h2>

                        <p style={{
                            marginTop: '8px',
                            textAlign: 'center',
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '24px'
                        }}>
                            We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
                        </p>

                        {/* Error Details (only show in development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{
                                marginBottom: '24px',
                                padding: '16px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '6px',
                                fontSize: '0.75rem'
                            }}>
                                <summary style={{
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Error Details (Development Mode)
                                </summary>
                                <div style={{
                                    marginTop: '8px',
                                    padding: '8px',
                                    backgroundColor: '#fee2e2',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace',
                                    whiteSpace: 'pre-wrap',
                                    color: '#991b1b'
                                }}>
                                    <strong>Error:</strong> {this.state.error.toString()}
                                    <br />
                                    <strong>Stack:</strong> {this.state.error.stack}
                                    {this.state.errorInfo && (
                                        <>
                                            <br />
                                            <strong>Component Stack:</strong> {this.state.errorInfo.componentStack}
                                        </>
                                    )}
                                </div>
                            </details>
                        )}

                        <div style={{
                            marginTop: '24px',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '12px'
                        }}>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                            >
                                Reload Page
                            </button>

                            <button
                                onClick={() => window.history.back()}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
