import { a as api } from "./client-DBXY_OFa.js";
async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });
  if (response.data?.mfaRequired) return response.data;
  storeSession(response.data);
  return response.data;
}
function storeSession(data) {
  const { accessToken, refreshToken: refreshToken2, user } = data;
  if (!accessToken || !refreshToken2 || !user) return;
  localStorage.setItem("erp_access_token", accessToken);
  localStorage.setItem("erp_refresh_token", refreshToken2);
  localStorage.setItem("erp_user", JSON.stringify(user));
}
async function verifyMfa(mfaToken, code) {
  const response = await api.post("/auth/verify-mfa", { mfaToken, code });
  storeSession(response.data);
  return response.data;
}
async function resendMfa(mfaToken) {
  const response = await api.post("/auth/resend-mfa", { mfaToken });
  return response.data;
}
async function forgotPassword(email) {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
}
async function resetPassword(token, nouveauPassword) {
  const response = await api.post("/auth/reset-password", { token, nouveauPassword });
  return response.data;
}
async function logout(refreshToken2 = localStorage.getItem("erp_refresh_token")) {
  try {
    return await api.post("/auth/logout", { refreshToken: refreshToken2 });
  } finally {
    localStorage.removeItem("erp_access_token");
    localStorage.removeItem("erp_refresh_token");
    localStorage.removeItem("erp_user");
  }
}
const getMe = () => api.get("/auth/me");
const updateProfile = (data) => api.put("/auth/me", data);
const getSessions = () => api.get("/auth/sessions");
const revokeOtherSessions = () => api.delete("/auth/sessions/others");
const changePassword = (ancienPassword, nouveauPassword) => api.put("/auth/change-password", { ancienPassword, nouveauPassword });
export {
  resendMfa as a,
  logout as b,
  getSessions as c,
  changePassword as d,
  revokeOtherSessions as e,
  forgotPassword as f,
  getMe as g,
  login as l,
  resetPassword as r,
  updateProfile as u,
  verifyMfa as v
};
