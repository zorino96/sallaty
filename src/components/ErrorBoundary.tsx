'use client';

import React from 'react';

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (typeof console !== 'undefined') {
      console.error('[ErrorBoundary]', error, info?.componentStack);
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: undefined });
    try {
      window.location.replace('/');
    } catch {
      /* ignore */
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    const message = this.state.error?.message ?? '';
    return (
      <div
        className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 px-8 text-center"
        style={{ background: '#0E2421', color: '#E8E0CB' }}
      >
        <div className="font-rabar text-2xl font-bold">سەڵاتی</div>
        <div className="text-sm opacity-80">کێشەیەک ڕوویدا — تکایە دووبارە دەستپێ بکە</div>
        <div className="text-sm opacity-80" dir="ltr">Something went wrong. Tap to restart.</div>
        {message && (
          <pre
            className="max-w-[80vw] overflow-auto rounded-lg bg-black/30 p-2 text-[10px] opacity-60"
            dir="ltr"
          >
            {message}
          </pre>
        )}
        <button
          onClick={this.reset}
          className="mt-4 rounded-full px-6 py-3 text-sm font-semibold"
          style={{ background: '#C8A654', color: 'white' }}
        >
          دەستپێ بکەرەوە · Restart
        </button>
      </div>
    );
  }
}
