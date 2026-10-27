import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            margin: '2rem auto',
            maxWidth: '640px',
            padding: '2rem',
            background: '#ffffff',
            border: '1px solid #fee2e2',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.08)',
            textAlign: 'center',
            fontFamily: 'inherit',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <AlertCircle size={24} />
          </div>
          <h3 style={{ margin: '0 0 0.5rem', color: '#111827', fontSize: '1.25rem', fontWeight: 700 }}>
            {this.props.title || 'Unable to load section'}
          </h3>
          <p style={{ margin: '0 0 1.25rem', color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {this.props.message ||
              'A temporary display issue occurred while loading this view. You can reload this section or navigate to another tab.'}
          </p>
          {this.state.error && (
            <pre
              style={{
                background: '#f8fafc',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                fontSize: '0.75rem',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '1.25rem',
                maxHeight: '120px',
              }}
            >
              {this.state.error.message || String(this.state.error)}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
            }}
          >
            <RotateCcw size={15} /> Reload Section
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
