import { create } from "zustand";
import { i as api } from "./router-DPN3mKuc.js";
const getProduits = (params) => api.get("/produits", { params });
const createProduit = (data) => api.post("/produits", data);
const updateProduit = (id, data) => api.put(`/produits/${id}`, data);
const archiveProduit = (id) => api.delete(`/produits/${id}`);
const getProduitsPdf = (params) => api.get("/produits/export.pdf", { params, responseType: "blob" });
const uploadProduitPhoto = (file) => {
  const formData = new FormData();
  formData.append("photo", file);
  return api.post("/produits/upload-photo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
const PRODUCTS_CACHE_TTL_MS = 5 * 60 * 1e3;
const pendingLists = /* @__PURE__ */ new Map();
function cacheKey(params = {}) {
  return Object.entries(params).filter(
    ([, value]) => value !== void 0 && value !== null && value !== ""
  ).sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `${key}=${String(value)}`).join("&");
}
const useProductsStore = create((set, get) => ({
  lists: {},
  async fetchList(params = {}, force = false) {
    const key = cacheKey(params);
    const cached = get().lists[key];
    if (!force && cached && Date.now() - cached.fetchedAt < PRODUCTS_CACHE_TTL_MS) {
      return cached.response;
    }
    if (pendingLists.has(key)) return pendingLists.get(key);
    const request = getProduits(params).then((response) => response).then((response) => {
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
  invalidate() {
    set({ lists: {} });
  }
}));
export {
  uploadProduitPhoto as a,
  updateProduit as b,
  createProduit as c,
  archiveProduit as d,
  getProduitsPdf as g,
  useProductsStore as u
};
