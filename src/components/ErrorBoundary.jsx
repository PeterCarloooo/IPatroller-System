import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Optionally log error to an error reporting service
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)',
          color: '#222',
          fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
          padding: 32,
        }}>
          <div style={{
            background: '#fff',
            border: '1.5px solid #e0e7ef',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(76, 81, 255, 0.10)',
            padding: 32,
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, color: '#dc3545', marginBottom: 16 }}>
              <i className="fas fa-exclamation-triangle" />
            </div>
            <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Something went wrong</h2>
            <div style={{ color: '#888', marginBottom: 24 }}>
              An unexpected error occurred. Please try reloading the page.<br />
              If the problem persists, contact support.
            </div>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details style={{ textAlign: 'left', marginBottom: 16 }}>
                <summary style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>Error details</summary>
                <pre style={{ fontSize: 13, color: '#dc3545', whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.toString()}</pre>
                <pre style={{ fontSize: 12, color: '#888', whiteSpace: 'pre-wrap' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
              </details>
            )}
            <button
              onClick={this.handleReload}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.75rem 2rem',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(76, 81, 255, 0.08)',
                marginTop: 8,
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 