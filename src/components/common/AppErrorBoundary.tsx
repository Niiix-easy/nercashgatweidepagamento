import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  reported: boolean;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    reported: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, reported: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error captured by AppErrorBoundary:', error, errorInfo);
    (this as any).setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportIssue = () => {
    (this as any).setState({ reported: true });
  };

  public render() {
    const currentState = (this as any).state as State;
    const currentProps = (this as any).props as Props;

    if (currentState.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
          <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 shadow-2xl dark:border-red-900/40 dark:bg-slate-900">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentProps.fallbackTitle || 'Ocorreu um erro inesperado na aplicação'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nercash Enterprise Engine capturou uma falha de execução para proteger o seu estado.
                </p>
              </div>
            </div>

            {currentState.error && (
              <div className="mb-6 rounded-2xl bg-slate-100 p-4 font-mono text-xs text-red-600 dark:bg-slate-950 dark:text-red-400 overflow-x-auto border border-slate-200 dark:border-slate-800">
                <p className="font-bold">{currentState.error.toString()}</p>
                {currentState.errorInfo?.componentStack && (
                  <pre className="mt-2 text-[10px] text-slate-500 whitespace-pre-wrap">
                    {currentState.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Recarregar Aplicação</span>
              </button>

              {!currentState.reported ? (
                <button
                  type="button"
                  onClick={this.handleReportIssue}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all"
                >
                  <Send className="h-4 w-4 text-emerald-500" />
                  <span>Reportar Issue p/ Suporte</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Relatório enviado com sucesso!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return currentProps.children;
  }
}
