import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { AUTH_STORAGE_KEYS, clearAuthSession } from "../auth-session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;

api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<any>) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const code = error.response?.data?.error?.code;
    if (
      error.response?.status === 401 &&
      code === "TOKEN_EXPIRED" &&
      original &&
      !original._retry &&
      !refreshing
    ) {
      original._retry = true;
      refreshing = true;
      try {
        const refreshToken = localStorage.getItem(
          AUTH_STORAGE_KEYS.refreshToken,
        );
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken },
        );
        const accessToken = response.data?.data?.accessToken;
        if (!accessToken) {
          throw new Error("Access token missing from refresh response");
        }
        localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshError) {
        clearAuthSession();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(
      error.response?.data?.error || {
        code: "NETWORK_ERROR",
        message: error.message,
        details: null,
      },
    );
  },
);

export default api;
