import { create } from "zustand";
import { i as api } from "./router-Ccz3J_v4.js";
const getDashboardOverview = () => api.get("/dashboard/overview");
const getDashboardPdf = () => api.get("/dashboard/export.pdf", { responseType: "blob" });
const DASHBOARD_CACHE_TTL_MS = 10 * 60 * 1e3;
const EMPTY_DASHBOARD_OVERVIEW = {
  kpis: [],
  salesTrend: [],
  topProducts: [],
  stockSplit: [],
  recentSales: [],
  alerts: []
};
let pendingOverviewRequest = null;
const useDashboardStore = create((set, get) => ({
  data: null,
  loading: false,
  error: null,
  fetchedAt: null,
  async fetchOverview(force = false) {
    const { data, fetchedAt } = get();
    const cacheIsValid = !force && data !== null && fetchedAt !== null && Date.now() - fetchedAt < DASHBOARD_CACHE_TTL_MS;
    if (cacheIsValid) return data;
    if (pendingOverviewRequest) return pendingOverviewRequest;
    set({ loading: true, error: null });
    pendingOverviewRequest = getDashboardOverview().then((response) => {
      const overview = response?.data;
      set({
        data: overview,
        fetchedAt: Date.now(),
        loading: false,
        error: null
      });
      return overview;
    }).catch((error) => {
      const message = error && typeof error === "object" && "message" in error ? String(error.message) : "Impossible de charger le tableau de bord";
      set({ loading: false, error: message });
      throw error;
    }).finally(() => {
      pendingOverviewRequest = null;
    });
    return pendingOverviewRequest;
  },
  invalidate() {
    set({ fetchedAt: null });
  }
}));
export {
  EMPTY_DASHBOARD_OVERVIEW as E,
  getDashboardPdf as g,
  useDashboardStore as u
};
