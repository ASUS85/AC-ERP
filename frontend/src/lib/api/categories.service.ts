import api from "./client";

export type CategoryPayload = {
  nom: string;
  description?: string;
  idCategorieParent?: string | null;
  icone?: string;
  statut?: "ACTIF" | "INACTIF";
};

export const getCategories = (params?: Record<string, unknown>) =>
  api.get("/categories", { params });
export const getCategorieById = (id: string) => api.get(`/categories/${id}`);
export const createCategorie = (data: CategoryPayload) =>
  api.post("/categories", data);
export const updateCategorie = (id: string, data: Partial<CategoryPayload>) =>
  api.put(`/categories/${id}`, data);
export const deleteCategorie = (id: string) => api.delete(`/categories/${id}`);
export const getArbreCategories = () => api.get("/categories/arbre");
