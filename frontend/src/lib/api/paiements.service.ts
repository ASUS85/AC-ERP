import api from "./client";

export type CreatePaiementPayload = {
  idFacture: string;
  montant: number;
  modePaiement:
    | "ESPECES"
    | "CHEQUE"
    | "VIREMENT"
    | "MOBILE_MONEY"
    | "CARTE"
    | "COMPENSATION";
  datePaiement?: string;
  reference?: string;
  notes?: string;
};

export type PaiementApi = {
  id: string;
  reference: string | null;
  montant: number | string;
  modePaiement: string | null;
  datePaiement: string;
  notes?: string | null;
  facture?: {
    id: string;
    numeroFacture: string;
    typeFacture?: "VENTE" | "ACHAT" | string;
    client?: {
      nom: string;
    };
    fournisseur?: {
      raisonSociale: string;
    };
  };
  utilisateur?: {
    id: string;
    nom: string;
    prenom: string;
  };
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: { total: number; page: number; limit: number };
  message?: string;
};

export type PaiementsKpis = {
  encaissements: number;
  decaissements: number;
  tresorerieNette: number;
  recusEmis: number;
};

export const getPaiements = (params?: Record<string, unknown>) =>
  api.get<any, ApiResponse<PaiementApi[]>>("/paiements", { params });

export const getPaiementsKpis = () =>
  api.get<any, ApiResponse<PaiementsKpis>>("/paiements/kpis");

export const createPaiement = (data: CreatePaiementPayload) =>
  api.post("/paiements", data);
