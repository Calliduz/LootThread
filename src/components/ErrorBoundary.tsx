import React, { Component, ErrorInfo, ReactNode } from 'react';
import SystemError from '../pages/storefront/SystemError';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <SystemError error={this.state.error} resetError={() => this.setState({ hasError: false, error: null })} />;
    }

    return this.children;
  }

  // Helper to handle context/prop usage if needed
  private get children() {
    return this.props.children;
  }
}

export default ErrorBoundary;
