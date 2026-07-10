import api from "./client";

export type ProduitPayload = {
  reference?: string;
  designation: string;
  description?: string;
  uniteMesure: "PIECE" | "KG" | "LITRE" | "METRE" | "M2" | "BOITE" | "CARTON";
  prixAchatHt: number;
  prixVenteHt: number;
  tauxTva?: number;
  stockMinimum?: number;
  stockInitial?: number;
  idCategorie: string;
  statut?: "ACTIF" | "INACTIF" | "ARCHIVE";
};

export const getProduits = (params?: Record<string, unknown>) =>
  api.get("/produits", { params });
export const getProduitById = (id: string) => api.get(`/produits/${id}`);
export const createProduit = (data: ProduitPayload) => api.post("/produits", data);
export const updateProduit = (id: string, data: Partial<ProduitPayload>) =>
  api.put(`/produits/${id}`, data);
export const archiveProduit = (id: string) => api.delete(`/produits/${id}`);
