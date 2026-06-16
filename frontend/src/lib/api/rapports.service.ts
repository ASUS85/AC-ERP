import api from "./client";

export const getRapportVentes = (params?: Record<string, unknown>) => api.get("/rapports/ventes", { params });
export const getRapportAchats = (params?: Record<string, unknown>) => api.get("/rapports/achats", { params });
export const getRapportStocks = (params?: Record<string, unknown>) => api.get("/rapports/stocks", { params });
export const getBalanceClients = (params?: Record<string, unknown>) => api.get("/rapports/balance-clients", { params });
export const getBalanceFournisseurs = (params?: Record<string, unknown>) => api.get("/rapports/balance-fournisseurs", { params });

