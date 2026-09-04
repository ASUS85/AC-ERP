import { create } from "zustand";
import { i as api } from "./router-DmDzdhp9.js";
const getDashboardOverview = () => api.get("/dashboard/overview");
const getTopClients = (periode) => api.get("/dashboard/top-clients", { params: { periode } });
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
function getLast12CompletedMonths(data, dateKey) {
  const now = /* @__PURE__ */ new Date();
  const currentMonth = now.getMonth();
  const monthNames = {
    jan: 0,
    janvier: 0,
    fev: 1,
    fév: 1,
    fevr: 1,
    février: 1,
    fevrier: 1,
    mar: 2,
    mars: 2,
    avr: 3,
    avril: 3,
    mai: 4,
    juin: 5,
    juil: 6,
    juillet: 6,
    aout: 7,
    août: 7,
    sep: 8,
    sept: 8,
    septembre: 8,
    oct: 9,
    octobre: 9,
    nov: 10,
    novembre: 10,
    dec: 11,
    déc: 11,
    décembre: 11,
    decembre: 11
  };
  const getMonthIndex = (value) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.getMonth();
    }
    const str = String(value ?? "").trim().toLowerCase();
    const numericDate = str.match(/^(\d{4})-(\d{2})(?:-\d{2})?/);
    if (numericDate) {
      return Number(numericDate[2]) - 1;
    }
    return monthNames[str] ?? null;
  };
  return data.filter((item) => {
    const month = getMonthIndex(item[dateKey]);
    if (month === null) return false;
    return month < currentMonth;
  }).slice(-12);
}
export {
  EMPTY_DASHBOARD_OVERVIEW as E,
  getDashboardPdf as a,
  getTopClients as b,
  getLast12CompletedMonths as g,
  useDashboardStore as u
};
