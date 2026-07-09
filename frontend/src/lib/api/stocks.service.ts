import api from "./client";

export const getStocks = (params?: Record<string, unknown>) =>
  api.get("/stocks", { params });
export const getAlertes = () => api.get("/stocks/alertes");
export const getMouvements = (params?: Record<string, unknown>) =>
  api.get("/stocks/mouvements", { params });
export const ajusterStock = (data: unknown) =>
  api.post("/stocks/ajustement", data);
