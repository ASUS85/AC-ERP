import api from "./client";

export const getPaiements = (params?: Record<string, unknown>) =>
  api.get("/paiements", { params });
export const createPaiement = (data: unknown) => api.post("/paiements", data);
