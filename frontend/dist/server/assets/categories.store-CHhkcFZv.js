import { create } from "zustand";
import { i as api } from "./router-DPN3mKuc.js";
const getCategories = (params) => api.get("/categories", { params });
const createCategorie = (data) => api.post("/categories", data);
const updateCategorie = (id, data) => api.put(`/categories/${id}`, data);
const deleteCategorie = (id) => api.delete(`/categories/${id}`);
const getArbreCategories = () => api.get("/categories/arbre");
const CATEGORIES_CACHE_TTL_MS = 10 * 60 * 1e3;
const pendingLists = /* @__PURE__ */ new Map();
let pendingTree = null;
function cacheKey(params = {}) {
  return Object.entries(params).filter(
    ([, value]) => value !== void 0 && value !== null && value !== ""
  ).sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `${key}=${String(value)}`).join("&");
}
function isFresh(value) {
  return value !== null && value !== void 0 && Date.now() - value.fetchedAt < CATEGORIES_CACHE_TTL_MS;
}
const useCategoriesStore = create((set, get) => ({
  lists: {},
  tree: null,
  async fetchList(params = {}, force = false) {
    const key = cacheKey(params);
    const cached = get().lists[key];
    if (!force && isFresh(cached)) return cached.response;
    if (pendingLists.has(key)) return pendingLists.get(key);
    const request = getCategories(params).then((response) => response).then((response) => {
      set((state) => ({
        lists: {
          ...state.lists,
          [key]: { response, fetchedAt: Date.now() }
        }
      }));
      return response;
    }).finally(() => {
      pendingLists.delete(key);
    });
    pendingLists.set(key, request);
    return request;
  },
  async fetchTree(force = false) {
    const cached = get().tree;
    if (!force && isFresh(cached)) return cached.response;
    if (pendingTree) return pendingTree;
    pendingTree = getArbreCategories().then((response) => response).then((response) => {
      set({ tree: { response, fetchedAt: Date.now() } });
      return response;
    }).finally(() => {
      pendingTree = null;
    });
    return pendingTree;
  },
  invalidate() {
    set({ lists: {}, tree: null });
  }
}));
export {
  updateCategorie as a,
  createCategorie as c,
  deleteCategorie as d,
  useCategoriesStore as u
};
