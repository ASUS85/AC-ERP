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
  reference: string;
  montant: number | string;
  modePaiement: string;
  datePaiement: string;
  notes?: string | null;
  facture?: {
    id: string;
    numeroFacture: string;
    client?: {
      nom: string;
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

export const getPaiements = (params?: Record<string, unknown>) =>
  api.get<any, ApiResponse<PaiementApi[]>>("/paiements", { params });

export const createPaiement = (data: CreatePaiementPayload) =>
  api.post("/paiements", data);
