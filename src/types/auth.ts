/**
 * ASTRA HEALTH Authentication Types.
 * TypeScript interfaces for authentication and authorization.
 */

export type UserRole = 'astronaut' | 'medical_personnel' | 'administrator';

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  user: User;
  csrfToken?: string;
  message?: string;
}

export interface Profile {
  id: number;
  email: string;
  full_name: string | null;
  astronaut_id: string | null;
  approval_status: string | null;
}

export interface UpdateProfileRequest {
  full_name: string;
}

export interface UpdateProfileResponse {
  user: Profile;
  message?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  password_confirmation: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
}
