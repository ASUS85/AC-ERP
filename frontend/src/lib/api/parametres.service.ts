import api from "./client";

export const getEntreprise = () => api.get("/parametres/entreprise");
export const updateEntreprise = (data: Record<string, unknown>) =>
  api.put("/parametres/entreprise", data);
export const getSysteme = () => api.get("/parametres/systeme");
export const updateSysteme = (data: Record<string, unknown>) =>
  api.put("/parametres/systeme", data);
export const updateMaintenance = (active: boolean) =>
  api.patch("/parametres/systeme/maintenance", { active });
export const getJournal = (params?: Record<string, unknown>) =>
  api.get("/parametres/journal", { params });
