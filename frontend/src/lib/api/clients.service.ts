import api from "./client";

export const getClients = (params?: Record<string, unknown>) => api.get("/clients", { params });
export const getClientById = (id: string) => api.get(`/clients/${id}`);
export const createClient = (data: unknown) => api.post("/clients", data);
export const updateClient = (id: string, data: unknown) => api.put(`/clients/${id}`, data);
export const getHistoriqueClient = (id: string) => api.get(`/clients/${id}/historique`);

