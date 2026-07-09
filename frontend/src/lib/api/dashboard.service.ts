import api from "./client";

export const getKPIs = () => api.get("/dashboard/kpis");
export const getEvolutionVentes = (annee?: number) =>
  api.get("/dashboard/evolution-ventes", { params: { annee } });
export const getTopProduits = (periode?: string) =>
  api.get("/dashboard/top-produits", { params: { periode } });
export const getTopClients = (periode?: string) =>
  api.get("/dashboard/top-clients", { params: { periode } });
