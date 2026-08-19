import { create } from "zustand";
import { getClients } from "@/lib/api/clients.service";

const CLIENTS_CACHE_TTL_MS = 5 * 60 * 1000;

type ApiListResponse = {
  data?: unknown[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

type CachedValue = {
  response: ApiListResponse;
  fetchedAt: number;
};

type ClientsStore = {
  lists: Record<string, CachedValue>;
  fetchList: (
    params?: Record<string, unknown>,
    force?: boolean,
  ) => Promise<ApiListResponse>;
  invalidate: () => void;
};

const pendingLists = new Map<string, Promise<ApiListResponse>>();

function cacheKey(params: Record<string, unknown> = {}) {
  return Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("&");
}

export const useClientsStore = create<ClientsStore>((set, get) => ({
  lists: {},

  async fetchList(params = {}, force = false) {
    const key = cacheKey(params);
    const cached = get().lists[key];
    if (
      !force &&
      cached &&
      Date.now() - cached.fetchedAt < CLIENTS_CACHE_TTL_MS
    ) {
      return cached.response;
    }
    if (pendingLists.has(key)) return pendingLists.get(key)!;

    const request = getClients(params)
      .then((response) => response as ApiListResponse)
      .then((response) => {
        set((state) => ({
          lists: {
            ...state.lists,
            [key]: { response, fetchedAt: Date.now() },
          },
        }));
        return response;
      })
      .finally(() => {
        pendingLists.delete(key);
      });

    pendingLists.set(key, request);
    return request;
  },

  invalidate() {
    set({ lists: {} });
  },
}));
