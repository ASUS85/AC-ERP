import { i as api } from "./router-qTiJlct9.js";
const getCategories = (params) => api.get("/categories", { params });
const createCategorie = (data) => api.post("/categories", data);
const updateCategorie = (id, data) => api.put(`/categories/${id}`, data);
const deleteCategorie = (id) => api.delete(`/categories/${id}`);
const getArbreCategories = () => api.get("/categories/arbre");
export {
  getArbreCategories as a,
  createCategorie as c,
  deleteCategorie as d,
  getCategories as g,
  updateCategorie as u
};
