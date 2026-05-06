import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AuthUser,
  UserRole,
  TierLevel,
  RolePermissions,
} from '@/types/atlas';
import { OrgRole } from '@/types/atlas';
import {
  setStoredToken,
  setStoredUser,
  clearStoredToken,
  clearStoredUser,
} from '@/lib/api/client';

// ============================================================
// ATLAS CORE - Auth Store (Zustand)
// Gestão de autenticação e RBAC com persistência segura
// ============================================================

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (token: string, user: AuthUser) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  getUserRole: () => UserRole;
  getPermissions: () => RolePermissions;
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  customer: {
    canViewDashboard: true,
    canViewWallets: true,
    canDeposit: true,
    canSwap: true,
    canWithdraw: true,
    canViewTransactions: true,
    canGeneratePaymentLinks: false,
    canManageApiKeys: false,
    canConfigureCheckouts: false,
    canViewSubClients: false,
    canManageTickets: false,
    canApproveKyc: false,
    canConfigureFees: false,
    canManageOrganizations: false,
    canManageUsers: false,
  },
  merchant: {
    canViewDashboard: true,
    canViewWallets: true,
    canDeposit: true,
    canSwap: true,
    canWithdraw: true,
    canViewTransactions: true,
    canGeneratePaymentLinks: true,
    canManageApiKeys: true,
    canConfigureCheckouts: true,
    canViewSubClients: false,
    canManageTickets: false,
    canApproveKyc: false,
    canConfigureFees: false,
    canManageOrganizations: false,
    canManageUsers: false,
  },
  super_merchant: {
    canViewDashboard: true,
    canViewWallets: true,
    canDeposit: true,
    canSwap: true,
    canWithdraw: true,
    canViewTransactions: true,
    canGeneratePaymentLinks: true,
    canManageApiKeys: true,
    canConfigureCheckouts: true,
    canViewSubClients: true,
    canManageTickets: false,
    canApproveKyc: false,
    canConfigureFees: false,
    canManageOrganizations: false,
    canManageUsers: false,
  },
  admin: {
    canViewDashboard: true,
    canViewWallets: true,
    canDeposit: false,
    canSwap: false,
    canWithdraw: false,
    canViewTransactions: true,
    canGeneratePaymentLinks: false,
    canManageApiKeys: false,
    canConfigureCheckouts: false,
    canViewSubClients: true,
    canManageTickets: true,
    canApproveKyc: true,
    canConfigureFees: true,
    canManageOrganizations: true,
    canManageUsers: true,
  },
  operator: {
    canViewDashboard: true,
    canViewWallets: true,
    canDeposit: false,
    canSwap: false,
    canWithdraw: false,
    canViewTransactions: true,
    canGeneratePaymentLinks: false,
    canManageApiKeys: false,
    canConfigureCheckouts: false,
    canViewSubClients: false,
    canManageTickets: true,
    canApproveKyc: false,
    canConfigureFees: false,
    canManageOrganizations: false,
    canManageUsers: false,
  },
};

const TIER_LABELS: Record<TierLevel, string> = {
  TIER_0_UNVERIFIED: 'Não Verificado',
  TIER_1_BASIC: 'Básico',
  TIER_2_VERIFIED: 'Verificado',
  TIER_3_CORPORATE: 'Corporate',
};

const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Customer',
  merchant: 'Merchant',
  super_merchant: 'Super Merchant',
  admin: 'Admin',
  operator: 'Operator',
};

export { ROLE_PERMISSIONS, TIER_LABELS, ROLE_LABELS };

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (token: string, user: AuthUser) => {
        setStoredToken(token);
        setStoredUser(user);
        set({ token, user, isAuthenticated: true });
      },

      updateUser: (updates: Partial<AuthUser>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updated = { ...currentUser, ...updates };
          setStoredUser(updated);
          set({ user: updated });
        }
      },

      logout: () => {
        clearStoredToken();
        clearStoredUser();
        set({ token: null, user: null, isAuthenticated: false });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      hasPermission: (permission: keyof RolePermissions): boolean => {
        const user = get().user;
        if (!user) return false;
        const perms = ROLE_PERMISSIONS[user.role];
        return perms[permission] ?? false;
      },

      getUserRole: (): UserRole => {
        const user = get().user;
        return user?.role ?? 'customer';
      },

      getPermissions: (): RolePermissions => {
        const user = get().user;
        if (!user) return ROLE_PERMISSIONS.customer;
        return ROLE_PERMISSIONS[user.role];
      },
    }),
    {
      name: 'atlas-auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return sessionStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
