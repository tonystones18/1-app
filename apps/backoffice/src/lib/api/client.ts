import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15_000,
  });

  // Attach token from localStorage on every request
  client.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('vs_access_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // On 401 → clear auth state
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('vs_access_token');
        localStorage.removeItem('vs_user');
        window.location.href = '/login';
      }
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    },
  );

  return client;
}

export const apiClient = createApiClient();

// Typed response unwrapper
export async function apiGet<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<{ data: T }>(path, config);
  return res.data.data;
}

export async function apiPost<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.post<{ data: T }>(path, body, config);
  return res.data.data;
}

export async function apiPut<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.put<{ data: T }>(path, body, config);
  return res.data.data;
}

export async function apiDelete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<{ data: T }>(path, config);
  return res.data.data;
}
