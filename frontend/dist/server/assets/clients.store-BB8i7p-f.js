import { create } from "zustand";
import { i as api } from "./router-DTrY5jCH.js";
const getClients = (params) => api.get("/clients", { params });
const createClient = (data) => api.post("/clients", data);
const updateClient = (id, data) => api.put(`/clients/${id}`, data);
const deleteClient = (id) => api.delete(`/clients/${id}`);
const getClientsPdf = (params) => api.get("/clients/export.pdf", { params, responseType: "blob" });
const CLIENTS_CACHE_TTL_MS = 5 * 60 * 1e3;
const pendingLists = /* @__PURE__ */ new Map();
function cacheKey(params = {}) {
  return Object.entries(params).filter(
    ([, value]) => value !== void 0 && value !== null && value !== ""
  ).sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `${key}=${String(value)}`).join("&");
}
const useClientsStore = create((set, get) => ({
  lists: {},
  async fetchList(params = {}, force = false) {
    const key = cacheKey(params);
    const cached = get().lists[key];
    if (!force && cached && Date.now() - cached.fetchedAt < CLIENTS_CACHE_TTL_MS) {
      return cached.response;
    }
    if (pendingLists.has(key)) return pendingLists.get(key);
    const request = getClients(params).then((response) => response).then((response) => {
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
  updateClient as a,
  createClient as c,
  deleteClient as d,
  getClientsPdf as g,
  useClientsStore as u
};
