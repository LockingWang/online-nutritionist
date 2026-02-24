import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Test error');
  return <div>正常內容</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('無錯誤時應渲染 children', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('正常內容')).toBeInTheDocument();
  });

  it('子元件拋錯時應顯示錯誤 UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('發生錯誤')).toBeInTheDocument();
    expect(screen.getByText(/頁面載入時發生問題/)).toBeInTheDocument();
  });

  it('有 fallback 時應顯示 fallback 而非預設錯誤 UI', () => {
    render(
      <ErrorBoundary fallback={<div>自訂錯誤畫面</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('自訂錯誤畫面')).toBeInTheDocument();
    expect(screen.queryByText('發生錯誤')).not.toBeInTheDocument();
  });

  it('點擊「再試一次」且 children 不再拋錯時應顯示正常內容', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('發生錯誤')).toBeInTheDocument();
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    await userEvent.click(screen.getByRole('button', { name: '再試一次' }));
    expect(screen.getByText('正常內容')).toBeInTheDocument();
  });
});
