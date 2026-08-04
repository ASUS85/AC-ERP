import api from "./client";

export const getFactures = (params?: Record<string, unknown>) =>
  api.get("/factures", { params });
export const createFacture = (data: unknown) => api.post("/factures", data);
export const getFactureById = (id: string) => api.get(`/factures/${id}`);
export const getFacturePdf = (id: string) =>
  api.get(`/factures/${id}/pdf`, {
    responseType: "blob",
  }) as unknown as Promise<Blob>;
export const envoyerFacture = (id: string) =>
  api.post(`/factures/${id}/envoyer`);
export const creerAvoir = (id: string, data: unknown) =>
  api.post(`/factures/${id}/avoir`, data);
export const getFacturesImpayees = (params?: Record<string, unknown>) =>
  api.get("/factures/impayees", { params });
