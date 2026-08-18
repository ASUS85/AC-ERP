import api from "./client";

export const getStocks = (params?: Record<string, unknown>) =>
  api.get("/stocks", { params });
export const getAlertes = () => api.get("/stocks/alertes");
export const getMouvements = (params?: Record<string, unknown>) =>
  api.get("/stocks/mouvements", { params });
export const ajusterStock = (data: unknown) =>
  api.post("/stocks/ajustement", data);
export const enregistrerComptageInventaire = (
  id: string,
  lignes: Array<{ id: string; stockReel: number }>,
) => api.patch(`/stocks/inventaires/${id}/comptage`, { lignes });
export const rafraichirInventaire = (id: string) =>
  api.post(`/stocks/inventaires/${id}/rafraichir`);
export const annulerInventaire = (id: string) =>
  api.post(`/stocks/inventaires/${id}/annuler`);
export const validerInventaire = (id: string) =>
  api.post(`/stocks/inventaires/${id}/valider`);
