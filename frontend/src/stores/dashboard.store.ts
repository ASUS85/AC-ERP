import { create } from "zustand";
import {
  getDashboardOverview,
  type DashboardOverview,
} from "@/lib/api/dashboard.service";

const DASHBOARD_CACHE_TTL_MS = 10 * 60 * 1000;

export const EMPTY_DASHBOARD_OVERVIEW: DashboardOverview = {
  kpis: [],
  salesTrend: [],
  topProducts: [],
  stockSplit: [],
  recentSales: [],
  alerts: [],
};

let pendingOverviewRequest: Promise<DashboardOverview> | null = null;

type DashboardStore = {
  data: DashboardOverview | null;
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
  fetchOverview: (force?: boolean) => Promise<DashboardOverview>;
  invalidate: () => void;
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  fetchedAt: null,

  async fetchOverview(force = false) {
    const { data, fetchedAt } = get();
    const cacheIsValid =
      !force &&
      data !== null &&
      fetchedAt !== null &&
      Date.now() - fetchedAt < DASHBOARD_CACHE_TTL_MS;

    if (cacheIsValid) return data;
    if (pendingOverviewRequest) return pendingOverviewRequest;

    set({ loading: true, error: null });
    pendingOverviewRequest = getDashboardOverview()
      .then((response) => {
        const overview = response?.data as DashboardOverview;
        set({
          data: overview,
          fetchedAt: Date.now(),
          loading: false,
          error: null,
        });
        return overview;
      })
      .catch((error: unknown) => {
        const message =
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Impossible de charger le tableau de bord";
        set({ loading: false, error: message });
        throw error;
      })
      .finally(() => {
        pendingOverviewRequest = null;
      });

    return pendingOverviewRequest;
  },

  invalidate() {
    set({ fetchedAt: null });
  },
}));
