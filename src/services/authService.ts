/**
 * ASTRA HEALTH Authentication Service.
 * Provides typed register, login, logout, and current-user functions
 * using the existing API client.
 */

import { api, setCsrfToken } from './api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Profile,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '../types/auth';

export const authService = {
  /**
   * Register a new astronaut account.
   */
  async register(input: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('No data returned from server');
    }
    return response.data;
  },

  /**
   * Log in with email and password.
   * Captures the CSRF token from the response for subsequent requests.
   */
  async login(input: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('No data returned from server');
    }
    if (response.data.csrfToken) {
      setCsrfToken(response.data.csrfToken);
    }
    return response.data;
  },

  /**
   * Log out the current user.
   */
  async logout(): Promise<void> {
    const response = await api.post('/auth/logout');
    if (response.error) {
      throw new Error(response.error);
    }
    setCsrfToken(null);
  },

  /**
   * Get the currently authenticated user.
   * Restores session state via /auth/me.
   */
  async me(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me');
    if (response.error) {
      throw new Error(response.error || 'Not authenticated');
    }
    if (!response.data || !response.data.user) {
      throw new Error('No user data returned');
    }
    return response.data.user;
  },

  /**
   * Get the authenticated astronaut's profile details.
   */
  async getProfile(): Promise<Profile> {
    const response = await api.get<{ user: Profile }>('/auth/profile');
    if (response.error) {
      throw new Error(response.error || 'Failed to load profile');
    }
    if (!response.data || !response.data.user) {
      throw new Error('No profile data returned');
    }
    return response.data.user;
  },

  /**
   * Update the authenticated astronaut's profile (full_name only).
   */
  async updateProfile(input: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const response = await api.patch<UpdateProfileResponse>('/auth/profile', input);
    if (response.error) {
      throw new Error(response.error || 'Failed to update profile');
    }
    if (!response.data) {
      throw new Error('No data returned from server');
    }
    return response.data;
  },

  /**
   * Change the authenticated astronaut's password.
   */
  async changePassword(input: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await api.post<ChangePasswordResponse>('/auth/password-change', input);
    if (response.error) {
      throw new Error(response.error || 'Failed to change password');
    }
    if (!response.data) {
      throw new Error('No data returned from server');
    }
    return response.data;
  },
};
