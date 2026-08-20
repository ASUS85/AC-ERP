import api from "./client";

export type DashboardOverview = {
  kpis: Array<{
    label: string;
    value: string;
    delta?: string;
    up?: boolean;
    sub?: string;
    icon:
      | "revenue"
      | "sales"
      | "customers"
      | "products"
      | "stock"
      | "suppliers";
  }>;
  salesTrend: Array<{ mois: string; ventes: number; achats: number }>;
  topProducts: Array<{ nom: string; ventes: number }>;
  stockSplit: Array<{ name: string; value: number }>;
  alerts: Array<{
    type: "warning" | "destructive" | "info" | "success";
    title: string;
    text: string;
    icon: "stock" | "invoice" | "ai" | "goal";
    createdAt?: string;
  }>;
  recentSales: Array<{
    ref: string;
    client: string;
    montant: number;
    statut: string;
    date: string;
  }>;
  globalStats?: {
    annee: number;
    totalVentes: number;
    totalAchats: number;
    margeBrute: number;
    margeBrutePourcentage: number;
    nombreVentes: number;
    nombreAchats: number;
    panierMoyen: number;
    paiementsRecus: number;
    facturesImpayees: number;
    valeurStock: number;
    produitsActifs: number;
    produitsSousSeuil: number;
    clientsActifs: number;
    fournisseursActifs: number;
  };
};

export const getDashboardOverview = () => api.get("/dashboard/overview");
export const getKPIs = () => api.get("/dashboard/kpis");
export const getEvolutionVentes = (annee?: number) =>
  api.get("/dashboard/evolution-ventes", { params: { annee } });
export const getTopProduits = (periode?: string) =>
  api.get("/dashboard/top-produits", { params: { periode } });
export const getTopClients = (periode?: string) =>
  api.get("/dashboard/top-clients", { params: { periode } });
export const getDashboardPdf = () =>
  api.get("/dashboard/export.pdf", { responseType: "blob" });
