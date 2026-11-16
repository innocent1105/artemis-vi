/**
 * ASTRA HEALTH useAuth Hook.
 * Provides access to authentication state and actions.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { User } from '../types/auth';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { User };
