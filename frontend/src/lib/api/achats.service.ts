import api from "./client";

export const getDemandesAchat = () => api.get("/achats/demandes");
export const createDemandeAchat = (data: unknown) =>
  api.post("/achats/demandes", data);
export const validerDemandeAchat = (id: string) =>
  api.patch(`/achats/demandes/${id}/valider`);
export const getBonsCommandeFournisseur = () =>
  api.get("/achats/bons-commande");
export const createBonCommandeFournisseur = (data: unknown) =>
  api.post("/achats/bons-commande", data);
export const envoyerBonCommandeFournisseur = (id: string) =>
  api.patch(`/achats/bons-commande/${id}/envoyer`);
export const receptionBonCommandeFournisseur = (id: string, data: unknown) =>
  api.post(`/achats/bons-commande/${id}/reception`, data);
