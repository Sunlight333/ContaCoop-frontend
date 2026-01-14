// API Service - Connects frontend to backend

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://socio-founds-backend-production.up.railway.app/api'
    : 'http://localhost:3001/api');

// Token management
let authToken: string | null = localStorage.getItem('auth-token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth-token', token);
  } else {
    localStorage.removeItem('auth-token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  // Handle file downloads
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('spreadsheetml') || contentType?.includes('octet-stream')) {
    return response.blob() as Promise<T>;
  }

  return response.json();
}

// API Response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================
// AUTH API
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'socio';
    cooperativeId: string | null;
    cooperativeName?: string;
  };
  expiresIn: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiFetch<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.data) {
      setAuthToken(response.data.token);
    }
    return response.data!;
  },

  register: async (data: {
    cooperativeName: string;
    cooperativeType: string;
    name: string;
    email: string;
    password: string;
  }): Promise<void> => {
    await apiFetch<ApiResponse<null>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logout: async (): Promise<void> => {
    try {
      await apiFetch<ApiResponse<null>>('/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  getCurrentUser: async () => {
    const response = await apiFetch<ApiResponse<LoginResponse['user']>>('/auth/me');
    return response.data;
  },

  me: async () => {
    const response = await apiFetch<ApiResponse<LoginResponse['user']>>('/auth/me');
    return response.data!;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiFetch<ApiResponse<null>>('/auth/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return response;
  },

  getActivity: async (limit = 10) => {
    const response = await apiFetch<ApiResponse<Array<{
      id: string;
      action: string;
      details?: string;
      createdAt: string;
    }>>>(`/auth/me/activity?limit=${limit}`);
    return response.data;
  },
};

// ============================================
// COOPERATIVES API
// ============================================

export interface Cooperative {
  id: string;
  name: string;
  ruc?: string;
}

export const cooperativeApi = {
  getAll: async (): Promise<Cooperative[]> => {
    const response = await apiFetch<ApiResponse<Cooperative[]>>('/cooperatives');
    return response.data || [];
  },

  getInfo: async (cooperativeId?: string) => {
    const params = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await apiFetch<ApiResponse<any>>(`/cooperatives/info${params}`);
    return response.data;
  },

  updateInfo: async (cooperativeId: string, data: { name: string; ruc?: string; address?: string }) => {
    const response = await apiFetch<ApiResponse<any>>(`/cooperatives/info?cooperativeId=${cooperativeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },
};

// ============================================
// FINANCIAL DATA API
// ============================================

export interface Period {
  year: number;
  month: number;
}

export interface DashboardKPI {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  format: 'currency' | 'percentage' | 'number';
}

export const financialApi = {
  getPeriods: async (cooperativeId?: string): Promise<Period[]> => {
    const params = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await apiFetch<ApiResponse<Period[]>>(`/periods${params}`);
    return response.data || [];
  },

  getDashboardKPIs: async (year: number, month: number, cooperativeId?: string): Promise<DashboardKPI[]> => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    const response = await apiFetch<ApiResponse<DashboardKPI[]>>(`/dashboard/kpis?${params}`);
    return response.data || [];
  },

  getBalanceSheet: async (year: number, month: number, cooperativeId?: string) => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    const response = await apiFetch<ApiResponse<{
      entries: any[];
      summary: { totalAssets: number; totalLiabilities: number; totalEquity: number; isBalanced: boolean };
    }>>(`/balance-sheet?${params}`);
    return response.data;
  },

  exportBalanceSheet: async (year: number, month: number, cooperativeId?: string): Promise<Blob> => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    return apiFetch<Blob>(`/balance-sheet/export?${params}`);
  },

  getCashFlow: async (year: number, month: number, cooperativeId?: string) => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    const response = await apiFetch<ApiResponse<{
      entries: any[];
      summary: { operating: number; investing: number; financing: number; netCashFlow: number };
    }>>(`/cash-flow?${params}`);
    return response.data;
  },

  getCashFlowHistory: async (months = 6, cooperativeId?: string) => {
    const params = new URLSearchParams({ months: String(months) });
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    const response = await apiFetch<ApiResponse<any[]>>(`/cash-flow/history?${params}`);
    return response.data;
  },

  exportCashFlow: async (year: number, month: number, cooperativeId?: string): Promise<Blob> => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    return apiFetch<Blob>(`/cash-flow/export?${params}`);
  },

  getMembershipFees: async (year: number, month: number, search?: string, status?: string, cooperativeId?: string) => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    const response = await apiFetch<ApiResponse<{
      fees: any[];
      summary: {
        totalExpected: number;
        totalPaid: number;
        totalDebt: number;
        membersWithDebt: number;
        totalMembers: number;
        collectionRate: number;
      };
    }>>(`/membership-fees?${params}`);
    return response.data;
  },

  getMyMembershipFees: async (cooperativeId?: string) => {
    const params = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await apiFetch<ApiResponse<any[]>>(`/membership-fees/me${params}`);
    return response.data;
  },

  exportMembershipFees: async (year: number, month: number, cooperativeId?: string): Promise<Blob> => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    return apiFetch<Blob>(`/membership-fees/export?${params}`);
  },

  getFinancialRatios: async (year: number, month: number, cooperativeId?: string) => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    const response = await apiFetch<ApiResponse<any[]>>(`/ratios?${params}`);
    return response.data;
  },

  getRatioHistory: async (months = 6, cooperativeId?: string) => {
    const params = new URLSearchParams({ months: String(months) });
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    const response = await apiFetch<ApiResponse<any[]>>(`/ratios/history?${params}`);
    return response.data;
  },

  exportRatios: async (year: number, month: number, cooperativeId?: string): Promise<Blob> => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    return apiFetch<Blob>(`/ratios/export?${params}`);
  },
};

// ============================================
// UPLOAD API
// ============================================

export interface UploadResult {
  status: 'success' | 'partial' | 'failed';
  message: string;
  recordsCount: number;
}

// Helper function for file upload (uses FormData instead of JSON)
async function uploadFile(
  endpoint: string,
  file: File,
  year: number,
  month: number,
  overwrite: boolean,
  cooperativeId?: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('year', String(year));
  formData.append('month', String(month));
  formData.append('overwrite', String(overwrite));
  if (cooperativeId) formData.append('cooperativeId', cooperativeId);

  const headers: HeadersInit = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  // Note: Don't set Content-Type for FormData - browser will set it with boundary

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

export const uploadApi = {
  uploadBalanceSheet: async (file: File, year: number, month: number, overwrite = false, cooperativeId?: string): Promise<UploadResult> => {
    return uploadFile('/upload/balance-sheet', file, year, month, overwrite, cooperativeId);
  },

  uploadCashFlow: async (file: File, year: number, month: number, overwrite = false, cooperativeId?: string): Promise<UploadResult> => {
    return uploadFile('/upload/cash-flow', file, year, month, overwrite, cooperativeId);
  },

  uploadMembershipFees: async (file: File, year: number, month: number, overwrite = false, cooperativeId?: string): Promise<UploadResult> => {
    return uploadFile('/upload/membership-fees', file, year, month, overwrite, cooperativeId);
  },

  uploadRatios: async (file: File, year: number, month: number, overwrite = false, cooperativeId?: string): Promise<UploadResult> => {
    return uploadFile('/upload/ratios', file, year, month, overwrite, cooperativeId);
  },

  getHistory: async (limit = 20, cooperativeId?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    const response = await apiFetch<ApiResponse<any[]>>(`/upload/history?${params}`);
    return response.data;
  },

  getLatest: async (cooperativeId?: string) => {
    const params = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await apiFetch<ApiResponse<any>>(`/upload/latest${params}`);
    return response.data;
  },
};

// ============================================
// USERS API
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'socio';
  status: 'active' | 'inactive';
  memberId?: string;
  lastLogin?: string;
  createdAt: string;
}

export const userApi = {
  getAll: async (search?: string, cooperativeId?: string): Promise<User[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    const response = await apiFetch<ApiResponse<User[]>>(`/users?${params}`);
    return response.data || [];
  },

  create: async (data: { email: string; name: string; role: 'admin' | 'socio'; password?: string }, cooperativeId?: string) => {
    const params = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await apiFetch<ApiResponse<{ user: User; temporaryPassword?: string }>>(`/users${params}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  changeRole: async (userId: string, role: 'admin' | 'socio') => {
    const response = await apiFetch<ApiResponse<User>>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return response.data;
  },

  changeStatus: async (userId: string, status: 'active' | 'inactive') => {
    const response = await apiFetch<ApiResponse<User>>(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.data;
  },

  resetPassword: async (userId: string) => {
    const response = await apiFetch<ApiResponse<{ temporaryPassword: string }>>(`/users/${userId}/reset-password`, {
      method: 'POST',
    });
    return response.data;
  },
};

// ============================================
// NOTIFICATIONS API
// ============================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  senderName: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  send: async (data: {
    title: string;
    message: string;
    recipientType: 'all' | 'with_debt' | 'specific';
    specificUserIds?: string[];
  }, cooperativeId?: string) => {
    const params = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await apiFetch<ApiResponse<{ id: string; recipientCount: number }>>(`/notifications/send${params}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  getHistory: async (limit = 20, cooperativeId?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cooperativeId) params.append('cooperativeId', cooperativeId);
    const response = await apiFetch<ApiResponse<any[]>>(`/notifications/history?${params}`);
    return response.data;
  },

  getMyNotifications: async (limit = 20, unreadOnly = false): Promise<Notification[]> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (unreadOnly) params.append('unreadOnly', 'true');
    const response = await apiFetch<ApiResponse<Notification[]>>(`/notifications/me?${params}`);
    return response.data || [];
  },

  markAsRead: async (notificationId: string) => {
    await apiFetch<ApiResponse<null>>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async () => {
    await apiFetch<ApiResponse<null>>('/notifications/me/read-all', {
      method: 'PUT',
    });
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiFetch<ApiResponse<{ count: number }>>('/notifications/me/unread-count');
    return response.data?.count || 0;
  },
};

// ============================================
// SETTINGS API
// ============================================

export const settingsApi = {
  get: async (cooperativeId?: string) => {
    const params = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await apiFetch<ApiResponse<any>>(`/settings${params}`);
    return response.data;
  },

  updateNotifications: async (data: {
    emailNotifications?: boolean;
    uploadNotifications?: boolean;
    paymentReminders?: boolean;
  }, cooperativeId?: string) => {
    const params = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await apiFetch<ApiResponse<any>>(`/settings/notifications${params}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  updateSecurity: async (data: {
    twoFactorAuth?: boolean;
    sessionTimeout?: boolean;
  }, cooperativeId?: string) => {
    const params = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await apiFetch<ApiResponse<any>>(`/settings/security${params}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  updateBackups: async (data: {
    autoBackup?: boolean;
  }, cooperativeId?: string) => {
    const params = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await apiFetch<ApiResponse<any>>(`/settings/backups${params}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  getOdooStatus: async (cooperativeId?: string) => {
    const params = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await apiFetch<ApiResponse<{ isConnected: boolean; lastSync: string | null }>>(`/settings/odoo/status${params}`);
    return response.data;
  },

  saveOdooConfig: async (data: {
    url: string;
    database: string;
    username: string;
    apiKey: string;
  }, cooperativeId?: string) => {
    const params = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await apiFetch<ApiResponse<null>>(`/settings/odoo/config${params}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  },

  testOdooConnection: async (data: {
    url: string;
    database: string;
    username: string;
    apiKey: string;
  }) => {
    const response = await apiFetch<ApiResponse<{ success: boolean; message: string }>>('/settings/odoo/test', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  exportAllData: async (cooperativeId?: string) => {
    const params = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await apiFetch<any>(`/settings/data/export${params}`);
    return response;
  },
};

// Download helper for exports
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
