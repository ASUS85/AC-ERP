import { create } from "zustand";
import { i as api } from "./router-DmDzdhp9.js";
const getEntreprise = () => api.get("/parametres/entreprise");
const updateEntreprise = (data) => api.put("/parametres/entreprise", data);
const getSysteme = () => api.get("/parametres/systeme");
const updateSysteme = (data) => api.put("/parametres/systeme", data);
const updateMaintenance = (active) => api.patch("/parametres/systeme/maintenance", { active });
const getJournal = (params) => api.get("/parametres/journal", { params });
const SETTINGS_CACHE_TTL_MS = 20 * 60 * 1e3;
let pendingEntrepriseRequest = null;
let pendingSystemeRequest = null;
const isFresh = (fetchedAt) => fetchedAt !== null && Date.now() - fetchedAt < SETTINGS_CACHE_TTL_MS;
const useSettingsStore = create((set, get) => ({
  entreprise: null,
  systeme: null,
  entrepriseFetchedAt: null,
  systemeFetchedAt: null,
  async fetchEntreprise(force = false) {
    const { entreprise, entrepriseFetchedAt } = get();
    if (!force && entreprise && isFresh(entrepriseFetchedAt)) return entreprise;
    if (pendingEntrepriseRequest) return pendingEntrepriseRequest;
    pendingEntrepriseRequest = getEntreprise().then((response) => {
      const entreprise2 = response.data;
      set({ entreprise: entreprise2, entrepriseFetchedAt: Date.now() });
      return entreprise2;
    }).finally(() => {
      pendingEntrepriseRequest = null;
    });
    return pendingEntrepriseRequest;
  },
  async fetchSysteme(force = false) {
    const { systeme, systemeFetchedAt } = get();
    if (!force && systeme && isFresh(systemeFetchedAt)) return systeme;
    if (pendingSystemeRequest) return pendingSystemeRequest;
    pendingSystemeRequest = getSysteme().then((response) => {
      const systeme2 = response.data;
      set({ systeme: systeme2, systemeFetchedAt: Date.now() });
      return systeme2;
    }).finally(() => {
      pendingSystemeRequest = null;
    });
    return pendingSystemeRequest;
  },
  setEntreprise(entreprise) {
    set({ entreprise, entrepriseFetchedAt: Date.now() });
  },
  setSysteme(systeme) {
    set({ systeme, systemeFetchedAt: Date.now() });
  },
  invalidateEntreprise() {
    set({ entrepriseFetchedAt: null });
  },
  invalidateSysteme() {
    set({ systemeFetchedAt: null });
  }
}));
export {
  updateEntreprise as a,
  updateMaintenance as b,
  updateSysteme as c,
  getSysteme as d,
  getJournal as g,
  useSettingsStore as u
};
