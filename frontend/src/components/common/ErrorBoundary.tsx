/**
 * 錯誤邊界（Error Boundary）
 * 捕捉子樹內 React render 錯誤，顯示 fallback 並可重新整理
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary 捕捉到錯誤:', error, errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 bg-gray-50">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-2xl" aria-hidden>⚠️</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">發生錯誤</h2>
            <p className="text-sm text-gray-600 mb-4">
              頁面載入時發生問題，請重新整理後再試。
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs text-red-600 bg-red-50 p-3 rounded-lg mb-4 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              再試一次
            </button>
            <span className="mx-2 text-gray-400">或</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              重新整理頁面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
