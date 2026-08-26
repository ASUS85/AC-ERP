import api from "./client";
import { clearAuthSession, storeAuthSession } from "../auth-session";

type AuthSession = {
  accessToken?: string;
  refreshToken?: string;
  user?: unknown;
  mfaRequired?: boolean;
};

type ApiResponse<T> = { data?: T };

const unwrapAuth = (response: ApiResponse<AuthSession>) => response.data || {};

export async function login(email: string, password: string) {
  const response = await api.post("/auth/login", { email, password });
  const data = unwrapAuth(response as ApiResponse<AuthSession>);
  if (data.mfaRequired) return data;
  storeAuthSession(data);
  return data;
}

export async function verifyMfa(mfaToken: string, code: string) {
  const response = await api.post("/auth/verify-mfa", { mfaToken, code });
  const data = unwrapAuth(response as ApiResponse<AuthSession>);
  storeAuthSession(data);
  return data;
}

export async function resendMfa(mfaToken: string) {
  const response = await api.post("/auth/resend-mfa", { mfaToken });
  return (response as ApiResponse<unknown>).data;
}

export async function forgotPassword(email: string) {
  const response = await api.post("/auth/forgot-password", { email });
  return (response as ApiResponse<unknown>).data;
}

export async function resetPassword(token: string, nouveauPassword: string) {
  const response = await api.post("/auth/reset-password", {
    token,
    nouveauPassword,
  });
  return (response as ApiResponse<unknown>).data;
}

export async function logout(
  refreshToken = localStorage.getItem("erp_refresh_token"),
) {
  try {
    return await api.post("/auth/logout", { refreshToken });
  } finally {
    clearAuthSession();
  }
}

export const refreshToken = (token: string) =>
  api.post("/auth/refresh", { refreshToken: token });
export const getMe = () => api.get("/auth/me");
export const updateProfile = (data: Record<string, unknown>) =>
  api.put("/auth/me", data);
export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.post("/auth/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getSessions = () => api.get("/auth/sessions");
export const revokeOtherSessions = () => api.delete("/auth/sessions/others");
export const changePassword = (
  ancienPassword: string,
  nouveauPassword: string,
) => api.put("/auth/change-password", { ancienPassword, nouveauPassword });
