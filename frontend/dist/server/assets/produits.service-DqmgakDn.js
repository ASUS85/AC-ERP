import { i as api } from "./router-CU8xXL5-.js";
const getProduits = (params) => api.get("/produits", { params });
const createProduit = (data) => api.post("/produits", data);
const updateProduit = (id, data) => api.put(`/produits/${id}`, data);
const archiveProduit = (id) => api.delete(`/produits/${id}`);
const getProduitsPdf = (params) => api.get("/produits/export.pdf", { params, responseType: "blob" });
const uploadProduitPhoto = (file) => {
  const formData = new FormData();
  formData.append("photo", file);
  return api.post("/produits/upload-photo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
export {
  getProduitsPdf as a,
  updateProduit as b,
  createProduit as c,
  archiveProduit as d,
  getProduits as g,
  uploadProduitPhoto as u
};
