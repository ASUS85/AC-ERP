import api from "./client";

export const getDemandesAchat = () => api.get("/achats/demandes");
export const createDemandeAchat = (data: unknown) =>
  api.post("/achats/demandes", data);
export const validerDemandeAchat = (id: string) =>
  api.patch(`/achats/demandes/${id}/valider`);
export const getBonsCommandeFournisseur = () =>
  api.get("/achats/bons-commande");
export const getBonCommandeFournisseurById = (id: string) =>
  api.get(`/achats/bons-commande/${id}`);
export const createBonCommandeFournisseur = (data: unknown) =>
  api.post("/achats/bons-commande", data);
export const envoyerBonCommandeFournisseur = (id: string) =>
  api.patch(`/achats/bons-commande/${id}/envoyer`);
export const transitionBonCommandeFournisseur = (
  id: string,
  action: "SUBMIT" | "VALIDATE" | "BACK_TO_DRAFT" | "CANCEL",
) => api.patch(`/achats/bons-commande/${id}/statut`, { action });
export const dupliquerBonCommandeFournisseur = (id: string) =>
  api.post(`/achats/bons-commande/${id}/dupliquer`);
export const telechargerBonCommandeFournisseurPdf = (
  id: string,
): Promise<Blob> =>
  api.get(`/achats/bons-commande/${id}/pdf`, {
    responseType: "blob",
  }) as unknown as Promise<Blob>;
export const creerFactureAchatDepuisBcf = (
  id: string,
  data?: { dateEcheance?: string; mentionsLegales?: string },
) => api.post(`/achats/bons-commande/${id}/facture`, data || {});
export const importerFactureFournisseurBcf = (
  id: string,
  payload: { file: File; decision: "VALIDER" | "REJETER" },
) => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("decision", payload.decision);
  return api.post(`/achats/bons-commande/${id}/factures-importees`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getFacturesImporteesBcf = (id: string) =>
  api.get(`/achats/bons-commande/${id}/factures-importees`);
export const receptionBonCommandeFournisseur = (id: string, data: unknown) =>
  api.post(`/achats/bons-commande/${id}/reception`, data);
