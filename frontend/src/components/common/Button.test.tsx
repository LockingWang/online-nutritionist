import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('應渲染子文字', () => {
    render(<Button>送出</Button>);
    expect(screen.getByRole('button', { name: '送出' })).toBeInTheDocument();
  });

  it('點擊時應觸發 onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>點我</Button>);
    await userEvent.click(screen.getByRole('button', { name: '點我' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('isLoading 時應顯示載入中且 disabled', () => {
    render(<Button isLoading>送出</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent('載入中');
  });

  it('disabled 時應無法點擊', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>送出</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
