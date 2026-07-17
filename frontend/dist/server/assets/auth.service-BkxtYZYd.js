import api from "./client-C7e4CO8z.js";
const unwrapAuth = (response) => response.data || {};
async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });
  const data = unwrapAuth(response);
  if (data.mfaRequired) return data;
  storeSession(data);
  return data;
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
  const data = unwrapAuth(response);
  storeSession(data);
  return data;
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
  const response = await api.post("/auth/reset-password", {
    token,
    nouveauPassword
  });
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
const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.post("/auth/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
const getSessions = () => api.get("/auth/sessions");
const revokeOtherSessions = () => api.delete("/auth/sessions/others", {
  data: { refreshToken: localStorage.getItem("erp_refresh_token") }
});
const changePassword = (ancienPassword, nouveauPassword) => api.put("/auth/change-password", { ancienPassword, nouveauPassword });
export {
  resendMfa as a,
  logout as b,
  getSessions as c,
  updateProfile as d,
  changePassword as e,
  forgotPassword as f,
  getMe as g,
  revokeOtherSessions as h,
  login as l,
  resetPassword as r,
  uploadAvatar as u,
  verifyMfa as v
};
