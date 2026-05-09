import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types/atlas';

// ============================================================
// ATLAS CORE - API Client (Axios com JWT Interceptors)
// 
// REGRA DE OURO: A variável NEXT_PUBLIC_API_URL já inclui /api/v1
// Ex: https://api.atlasglobal.digital/api/v1
// As rotas são concatenadas diretamente a partir daqui.
// NUNCA usar 'localhost' hardcoded.
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

if (!API_BASE_URL) {
  console.warn(
    '[Atlas Core] NEXT_PUBLIC_API_URL não está definida. ' +
    'As chamadas à API irão falhar. Defina no .env ou na Vercel.'
  );
}

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
      if (typeof window !== 'undefined') {
        clearStoredToken();
        clearStoredUser();
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

// ============================================================
// API Modules
// Todas as rotas são relativas a NEXT_PUBLIC_API_URL (/api/v1)
// ============================================================

export const atlasApi = {
  // ── AUTH ──
  auth: {
    login: async (data: { email?: string; password: string }) => {
      const res = await atlasClient.post('/auth/login', data);
      return res.data;
    },
    me: async () => {
      const res = await atlasClient.get('/auth/me');
      return res.data;
    },
  },

  // ── PUBLIC (sem autenticação) ──
  public: {
    // Taxas de câmbio reais para o motor de swap
    getRates: async () => {
      const res = await atlasClient.get('/public/rates');
      return res.data;
    },
  },

  // ── WALLETS ──
  wallets: {
    list: async () => {
      const res = await atlasClient.get('/wallets');
      return res.data;
    },
    getById: async (id: string) => {
      const res = await atlasClient.get(`/wallets/${id}`);
      return res.data;
    },
  },

  // ── TRANSACTIONS ──
  transactions: {
    list: async (params?: { walletId?: string; type?: string; status?: string; page?: number; pageSize?: number }) => {
      const res = await atlasClient.get('/transactions', { params });
      return res.data;
    },
  },

  // ── DEPOSITS (IN) ──
  deposits: {
    create: async (data: { walletId: string; currency: string; amount: number }) => {
      const res = await atlasClient.post('/deposits', data);
      return res.data;
    },
  },

  // ── SWAPS ──
  swaps: {
    execute: async (data: { fromWalletId: string; toWalletId: string; amount: number }) => {
      const res = await atlasClient.post('/swaps', data);
      return res.data;
    },
  },

  // ── WITHDRAWALS (OUT) ──
  withdrawals: {
    create: async (data: { walletId: string; amount: number; destinationAddress?: string }) => {
      const res = await atlasClient.post('/withdrawals', data);
      return res.data;
    },
  },

  // ── KYC ──
  kyc: {
    getProfile: async () => {
      const res = await atlasClient.get('/kyc/profile');
      return res.data;
    },
    upgrade: async (data: { tier: string; data: Record<string, unknown> }) => {
      const res = await atlasClient.post('/kyc/upgrade', data);
      return res.data;
    },
  },

  // ── MERCHANT: API Keys (S2S) ──
  merchant: {
    getApiKeys: async () => {
      const res = await atlasClient.get('/merchant/api-keys');
      return res.data;
    },
    generateApiKey: async (data?: { storeName?: string }) => {
      const res = await atlasClient.post('/merchant/api-keys/generate', data);
      return res.data;
    },
    getPaymentLinks: async () => {
      const res = await atlasClient.get('/merchant/links');
      return res.data;
    },
    createPaymentLink: async (data: { amount: number; currency: string; description?: string }) => {
      const res = await atlasClient.post('/merchant/links', data);
      return res.data;
    },
  },

  // ── TICKETS (Admin/Operator) ──
  tickets: {
    list: async (params?: { status?: string; type?: string; page?: number }) => {
      const res = await atlasClient.get('/tickets', { params });
      return res.data;
    },
    update: async (id: string, data: { status: string; resolutionNotes?: string }) => {
      const res = await atlasClient.patch(`/tickets/${id}`, data);
      return res.data;
    },
  },

  // ── ORGANIZATIONS (Admin) ──
  organizations: {
    list: async () => {
      const res = await atlasClient.get('/organizations');
      return res.data;
    },
  },

  // ── USERS (Admin) ──
  users: {
    list: async (params?: { page?: number }) => {
      const res = await atlasClient.get('/users', { params });
      return res.data;
    },
  },

  // ── DASHBOARD (dados agregados) ──
  // O backend devolve { success: boolean, data: [...] }
  dashboard: {
    getWallets: async () => {
      const res = await atlasClient.get('/dashboard/wallets');
      // Desempacotar: res.data = { success, data }
      const payload = res.data;
      return payload?.success ? payload.data : payload;
    },
    getTransactions: async (params?: { limit?: number }) => {
      const res = await atlasClient.get('/dashboard/transactions', { params });
      const payload = res.data;
      return payload?.success ? payload.data : payload;
    },
  },
};

export default atlasClient;
