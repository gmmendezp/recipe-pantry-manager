// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  createLink: (component: unknown) => component,
  Link: ({ children, to }: { children?: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock('#/lib/auth/functions', () => ({
  loginWithDemoAccount: vi.fn(),
  loginWithPassword: vi.fn(),
}));

import { LoginPage } from '#/features/auth/components/login-page';
import { loginWithDemoAccount, loginWithPassword } from '#/lib/auth/functions';

const mockLoginWithDemoAccount = vi.mocked(loginWithDemoAccount);
const mockLoginSuccess = vi.fn();

beforeEach(() => {
  mockLoginSuccess.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('shows the demo login button when the demo account is available', () => {
    render(
      <LoginPage isDemoAccountAvailable onLoginSuccess={mockLoginSuccess} />,
    );

    expect(
      screen.getByRole('button', { name: 'Try demo account' }),
    ).toBeTruthy();
  });

  it('hides the demo login button when the demo account is unavailable', () => {
    render(
      <LoginPage
        isDemoAccountAvailable={false}
        onLoginSuccess={mockLoginSuccess}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Try demo account' }),
    ).toBeNull();
  });

  it('logs in with the demo account and handles success', async () => {
    mockLoginWithDemoAccount.mockResolvedValue({
      user: { email: 'demo@example.com', id: 'demo-user' },
    });

    render(
      <LoginPage isDemoAccountAvailable onLoginSuccess={mockLoginSuccess} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try demo account' }));

    await waitFor(() => {
      expect(mockLoginWithDemoAccount).toHaveBeenCalledOnce();
      expect(mockLoginSuccess).toHaveBeenCalledOnce();
    });
  });

  it('disables both login buttons while the demo login is pending', async () => {
    let resolveLogin: (() => void) | undefined;
    mockLoginWithDemoAccount.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = () =>
            resolve({
              user: { email: 'demo@example.com', id: 'demo-user' },
            });
        }),
    );

    render(
      <LoginPage isDemoAccountAvailable onLoginSuccess={mockLoginSuccess} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try demo account' }));

    expect(screen.getByRole('button', { name: 'Log in' })).toHaveProperty(
      'disabled',
      true,
    );
    expect(
      screen.getByRole('button', { name: 'Logging in...' }),
    ).toHaveProperty('disabled', true);

    resolveLogin?.();

    await waitFor(() => {
      expect(mockLoginSuccess).toHaveBeenCalledOnce();
    });
  });

  it('displays demo login errors', async () => {
    mockLoginWithDemoAccount.mockRejectedValue(
      new Error('Unable to access the demo account.'),
    );

    render(
      <LoginPage isDemoAccountAvailable onLoginSuccess={mockLoginSuccess} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try demo account' }));

    expect(
      await screen.findByText('Unable to access the demo account.'),
    ).toBeTruthy();
    expect(mockLoginSuccess).not.toHaveBeenCalled();
  });

  it('use password login for the regular form', async () => {
    const mockLoginWithPassword = vi.mocked(loginWithPassword);
    mockLoginWithPassword.mockResolvedValue({
      user: { email: 'user@example.com', id: 'user' },
    });

    render(
      <LoginPage isDemoAccountAvailable onLoginSuccess={mockLoginSuccess} />,
    );
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(mockLoginWithPassword).toHaveBeenCalledWith({
        data: { email: 'user@example.com', password: 'password' },
      });
    });
  });
});
