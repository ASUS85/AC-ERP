import api from "./client";

export type IaApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
  meta: unknown;
};

export type IaConversation = {
  id: string;
  titre: string | null;
  createdAt: string;
  _count: { messages: number };
};

export type IaMessage = {
  id: string;
  role: "user" | "assistant";
  contenu: string;
  createdAt: string;
};

export type IaChatResponse = {
  reponse: string;
  idConversation: string;
};

export type IaPrevision = {
  mois: string;
  montantPrevu: number;
  min: number;
  max: number;
};

export type IaProduitRisque = {
  idProduit: string;
  produit: string;
  stockActuel: number;
  stockMinimum: number;
  vitesseEcoulement: number;
  joursAvantRupture: number | null;
};

export type IaPrevisionsResponse = {
  previsionsMensuelles: IaPrevision[];
  produitsRisque: IaProduitRisque[];
  recommandations: string[];
  fiabilite: number;
  caPrevu: number;
};

export type IaRapport = {
  id: string;
  typeRapport: "ventes" | "achats" | "stocks" | "financier";
  periode: "semaine" | "mois" | "trimestre" | "annee";
  contenu: string;
  html?: string;
  fichierPdf: string | null;
  createdAt: string;
};

export const getPrevisions = () =>
  api.get("/ia/previsions") as unknown as Promise<
    IaApiResponse<IaPrevisionsResponse>
  >;
export const getAlertesRupture = () =>
  api.get("/ia/alertes-rupture") as unknown as Promise<IaApiResponse<unknown>>;
export const sendChat = (message: string, idConversation?: string) =>
  api.post("/ia/chat", { message, idConversation }) as unknown as Promise<
    IaApiResponse<IaChatResponse>
  >;
export const getConversations = () =>
  api.get("/ia/conversations") as unknown as Promise<
    IaApiResponse<IaConversation[]>
  >;
export const getConversationMessages = (idConversation: string) =>
  api.get(`/ia/conversations/${idConversation}/messages`) as unknown as Promise<
    IaApiResponse<IaMessage[]>
  >;
export const renameConversation = (idConversation: string, titre: string) =>
  api.patch(`/ia/conversations/${idConversation}`, {
    titre,
  }) as unknown as Promise<IaApiResponse<IaConversation>>;
export const deleteConversation = (idConversation: string) =>
  api.delete(`/ia/conversations/${idConversation}`) as unknown as Promise<
    IaApiResponse<null>
  >;
export const genererRapport = (
  type: IaRapport["typeRapport"],
  periode: IaRapport["periode"],
) =>
  api.post("/ia/rapport", { type, periode }) as unknown as Promise<
    IaApiResponse<IaRapport>
  >;
export const telechargerRapportPdf = (idRapport: string) =>
  api.get(`/ia/rapports/${idRapport}/pdf`, {
    responseType: "blob",
  }) as unknown as Promise<Blob>;
export const getRapports = () =>
  api.get("/ia/rapports") as unknown as Promise<IaApiResponse<IaRapport[]>>;
