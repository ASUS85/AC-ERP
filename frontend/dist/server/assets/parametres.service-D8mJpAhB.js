import { a as api } from "./client-B-gDdwdO.js";
const apiUrl = "http://localhost:3000/api/v1";
const apiOrigin = apiUrl.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");
function resolveAvatarUrl(avatar) {
  if (!avatar) return "";
  if (/^(blob:|data:|https?:\/\/)/.test(avatar)) return avatar;
  return `${apiOrigin}${avatar.startsWith("/") ? avatar : `/${avatar}`}`;
}
const getEntreprise = () => api.get("/parametres/entreprise");
const updateEntreprise = (data) => api.put("/parametres/entreprise", data);
const getSysteme = () => api.get("/parametres/systeme");
const updateSysteme = (data) => api.put("/parametres/systeme", data);
const updateMaintenance = (active) => api.patch("/parametres/systeme/maintenance", { active });
const getJournal = (params) => api.get("/parametres/journal", { params });
export {
  getSysteme as a,
  getJournal as b,
  updateMaintenance as c,
  updateSysteme as d,
  getEntreprise as g,
  resolveAvatarUrl as r,
  updateEntreprise as u
};
