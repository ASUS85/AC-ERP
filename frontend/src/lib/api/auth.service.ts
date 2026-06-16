import api from "./client";

export async function login(email: string, password: string) {
  const response: any = await api.post("/auth/login", { email, password });
  const { accessToken, refreshToken, user } = response.data;
  localStorage.setItem("erp_access_token", accessToken);
  localStorage.setItem("erp_refresh_token", refreshToken);
  localStorage.setItem("erp_user", JSON.stringify(user));
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

