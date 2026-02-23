import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('應渲染 label 與 input', () => {
    render(<Input label="電子郵件" placeholder="請輸入" />);
    expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('請輸入')).toBeInTheDocument();
  });

  it('有 error 時應顯示錯誤訊息', () => {
    render(<Input label="密碼" error="密碼必填" />);
    expect(screen.getByText('密碼必填')).toBeInTheDocument();
  });

  it('有 hint 且無 error 時應顯示 hint', () => {
    render(<Input label="姓名" hint="請填寫真實姓名" />);
    expect(screen.getByText('請填寫真實姓名')).toBeInTheDocument();
  });

  it('可接受 value 與 onChange', () => {
    const { rerender } = render(<Input value="test" onChange={() => {}} />);
    const input = screen.getByDisplayValue('test');
    expect(input).toBeInTheDocument();
    rerender(<Input value="updated" onChange={() => {}} />);
    expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
  });
});
