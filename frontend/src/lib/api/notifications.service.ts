import api from "./client";

export const getNotifications = (params?: Record<string, unknown>) =>
  api.get("/notifications", { params });
export const marquerLue = (id: string) =>
  api.patch(`/notifications/${id}/lire`);
export const marquerToutesLues = () => api.patch("/notifications/tout-lire");
