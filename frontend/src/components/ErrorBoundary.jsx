import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          padding: '24px',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={26} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Portal Component Error</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  An unexpected error occurred while rendering this module.
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#090d16',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#f87171',
              fontFamily: 'monospace',
              maxHeight: '140px',
              overflowY: 'auto',
              marginBottom: '24px',
              border: '1px solid #450a0a'
            }}>
              {this.state.error?.toString()}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} /> Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#334155',
                  color: '#e2e8f0',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Home size={16} /> Return to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
