// Simple auth utilities for role-based access
import { User, UserRole, AuthState } from '@/types';
import { mockUsers } from './mockData';

const AUTH_STORAGE_KEY = 'discharge_dashboard_auth';

export function getStoredAuth(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user,
        isAuthenticated: !!parsed.user,
      };
    }
  } catch (error) {
    console.error('Error parsing stored auth:', error);
  }
  
  return {
    user: null,
    isAuthenticated: false,
  };
}

export function setStoredAuth(user: User): void {
  const authState: AuthState = {
    user,
    isAuthenticated: true,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function mockLogin(email: string, role: UserRole): User | null {
  // Find user by email or create a mock user with the selected role
  let user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    user = {
      id: `mock_${Date.now()}`,
      email,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role,
    };
  }
  
  setStoredAuth(user);
  return user;
}

export function canPerformAction(userRole: UserRole, action: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    admin: ['*'], // Can do everything
    doctor: ['complete_signal', 'create_task', 'complete_task', 'start_discharge'],
    case_manager: ['complete_signal', 'create_task', 'complete_task', 'send_placement', 'accept_placement'],
    nurse: ['complete_signal', 'create_task', 'complete_task', 'patient_education'],
  };

  const userPermissions = permissions[userRole] || [];
  return userPermissions.includes('*') || userPermissions.includes(action);
}