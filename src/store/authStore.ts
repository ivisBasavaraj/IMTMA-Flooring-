import { create } from 'zustand';
import type { AuthState, User } from '../types/users';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    permissions: {
      floorPlans: { create: true, read: true, update: true, delete: true },
      booths: { create: true, read: true, update: true, delete: true },
      users: { create: true, read: true, update: true, delete: true },
      settings: { create: true, read: true, update: true, delete: true },
      reports: { create: true, read: true, update: true, delete: true }
    },
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'manager@example.com',
    name: 'Manager User',
    role: 'manager',
    permissions: {
      floorPlans: { create: true, read: true, update: true, delete: false },
      booths: { create: true, read: true, update: true, delete: true },
      users: { create: false, read: true, update: false, delete: false },
      settings: { create: false, read: true, update: true, delete: false },
      reports: { create: true, read: true, update: true, delete: true }
    },
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = MOCK_USERS.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      
      // Store in local storage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
    } catch (error) {
      set({
        isLoading: false,
        error: (error as Error).message
      });
    }
  },
  
  logout: () => {
    localStorage.removeItem('user');
    set({
      user: null,
      isAuthenticated: false
    });
  },
  
  setUser: (user) => {
    set({
      user,
      isAuthenticated: true
    });
  }
}));

// Initialize auth state from localStorage on load
export const initAuth = () => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson) as User;
      useAuthStore.getState().setUser(user);
    } catch (e) {
      console.error('Failed to parse stored user data', e);
      localStorage.removeItem('user');
    }
  }
};