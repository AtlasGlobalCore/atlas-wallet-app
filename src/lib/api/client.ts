import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types/atlas';

const API_BASE_URL = process.env.NEXT_PUBLIC_ATLAS_API_URL || '/api';

// ============================================================
// ATLAS CORE - API Client (Axios com JWT Interceptors)
// O Frontend NÃO comunica com o Supabase diretamente.
// Todas as chamadas passam pela API REST do Atlas Core Banking.
// ============================================================

const atlasClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// --- Request Interceptor: Injeta JWT automaticamente ---
atlasClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = getStoredToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor: Trata erros de auth globalmente ---
atlasClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - fazer logout e redirecionar
      if (typeof window !== 'undefined') {
        clearStoredToken();
        clearStoredUser();
        // Usar evento custom em vez de importar o store para evitar circular deps
        window.dispatchEvent(new CustomEvent('atlas:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// --- Helpers de Armazenamento Seguro ---

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('atlas_token');
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('atlas_token', token);
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('atlas_token');
}

export function getStoredUser<T>(): T | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem('atlas_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser<T>(user: T): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('atlas_user', JSON.stringify(user));
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('atlas_user');
}

// --- API Modules ---

export const atlasApi = {
  // AUTH
  auth: {
    login: async (data: { email?: string; atlasId?: string; password: string }) => {
      const res = await atlasClient.post('/auth/login', data);
      return res.data;
    },
    me: async () => {
      const res = await atlasClient.get('/auth/me');
      return res.data;
    },
    refresh: async () => {
      const res = await atlasClient.post('/auth/refresh');
      return res.data;
    },
  },

  // WALLETS
  wallets: {
    list: async (userId?: string) => {
      const params = userId ? { userId } : {};
      const res = await atlasClient.get('/wallets', { params });
      return res.data;
    },
    getById: async (id: string) => {
      const res = await atlasClient.get(`/wallets/${id}`);
      return res.data;
    },
    getBalance: async (id: string) => {
      const res = await atlasClient.get(`/wallets/${id}/balance`);
      return res.data;
    },
  },

  // TRANSACTIONS
  transactions: {
    list: async (params?: { walletId?: string; type?: string; status?: string; page?: number; pageSize?: number }) => {
      const res = await atlasClient.get('/transactions', { params });
      return res.data;
    },
    getById: async (id: string) => {
      const res = await atlasClient.get(`/transactions/${id}`);
      return res.data;
    },
  },

  // DEPOSITS (IN)
  deposits: {
    getRoutes: async (currency: string) => {
      const res = await atlasClient.get(`/gateway/routes`, { params: { currency } });
      return res.data;
    },
    create: async (data: { walletId: string; currency: string; amount: number }) => {
      const res = await atlasClient.post('/deposits', data);
      return res.data;
    },
    getStatus: async (transactionId: string) => {
      const res = await atlasClient.get(`/deposits/${transactionId}/status`);
      return res.data;
    },
  },

  // SWAPS
  swaps: {
    getQuote: async (data: { fromCurrency: string; toCurrency: string; amount: number }) => {
      const res = await atlasClient.get('/swaps/quote', { params: data });
      return res.data;
    },
    execute: async (data: { fromWalletId: string; toWalletId: string; amount: number }) => {
      const res = await atlasClient.post('/swaps', data);
      return res.data;
    },
  },

  // WITHDRAWALS (OUT)
  withdrawals: {
    getRoutes: async (currency: string) => {
      const res = await atlasClient.get('/withdrawals/routes', { params: { currency } });
      return res.data;
    },
    create: async (data: { walletId: string; amount: number; destinationAddress?: string; destinationBankDetails?: Record<string, string> }) => {
      const res = await atlasClient.post('/withdrawals', data);
      return res.data;
    },
  },

  // KYC
  kyc: {
    getProfile: async () => {
      const res = await atlasClient.get('/kyc/profile');
      return res.data;
    },
    upgrade: async (data: { tier: string; data: Record<string, unknown> }) => {
      const res = await atlasClient.post('/kyc/upgrade', data);
      return res.data;
    },
    getStatus: async () => {
      const res = await atlasClient.get('/kyc/status');
      return res.data;
    },
  },

  // FEES
  fees: {
    getSchedule: async (tier?: string) => {
      const params = tier ? { tier } : {};
      const res = await atlasClient.get('/fees/schedule', { params });
      return res.data;
    },
  },

  // TICKETS (Admin/Operator)
  tickets: {
    list: async (params?: { status?: string; type?: string; page?: number }) => {
      const res = await atlasClient.get('/tickets', { params });
      return res.data;
    },
    getById: async (id: string) => {
      const res = await atlasClient.get(`/tickets/${id}`);
      return res.data;
    },
    update: async (id: string, data: { status: string; resolutionNotes?: string }) => {
      const res = await atlasClient.patch(`/tickets/${id}`, data);
      return res.data;
    },
  },

  // ORGANIZATIONS (Admin)
  organizations: {
    list: async () => {
      const res = await atlasClient.get('/organizations');
      return res.data;
    },
    getById: async (id: string) => {
      const res = await atlasClient.get(`/organizations/${id}`);
      return res.data;
    },
  },

  // USERS (Admin)
  users: {
    list: async (params?: { organizationId?: string; tier?: string; page?: number }) => {
      const res = await atlasClient.get('/users', { params });
      return res.data;
    },
    getById: async (id: string) => {
      const res = await atlasClient.get(`/users/${id}`);
      return res.data;
    },
  },

  // MERCHANT
  merchant: {
    getPaymentLinks: async () => {
      const res = await atlasClient.get('/merchant/links');
      return res.data;
    },
    createPaymentLink: async (data: { amount: number; currency: string; description?: string }) => {
      const res = await atlasClient.post('/merchant/links', data);
      return res.data;
    },
    getApiKeys: async () => {
      const res = await atlasClient.get('/merchant/api-keys');
      return res.data;
    },
    getCheckouts: async () => {
      const res = await atlasClient.get('/merchant/checkouts');
      return res.data;
    },
  },
};

export default atlasClient;
