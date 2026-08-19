import { create } from "zustand";
import { getEntreprise, getSysteme } from "@/lib/api/parametres.service";

const SETTINGS_CACHE_TTL_MS = 20 * 60 * 1000;

let pendingEntrepriseRequest: Promise<Record<string, unknown>> | null = null;
let pendingSystemeRequest: Promise<Record<string, unknown>> | null = null;

type SettingsStore = {
  entreprise: Record<string, unknown> | null;
  systeme: Record<string, unknown> | null;
  entrepriseFetchedAt: number | null;
  systemeFetchedAt: number | null;
  fetchEntreprise: (force?: boolean) => Promise<Record<string, unknown>>;
  fetchSysteme: (force?: boolean) => Promise<Record<string, unknown>>;
  setEntreprise: (entreprise: Record<string, unknown>) => void;
  setSysteme: (systeme: Record<string, unknown>) => void;
  invalidateEntreprise: () => void;
  invalidateSysteme: () => void;
};

const isFresh = (fetchedAt: number | null) =>
  fetchedAt !== null && Date.now() - fetchedAt < SETTINGS_CACHE_TTL_MS;

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  entreprise: null,
  systeme: null,
  entrepriseFetchedAt: null,
  systemeFetchedAt: null,

  async fetchEntreprise(force = false) {
    const { entreprise, entrepriseFetchedAt } = get();
    if (!force && entreprise && isFresh(entrepriseFetchedAt)) return entreprise;
    if (pendingEntrepriseRequest) return pendingEntrepriseRequest;

    pendingEntrepriseRequest = getEntreprise()
      .then((response) => {
        const entreprise = response.data as Record<string, unknown>;
        set({ entreprise, entrepriseFetchedAt: Date.now() });
        return entreprise;
      })
      .finally(() => {
        pendingEntrepriseRequest = null;
      });
    return pendingEntrepriseRequest;
  },

  async fetchSysteme(force = false) {
    const { systeme, systemeFetchedAt } = get();
    if (!force && systeme && isFresh(systemeFetchedAt)) return systeme;
    if (pendingSystemeRequest) return pendingSystemeRequest;

    pendingSystemeRequest = getSysteme()
      .then((response) => {
        const systeme = response.data as Record<string, unknown>;
        set({ systeme, systemeFetchedAt: Date.now() });
        return systeme;
      })
      .finally(() => {
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
  },
}));
