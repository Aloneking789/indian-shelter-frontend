/**
 * India Shelter - API Client & Data Types
 * Handles authentication, template management, dashboard stats, and bulk imports.
 */

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Template {
  id: string;
  dltTemplateId: string;
  name: string;
  dueDate: string; // Frequency (e.g. Daily, Weekly, Monthly, Adhoc)
  content: string;
  ownerName: string;
  remarks?: string | null;
  attachmentLink1?: string | null;
  attachmentLink2?: string | null;
  isActive: boolean;
  createdById?: string | null;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string; employeeId: string; email?: string } | null;
  updatedBy?: { id: string; name: string; employeeId: string; email?: string } | null;
  importBatch?: { id: string; fileName: string; createdAt: string; status?: string } | null;
  // UI helpers
  favorite?: boolean;
}

export interface Pagination {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TemplateQueryParams {
  search?: string;
  dltTemplateId?: string;
  name?: string;
  dueDate?: string;
  ownerName?: string;
  content?: string;
  remarks?: string;
  isActive?: boolean | string;
  hasAttachment?: boolean | string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "dltTemplateId" | "name" | "dueDate" | "ownerName" | "isActive";
  sortOrder?: "asc" | "desc";
}

export interface DashboardOverview {
  totalTemplates: number;
  activeTemplates: number;
  inactiveTemplates: number;
  adhocTemplates: number;
  dailyTemplates: number;
  weeklyTemplates: number;
  monthlyTemplates: number;
  quarterlyTemplates: number;
  templatesWithAttachments: number;
  templatesWithoutAttachments: number;
  totalUniqueOwners: number;
}

export interface ImportPreviewRecord {
  rowNumber: number;
  data: {
    dltTemplateId?: string;
    name?: string;
    dueDate?: string;
    content?: string;
    ownerName?: string;
    remarks?: string;
    attachmentLink1?: string;
    attachmentLink2?: string;
  };
  isValid: boolean;
  isDuplicate: boolean;
  errors: string[];
}

export interface ImportPreviewData {
  fileName: string;
  fileType: string;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  detectedColumns: string[];
  previewRecords: ImportPreviewRecord[];
}

export interface ImportConfirmData {
  batchId: string;
  fileName: string;
  status: string;
  totalRecords: number;
  successfulCount: number;
  skippedCount: number;
  failedCount: number;
  errors?: Array<{ row: number; reason: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://indian-shelter-backend.vercel.app/api";

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("is_auth_token");
  },
  set: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("is_auth_token", token);
  },
  remove: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("is_auth_token");
    localStorage.removeItem("is_auth_user");
  },
};

export const userStorage = {
  get: (): User | null => {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem("is_auth_user");
    if (!item) return null;
    try {
      return JSON.parse(item) as User;
    } catch {
      return null;
    }
  },
  set: (user: User) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("is_auth_user", JSON.stringify(user));
  },
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = tokenStorage.get();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      tokenStorage.remove();
    }
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    login: async (employeeIdOrEmail: string, password: string): Promise<{ success: boolean; token?: string; user?: User; data?: { token: string; user: User } }> => {
      const res = await apiRequest<{ success: boolean; token?: string; user?: User; data?: { token: string; user: User } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ employeeId: employeeIdOrEmail, password }),
      });
      const token = res.token || res.data?.token;
      const user = res.user || res.data?.user;
      if (token) {
        tokenStorage.set(token);
      }
      if (user) {
        userStorage.set(user);
      }
      return res;
    },

    getMe: async (): Promise<{ success: boolean; data: User; user?: User }> => {
      const res = await apiRequest<{ success: boolean; data?: User; user?: User }>("/auth/me");
      const user = res.user || res.data;
      if (user) {
        userStorage.set(user);
      }
      return { success: res.success, data: user as User, user: user as User };
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
      return apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },

    logout: () => {
      tokenStorage.remove();
    },
  },

  // Templates
  templates: {
    getAll: async (params: TemplateQueryParams = {}): Promise<{ success: boolean; data: Template[]; pagination: Pagination }> => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, String(value));
        }
      });
      const qs = query.toString();
      return apiRequest<{ success: boolean; data: Template[]; pagination: Pagination }>(`/templates${qs ? `?${qs}` : ""}`);
    },

    getById: async (id: string): Promise<{ success: boolean; data: Template }> => {
      return apiRequest<{ success: boolean; data: Template }>(`/templates/${id}`);
    },

    create: async (payload: {
      dltTemplateId: string;
      name: string;
      dueDate: string;
      content: string;
      ownerName: string;
      remarks?: string | null;
      attachmentLink1?: string | null;
      attachmentLink2?: string | null;
      isActive?: boolean;
    }): Promise<{ success: boolean; message: string; data: Template }> => {
      return apiRequest<{ success: boolean; message: string; data: Template }>("/templates", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    update: async (id: string, payload: Partial<{
      dltTemplateId: string;
      name: string;
      dueDate: string;
      content: string;
      ownerName: string;
      remarks?: string | null;
      attachmentLink1?: string | null;
      attachmentLink2?: string | null;
      isActive?: boolean;
    }>): Promise<{ success: boolean; message: string; data: Template }> => {
      return apiRequest<{ success: boolean; message: string; data: Template }>(`/templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },

    delete: async (id: string): Promise<{ success: boolean; message: string; data: Template }> => {
      return apiRequest<{ success: boolean; message: string; data: Template }>(`/templates/${id}`, {
        method: "DELETE",
      });
    },

    getOwners: async (): Promise<{ success: boolean; data: string[] }> => {
      return apiRequest<{ success: boolean; data: string[] }>("/templates/owners");
    },

    getFrequencies: async (): Promise<{ success: boolean; data: string[] }> => {
      return apiRequest<{ success: boolean; data: string[] }>("/templates/frequencies");
    },
  },

  // Bulk Import
  import: {
    preview: async (file: File): Promise<{ success: boolean; data: ImportPreviewData }> => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest<{ success: boolean; data: ImportPreviewData }>("/import/preview", {
        method: "POST",
        body: formData,
      });
    },

    confirm: async (
      fileOrData: File | { fileName: string; fileType: string; records: any[] }
    ): Promise<{ success: boolean; message: string; data: ImportConfirmData }> => {
      if (fileOrData instanceof File) {
        const formData = new FormData();
        formData.append("file", fileOrData);
        return apiRequest<{ success: boolean; message: string; data: ImportConfirmData }>("/import/confirm", {
          method: "POST",
          body: formData,
        });
      } else {
        return apiRequest<{ success: boolean; message: string; data: ImportConfirmData }>("/import/confirm", {
          method: "POST",
          body: JSON.stringify(fileOrData),
        });
      }
    },

    getHistory: async (page = 1, limit = 10): Promise<{ success: boolean; data: any[]; pagination: Pagination }> => {
      return apiRequest(`/import/history?page=${page}&limit=${limit}`);
    },

    getById: async (id: string): Promise<{ success: boolean; data: any }> => {
      return apiRequest(`/import/${id}`);
    },
  },

  // Dashboard Overview
  dashboard: {
    getOverview: async (): Promise<{ success: boolean; data: DashboardOverview }> => {
      return apiRequest<{ success: boolean; data: DashboardOverview }>("/dashboard/overview");
    },
  },
};
