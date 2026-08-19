import { create } from "zustand";
import {
  getArbreCategories,
  getCategories,
} from "@/lib/api/categories.service";

const CATEGORIES_CACHE_TTL_MS = 10 * 60 * 1000;

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

type CategoriesStore = {
  lists: Record<string, CachedValue>;
  tree: CachedValue | null;
  fetchList: (
    params?: Record<string, unknown>,
    force?: boolean,
  ) => Promise<ApiListResponse>;
  fetchTree: (force?: boolean) => Promise<ApiListResponse>;
  invalidate: () => void;
};

const pendingLists = new Map<string, Promise<ApiListResponse>>();
let pendingTree: Promise<ApiListResponse> | null = null;

function cacheKey(params: Record<string, unknown> = {}) {
  return Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("&");
}

function isFresh(value: CachedValue | null | undefined) {
  return (
    value !== null &&
    value !== undefined &&
    Date.now() - value.fetchedAt < CATEGORIES_CACHE_TTL_MS
  );
}

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  lists: {},
  tree: null,

  async fetchList(params = {}, force = false) {
    const key = cacheKey(params);
    const cached = get().lists[key];
    if (!force && isFresh(cached)) return cached.response;
    if (pendingLists.has(key)) return pendingLists.get(key)!;

    const request = getCategories(params)
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

  async fetchTree(force = false) {
    const cached = get().tree;
    if (!force && isFresh(cached)) return cached.response;
    if (pendingTree) return pendingTree;

    pendingTree = getArbreCategories()
      .then((response) => response as ApiListResponse)
      .then((response) => {
        set({ tree: { response, fetchedAt: Date.now() } });
        return response;
      })
      .finally(() => {
        pendingTree = null;
      });

    return pendingTree;
  },

  invalidate() {
    set({ lists: {}, tree: null });
  },
}));
