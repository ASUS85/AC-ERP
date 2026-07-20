import { i as api } from "./router-CbAtk_cD.js";
const getEntreprise = () => api.get("/parametres/entreprise");
const updateEntreprise = (data) => api.put("/parametres/entreprise", data);
const getSysteme = () => api.get("/parametres/systeme");
const updateSysteme = (data) => api.put("/parametres/systeme", data);
const updateMaintenance = (active) => api.patch("/parametres/systeme/maintenance", { active });
const getJournal = (params) => api.get("/parametres/journal", { params });
export {
  getJournal as a,
  getSysteme as b,
  updateMaintenance as c,
  updateSysteme as d,
  getEntreprise as g,
  updateEntreprise as u
};
