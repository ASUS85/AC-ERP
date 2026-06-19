import api from "./client";

export async function login(email: string, password: string) {
  const response: any = await api.post("/auth/login", { email, password });
  if (response.data?.mfaRequired) return response.data;
  storeSession(response.data);
  return response.data;
}

function storeSession(data: any) {
  const { accessToken, refreshToken, user } = data;
  if (!accessToken || !refreshToken || !user) return;
  localStorage.setItem("erp_access_token", accessToken);
  localStorage.setItem("erp_refresh_token", refreshToken);
  localStorage.setItem("erp_user", JSON.stringify(user));
}

export async function verifyMfa(mfaToken: string, code: string) {
  const response: any = await api.post("/auth/verify-mfa", { mfaToken, code });
  storeSession(response.data);
  return response.data;
}

export async function resendMfa(mfaToken: string) {
  const response: any = await api.post("/auth/resend-mfa", { mfaToken });
  return response.data;
}

export async function forgotPassword(email: string) {
  const response: any = await api.post("/auth/forgot-password", { email });
  return response.data;
}

export async function resetPassword(token: string, nouveauPassword: string) {
  const response: any = await api.post("/auth/reset-password", { token, nouveauPassword });
  return response.data;
}

export async function logout(refreshToken = localStorage.getItem("erp_refresh_token")) {
  try {
    return await api.post("/auth/logout", { refreshToken });
  } finally {
    localStorage.removeItem("erp_access_token");
    localStorage.removeItem("erp_refresh_token");
    localStorage.removeItem("erp_user");
  }
}

export const refreshToken = (token: string) => api.post("/auth/refresh", { refreshToken: token });
export const getMe = () => api.get("/auth/me");
export const changePassword = (ancienPassword: string, nouveauPassword: string) =>
  api.put("/auth/change-password", { ancienPassword, nouveauPassword });
