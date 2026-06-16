import api from "./client";

export const getFournisseurs = (params?: Record<string, unknown>) => api.get("/fournisseurs", { params });
export const getFournisseurById = (id: string) => api.get(`/fournisseurs/${id}`);
export const createFournisseur = (data: unknown) => api.post("/fournisseurs", data);
export const updateFournisseur = (id: string, data: unknown) => api.put(`/fournisseurs/${id}`, data);

