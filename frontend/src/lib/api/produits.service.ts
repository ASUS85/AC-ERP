import api from "./client";

export const getProduits = (params?: Record<string, unknown>) => api.get("/produits", { params });
export const getProduitById = (id: string) => api.get(`/produits/${id}`);
export const createProduit = (data: unknown) => api.post("/produits", data);
export const updateProduit = (id: string, data: unknown) => api.put(`/produits/${id}`, data);
export const archiveProduit = (id: string) => api.delete(`/produits/${id}`);

