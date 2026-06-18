import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 3e4
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("erp_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
let refreshing = false;
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    const code = error.response?.data?.error?.code;
    if (error.response?.status === 401 && code === "TOKEN_EXPIRED" && original && !original._retry && !refreshing) {
      original._retry = true;
      refreshing = true;
      try {
        const refreshToken = localStorage.getItem("erp_refresh_token");
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
        const accessToken = response.data?.data?.accessToken;
        localStorage.setItem("erp_access_token", accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshError) {
        localStorage.removeItem("erp_access_token");
        localStorage.removeItem("erp_refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error.response?.data?.error || { code: "NETWORK_ERROR", message: error.message, details: null });
  }
);
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
async function logout(refreshToken2 = localStorage.getItem("erp_refresh_token")) {
  try {
    return await api.post("/auth/logout", { refreshToken: refreshToken2 });
  } finally {
    localStorage.removeItem("erp_access_token");
    localStorage.removeItem("erp_refresh_token");
    localStorage.removeItem("erp_user");
  }
}
export {
  api as a,
  logout as b,
  login as l,
  resendMfa as r,
  verifyMfa as v
};
