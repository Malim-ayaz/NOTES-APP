import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { AuthProvider } from '../../context/AuthContext';
import * as api from '../../services/api';

vi.mock('../../services/api');

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    api.authAPI.login.mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } }
    });

    renderWithProviders(<Login />);
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('calls login API with email and password', async () => {
    const user = userEvent.setup();
    api.authAPI.login.mockResolvedValue({
      user: { id: 1, username: 'test', email: 'test@example.com' },
      token: 'mock-token'
    });

    renderWithProviders(<Login />);
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(api.authAPI.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup();
    api.authAPI.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithProviders(<Login />);
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText('Logging in...')).toBeInTheDocument();
  });
});

