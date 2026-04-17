import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button.jsx';
import { useToast } from '../../contexts/ToastContext';

interface FallbackRenderProps {
  error: Error | null;
  onReset: () => void;
}

interface ErrorBoundaryBaseProps {
  children: any;
  renderFallback: (props: FallbackRenderProps) => any;
  onError?: (error: Error, info: any) => void;
}

interface ErrorBoundaryBaseState {
  hasError: boolean;
  error: Error | null;
}

const BaseComponent = Component as any;

class ErrorBoundaryBase extends BaseComponent {
  declare props: ErrorBoundaryBaseProps;
  declare state: ErrorBoundaryBaseState;

  constructor(props: ErrorBoundaryBaseProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryBaseState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App boundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return this.props.renderFallback({
        error: this.state.error,
        onReset: this.handleReset,
      });
    }

    return this.props.children;
  }
}

interface AppErrorBoundaryProps {
  children: any;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const handleError = (error: Error) => {
    // Surface a toast notification alongside the fallback UI so the user has
    // a clearer signal about what happened (integration with ToastProvider).
    showToast({
      tone: 'error',
      title: t('common.error'),
      message: error.message || t('errors.unexpectedBody'),
      duration: 8000,
    });
  };

  const BoundaryJsx = ErrorBoundaryBase as any;

  return (
    <BoundaryJsx
      onError={handleError}
      renderFallback={({ onReset }: { onReset: () => void }) => (
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl rounded-[28px] border border-red-200 bg-white p-8 text-center shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)]">
            <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={24} />
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-stone-900">
              {t('common.error')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-500">
              {t('errors.unexpectedBody')}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={onReset}>
                <RefreshCw size={14} />
                {t('errors.reloadPage')}
              </Button>
              <Button variant="ghost" as={Link} to="/">
                {t('errors.goHome')}
              </Button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </BoundaryJsx>
  );
}
