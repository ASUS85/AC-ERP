import { i as api } from "./router-qTiJlct9.js";
const getFournisseurs = (params) => api.get("/fournisseurs", { params });
const getFournisseurById = (id) => api.get(`/fournisseurs/${id}`);
const createFournisseur = (data) => api.post("/fournisseurs", data);
const updateFournisseur = (id, data) => api.put(`/fournisseurs/${id}`, data);
export {
  getFournisseurById as a,
  createFournisseur as c,
  getFournisseurs as g,
  updateFournisseur as u
};
