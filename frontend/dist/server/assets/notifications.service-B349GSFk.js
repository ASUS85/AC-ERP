import { i as api } from "./router-DTrY5jCH.js";
const getNotifications = (params) => api.get("/notifications", { params });
const marquerLue = (id) => api.patch(`/notifications/${id}/lire`);
const marquerToutesLues = () => api.patch("/notifications/tout-lire");
export {
  marquerToutesLues as a,
  getNotifications as g,
  marquerLue as m
};
