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
let redirectingToLogin = false;

const PUBLIC_AUTH_PATHS = new Set([
  "/auth/login",
  "/auth/verify-mfa",
  "/auth/resend-mfa",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
]);

function getRequestPath(url?: string) {
  if (!url) return "";
  try {
    return new URL(url, api.defaults.baseURL).pathname.replace(
      /^\/api\/v\d+/,
      "",
    );
  } catch {
    return url;
  }
}

function redirectToLogin() {
  if (redirectingToLogin || typeof window === "undefined") return;
  redirectingToLogin = true;
  const destination = `${window.location.pathname}${window.location.search}`;
  clearAuthSession();
  window.location.replace(`/login?redirect=${encodeURIComponent(destination)}`);
}

api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<any>) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const code = error.response?.data?.error?.code;
    const requestPath = getRequestPath(original?.url);
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
    if (
      error.response?.status === 401 &&
      !PUBLIC_AUTH_PATHS.has(requestPath)
    ) {
      redirectToLogin();
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
