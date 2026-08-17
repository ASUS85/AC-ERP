import api from "./client";

export type VenteDirectePayload = {
  typeClient: "OCCASIONNEL" | "ENREGISTRE";
  idClient?: string | null;
  clientOccasionnelInfo?: {
    nom?: string;
    prenom?: string;
    sexe?: string;
    numeroCni?: string;
    telephone?: string;
  };
  lignes: Array<{
    idProduit: string;
    quantite: number;
    remise?: number;
    tauxTva?: number;
  }>;
  paiement?: {
    montant: number;
    modePaiement:
      | "ESPECES"
      | "CHEQUE"
      | "VIREMENT"
      | "MOBILE_MONEY"
      | "CARTE"
      | "COMPENSATION";
    reference?: string;
    notes?: string;
  };
};

export const getDevis = (params?: Record<string, unknown>) =>
  api.get("/ventes/devis", { params });
export const createDevis = (data: unknown) => api.post("/ventes/devis", data);
export const envoyerDevis = (id: string) =>
  api.patch(`/ventes/devis/${id}/envoyer`);
export const convertirDevis = (id: string) =>
  api.post(`/ventes/devis/${id}/convertir`);
export const getCommandes = (params?: Record<string, unknown>) =>
  api.get("/ventes/commandes", { params });
export const createCommande = (data: unknown) =>
  api.post("/ventes/commandes", data);
export const creerLivraison = (id: string, data: unknown) =>
  api.post(`/ventes/commandes/${id}/livraison`, data);
export const createVenteDirecte = (data: VenteDirectePayload) =>
  api.post("/ventes/directes", data);
