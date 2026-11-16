/**
 * ASTRA HEALTH Authentication Context.
 * Provides authentication state and actions to the application.
 */

import { createContext, useContext, useEffect, useCallback, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, AuthState, Profile } from '../types/auth';

export const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (full_name: string) => Promise<void>;
  changePassword: (
    current_password: string,
    new_password: string,
    password_confirmation: string
  ) => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const setUser = (user: User | null) => {
    setState((prev) => ({
      ...prev,
      user,
      profile: null,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    }));
  };

  const setProfile = (profile: Profile | null) => {
    setState((prev) => ({ ...prev, profile }));
  };

  const fetchProfile = useCallback(async (): Promise<void> => {
    try {
      const profile = await authService.getProfile();
      setProfile(profile);
    } catch {
      setProfile(null);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authService.login({ email, password });
      const user = await authService.me();
      setUser(user);
      await fetchProfile();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  }, [fetchProfile]);

  const register = useCallback(async (
    email: string,
    password: string,
    full_name: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authService.register({ email, password, full_name });
      await authService.login({ email, password });
      const user = await authService.me();
      setUser(user);
      await fetchProfile();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    }
  }, [fetchProfile]);

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors — clear local state regardless
    }
    setState(() => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }));
  }, []);

  const updateProfile = useCallback(async (full_name: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile({ full_name });
      setProfile(response.user);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Profile update failed');
      throw err;
    }
    setLoading(false);
  }, []);

  const changePassword = useCallback(async (
    current_password: string,
    new_password: string,
    password_confirmation: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authService.changePassword({
        current_password,
        new_password,
        password_confirmation,
      });
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Password change failed');
      throw err;
    }
    setLoading(false);
  }, []);

  const restoreSession = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.me();
      setUser(user);
      await fetchProfile();
    } catch {
      // Session not valid — clear state
      setState(() => ({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }));
    }
  }, [fetchProfile]);

  useEffect(() => {
    restoreSession();
  }, []);

  const value = {
    state,
    login,
    register,
    logout,
    restoreSession,
    fetchProfile,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
