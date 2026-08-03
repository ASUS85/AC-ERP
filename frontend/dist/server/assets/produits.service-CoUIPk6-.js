import { i as api } from "./router-Dv1ROSYY.js";
const getProduits = (params) => api.get("/produits", { params });
const createProduit = (data) => api.post("/produits", data);
const updateProduit = (id, data) => api.put(`/produits/${id}`, data);
const archiveProduit = (id) => api.delete(`/produits/${id}`);
const getProduitsPdf = (params) => api.get("/produits/export.pdf", { params, responseType: "blob" });
export {
  getProduitsPdf as a,
  archiveProduit as b,
  createProduit as c,
  getProduits as g,
  updateProduit as u
};
