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
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );
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
    return Promise.reject(
      error.response?.data?.error || {
        code: "NETWORK_ERROR",
        message: error.message,
        details: null
      }
    );
  }
);
export {
  api as a
};
