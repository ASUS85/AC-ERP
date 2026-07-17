import api from "./client";

export type ClientPayload = {
  type: "PARTICULIER" | "ENTREPRISE";
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays?: string;
  numeroFiscal?: string;
  plafondCredit?: number;
  modePaiementDefaut?: "ESPECES" | "CHEQUE" | "VIREMENT" | "MOBILE_MONEY";
  delaiPaiement?: number;
  statut?: "ACTIF" | "INACTIF" | "ARCHIVE";
};

export type ApiMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiListResponse<T> = {
  success: boolean;
  data: T[];
  meta: ApiMeta;
  message: string;
};

export const getClients = (params?: Record<string, unknown>) =>
  api.get("/clients", { params }) as Promise<{ success: boolean; data: unknown[]; meta: ApiMeta; message: string }>;

export const getClientById = (id: string) => api.get(`/clients/${id}`);

export const createClient = (data: ClientPayload) => api.post("/clients", data);

export const updateClient = (id: string, data: Partial<ClientPayload>) =>
  api.put(`/clients/${id}`, data);

export const deleteClient = (id: string) => api.delete(`/clients/${id}`);

export const getHistoriqueClient = (id: string) =>
  api.get(`/clients/${id}/historique`);

export const getClientsPdf = (params?: Record<string, unknown>) =>
  api.get("/clients/export.pdf", { params, responseType: "blob" });
