# 06 - Dynamiser le tableau de bord backend/frontend

Objectif : remplacer les donnees statiques du dashboard par les donnees de l'API, sans changer le rendu visuel du frontend.

La page concernee est :

```txt
frontend/src/routes/_app.index.tsx
```

Aujourd'hui, cette page affiche les donnees venant de :

```txt
frontend/src/lib/erp-data.ts
```

Pour garder exactement le meme rendu, le backend doit renvoyer des donnees avec la meme forme que ces constantes frontend.

## 1. Contrat attendu par le frontend

Le dashboard affiche 6 zones :

```ts
type DashboardKpi = {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  sub?: string;
  icon: "revenue" | "sales" | "customers" | "products" | "stock" | "suppliers";
};

type SalesTrendItem = {
  mois: string;
  ventes: number;
  achats: number;
};

type TopProductItem = {
  nom: string;
  ventes: number;
};

type StockSplitItem = {
  name: string;
  value: number;
};

type AlertItem = {
  type: "warning" | "destructive" | "info" | "success";
  title: string;
  text: string;
  icon: "stock" | "invoice" | "ai" | "goal";
};

type RecentSaleItem = {
  ref: string;
  client: string;
  montant: number;
  statut: string;
  date: string;
};

type DashboardOverview = {
  kpis: DashboardKpi[];
  salesTrend: SalesTrendItem[];
  topProducts: TopProductItem[];
  stockSplit: StockSplitItem[];
  alerts: AlertItem[];
  recentSales: RecentSaleItem[];
};
```

Le frontend peut ensuite continuer a utiliser les composants existants :

```tsx
<StatCard key={k.label} {...k} icon={kpiIcons[k.icon]} />
<AreaChart data={salesTrend}>...</AreaChart>
<Pie data={stockSplit} dataKey="value" nameKey="name">...</Pie>
<BarChart data={topProducts}>...</BarChart>
{alerts.map(...)}
{recentSales.map(...)}
```

## 2. Backend : routes a exposer

Les routes existantes peuvent rester, mais pour charger tout le tableau sans multiplier les appels, ajouter une route globale :

```txt
GET /api/v1/dashboard/overview
```

Routes recommandees :

```txt
GET /api/v1/dashboard/overview
GET /api/v1/dashboard/kpis
GET /api/v1/dashboard/evolution-ventes
GET /api/v1/dashboard/top-produits
GET /api/v1/dashboard/top-clients
GET /api/v1/dashboard/repartition-categories
```

Le frontend du dashboard peut utiliser seulement `/overview`. Les autres routes restent utiles pour les tests ou les futurs widgets.

## 3. Backend : repository

Le repository doit transformer les resultats Prisma dans la forme attendue par le frontend.

Points importants :

- convertir les `Decimal` Prisma avec `Number(...)`;
- renvoyer des montants numeriques pour les graphiques;
- renvoyer des `value` deja formatees en texte pour les KPI;
- renvoyer les mois sous forme `Jan`, `Fev`, `Mar`, etc.;
- renvoyer les pourcentages de stock avec `value` entre `0` et `100`;
- limiter `topProducts` a 5 elements;
- limiter `recentSales` a 5 ventes/factures recentes.

Exemple de structure :

```js
// backend/src/modules/dashboard/dashboard.repository.js
import prisma from "../../config/database.js";

const monthLabels = [
  "Jan",
  "Fev",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Aout",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const money = (value) =>
  new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0)) + " f";

const dateFr = (value) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

function invoiceStatusLabel(statut) {
  const labels = {
    EMISE: "Emise",
    PAYEE: "Payee",
    PARTIELLEMENT_PAYEE: "Partielle",
    EN_RETARD: "En retard",
    ANNULEE: "Annulee",
  };
  return labels[statut] || statut;
}

export const dashboardRepository = {
  async overview() {
    const [
      kpis,
      salesTrend,
      topProducts,
      stockSplit,
      alerts,
      recentSales,
    ] = await Promise.all([
      this.kpis(),
      this.evolutionVentes(),
      this.topProduits(),
      this.repartitionCategories(),
      this.alertes(),
      this.dernieresVentes(),
    ]);

    return { kpis, salesTrend, topProducts, stockSplit, alerts, recentSales };
  },

  async kpis() {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      currentSales,
      previousSales,
      payments,
      clients,
      products,
      stock,
      suppliers,
    ] = await Promise.all([
      prisma.facture.aggregate({
        where: { typeFacture: "CLIENT", dateEmission: { gte: startMonth } },
        _sum: { totalTtc: true },
      }),
      prisma.facture.aggregate({
        where: {
          typeFacture: "CLIENT",
          dateEmission: { gte: startPreviousMonth, lte: endPreviousMonth },
        },
        _sum: { totalTtc: true },
      }),
      prisma.paiement.aggregate({
        where: { datePaiement: { gte: startMonth } },
        _sum: { montant: true },
      }),
      prisma.client.count({ where: { statut: "ACTIF" } }),
      prisma.produit.count({ where: { statut: "ACTIF" } }),
      prisma.stock.aggregate({ _sum: { stockActuel: true } }),
      prisma.fournisseur.count({ where: { statut: "ACTIF" } }),
    ]);

    const currentAmount = Number(currentSales._sum.totalTtc || 0);
    const previousAmount = Number(previousSales._sum.totalTtc || 0);
    const delta =
      previousAmount > 0
        ? ((currentAmount - previousAmount) / previousAmount) * 100
        : 0;

    return [
      {
        label: "Chiffre d'affaires",
        value: money(currentAmount),
        delta: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} %`,
        up: delta >= 0,
        sub: "vs mois dernier",
        icon: "revenue",
      },
      {
        label: "Ventes",
        value: money(currentAmount),
        delta: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} %`,
        up: delta >= 0,
        sub: "ce mois",
        icon: "sales",
      },
      {
        label: "Clients",
        value: String(clients),
        sub: "actifs",
        icon: "customers",
      },
      {
        label: "Produits",
        value: String(products),
        sub: "references actives",
        icon: "products",
      },
      {
        label: "Stock",
        value: String(stock._sum.stockActuel || 0),
        sub: "unites disponibles",
        icon: "stock",
      },
      {
        label: "Fournisseurs",
        value: String(suppliers),
        sub: "actifs",
        icon: "suppliers",
      },
    ];
  },

  async evolutionVentes(annee = new Date().getFullYear()) {
    const start = new Date(annee, 0, 1);
    const end = new Date(annee, 11, 31, 23, 59, 59, 999);

    const factures = await prisma.facture.findMany({
      where: { dateEmission: { gte: start, lte: end } },
      select: { typeFacture: true, dateEmission: true, totalTtc: true },
    });

    const months = monthLabels.map((mois) => ({ mois, ventes: 0, achats: 0 }));

    for (const facture of factures) {
      const index = new Date(facture.dateEmission).getMonth();
      const amount = Number(facture.totalTtc || 0);
      if (facture.typeFacture === "CLIENT") months[index].ventes += amount;
      if (facture.typeFacture === "FOURNISSEUR") months[index].achats += amount;
    }

    return months;
  },

  async topProduits() {
    const rows = await prisma.ligneFacture.groupBy({
      by: ["idProduit"],
      where: { idProduit: { not: null } },
      _sum: { quantite: true },
      orderBy: { _sum: { quantite: "desc" } },
      take: 5,
    });

    const products = await prisma.produit.findMany({
      where: { id: { in: rows.map((row) => row.idProduit).filter(Boolean) } },
      select: { id: true, designation: true },
    });

    const names = new Map(products.map((product) => [product.id, product.designation]));

    return rows.map((row) => ({
      nom: names.get(row.idProduit) || "Produit inconnu",
      ventes: Number(row._sum.quantite || 0),
    }));
  },

  async repartitionCategories() {
    const rows = await prisma.stock.findMany({
      include: { produit: { include: { categorie: true } } },
    });

    const totals = new Map();
    let totalStock = 0;

    for (const row of rows) {
      const name = row.produit.categorie.nom;
      const quantity = Number(row.stockActuel || 0);
      totalStock += quantity;
      totals.set(name, (totals.get(name) || 0) + quantity);
    }

    if (totalStock === 0) return [];

    return [...totals.entries()]
      .map(([name, quantity]) => ({
        name,
        value: Math.round((quantity / totalStock) * 100),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  },

  async alertes() {
    const [products, lateInvoices] = await Promise.all([
      prisma.produit.findMany({
        select: {
          stockMinimum: true,
          stock: { select: { stockActuel: true } },
        },
      }),
      prisma.facture.count({
        where: { statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "EN_RETARD"] } },
      }),
    ]);

    const lowStock = products.filter(
      (product) => Number(product.stock?.stockActuel || 0) <= Number(product.stockMinimum || 0),
    ).length;

    const alerts = [];

    if (lowStock > 0) {
      alerts.push({
        type: "warning",
        title: "Stock faible",
        text: `${lowStock} produit${lowStock > 1 ? "s" : ""} sous le seuil minimum`,
        icon: "stock",
      });
    }

    if (lateInvoices > 0) {
      alerts.push({
        type: "destructive",
        title: "Factures a suivre",
        text: `${lateInvoices} facture${lateInvoices > 1 ? "s" : ""} en attente de paiement`,
        icon: "invoice",
      });
    }

    alerts.push({
      type: "info",
      title: "Analyse IA",
      text: "Les tendances du mois sont pretes a etre analysees",
      icon: "ai",
    });

    return alerts;
  },

  async dernieresVentes() {
    const factures = await prisma.facture.findMany({
      where: { typeFacture: "CLIENT" },
      orderBy: { dateEmission: "desc" },
      take: 5,
      include: { client: true },
    });

    return factures.map((facture) => ({
      ref: facture.numeroFacture,
      client: facture.client?.nom || "Client inconnu",
      montant: Number(facture.totalTtc || 0),
      statut: invoiceStatusLabel(facture.statut),
      date: dateFr(facture.dateEmission),
    }));
  },
};
```

## 4. Backend : service

```js
// backend/src/modules/dashboard/dashboard.service.js
import { dashboardRepository } from "./dashboard.repository.js";

export const dashboardService = {
  overview: () => dashboardRepository.overview(),
  kpis: () => dashboardRepository.kpis(),
  evolutionVentes: (annee) => dashboardRepository.evolutionVentes(annee),
  topProduits: () => dashboardRepository.topProduits(),
  topClients: () => dashboardRepository.topClients?.() || [],
  repartitionCategories: () => dashboardRepository.repartitionCategories(),
};
```

## 5. Backend : controller

```js
// backend/src/modules/dashboard/dashboard.controller.js
import { sendSuccess } from "../../utils/response.util.js";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  async overview(_req, res, next) {
    try {
      return sendSuccess(
        res,
        await dashboardService.overview(),
        "Dashboard recupere",
      );
    } catch (error) {
      next(error);
    }
  },

  async kpis(_req, res, next) {
    try {
      return sendSuccess(res, await dashboardService.kpis(), "KPIs recuperes");
    } catch (error) {
      next(error);
    }
  },

  async evolutionVentes(req, res, next) {
    try {
      return sendSuccess(
        res,
        await dashboardService.evolutionVentes(Number(req.query.annee) || undefined),
        "Evolution des ventes recuperee",
      );
    } catch (error) {
      next(error);
    }
  },
};
```

Garder les autres methodes deja presentes pour `topProduits`, `topClients` et `repartitionCategories`.

## 6. Backend : routes

```js
// backend/src/modules/dashboard/dashboard.routes.js
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();

router.use(authenticate);
router.get("/overview", dashboardController.overview);
router.get("/kpis", dashboardController.kpis);
router.get("/evolution-ventes", dashboardController.evolutionVentes);
router.get("/top-produits", dashboardController.topProduits);
router.get("/top-clients", dashboardController.topClients);
router.get("/repartition-categories", dashboardController.repartitionCategories);

export default router;
```

## 7. Frontend : service API

Completer le service existant :

```ts
// frontend/src/lib/api/dashboard.service.ts
import api from "./client";

export type DashboardOverview = {
  kpis: Array<{
    label: string;
    value: string;
    delta?: string;
    up?: boolean;
    sub?: string;
    icon: "revenue" | "sales" | "customers" | "products" | "stock" | "suppliers";
  }>;
  salesTrend: Array<{ mois: string; ventes: number; achats: number }>;
  topProducts: Array<{ nom: string; ventes: number }>;
  stockSplit: Array<{ name: string; value: number }>;
  alerts: Array<{
    type: "warning" | "destructive" | "info" | "success";
    title: string;
    text: string;
    icon: "stock" | "invoice" | "ai" | "goal";
  }>;
  recentSales: Array<{
    ref: string;
    client: string;
    montant: number;
    statut: string;
    date: string;
  }>;
};

export const getDashboardOverview = () => api.get("/dashboard/overview");
export const getKPIs = () => api.get("/dashboard/kpis");
export const getEvolutionVentes = (annee?: number) =>
  api.get("/dashboard/evolution-ventes", { params: { annee } });
export const getTopProduits = (periode?: string) =>
  api.get("/dashboard/top-produits", { params: { periode } });
export const getTopClients = (periode?: string) =>
  api.get("/dashboard/top-clients", { params: { periode } });
```

Dans ce projet, l'intercepteur Axios renvoie deja l'enveloppe API `success/message/data`. Il faut donc lire `response.data`.

## 8. Frontend : modification minimale de `_app.index.tsx`

Ne pas changer le JSX des cartes, graphiques et tableaux. Remplacer seulement les constantes statiques par un state rempli par l'API.

```tsx
import { useEffect, useState } from "react";
import {
  getDashboardOverview,
  type DashboardOverview,
} from "@/lib/api/dashboard.service";
import {
  kpis as fallbackKpis,
  salesTrend as fallbackSalesTrend,
  topProducts as fallbackTopProducts,
  stockSplit as fallbackStockSplit,
  recentSales as fallbackRecentSales,
  alerts as fallbackAlerts,
  fmtCurrency,
} from "@/lib/erp-data";

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardOverview>({
    kpis: [...fallbackKpis],
    salesTrend: fallbackSalesTrend,
    topProducts: fallbackTopProducts,
    stockSplit: fallbackStockSplit,
    recentSales: fallbackRecentSales,
    alerts: fallbackAlerts,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const response = await getDashboardOverview();
        if (response?.data) setDashboard(response.data);
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const { kpis, salesTrend, topProducts, stockSplit, recentSales, alerts } =
    dashboard;

  // Garder le return actuel.
}
```

Le fallback permet de ne rien casser si l'API est momentanement indisponible pendant le developpement.

## 9. Points a respecter pour garder le meme rendu

- `kpis` doit contenir 6 elements pour conserver la grille `xl:grid-cols-6`.
- `icon` doit rester dans les cles deja utilisees par `kpiIcons`.
- `salesTrend` doit contenir `mois`, `ventes`, `achats`, sinon le graphique `AreaChart` sera vide.
- `stockSplit` doit contenir `name` et `value`, sinon le graphique circulaire sera vide.
- `topProducts` doit contenir `nom` et `ventes`, sinon le `BarChart` ne trouvera pas ses axes.
- `alerts.type` doit etre `warning`, `destructive`, `info` ou `success`.
- `alerts.icon` doit etre `stock`, `invoice`, `ai` ou `goal`.
- `recentSales.statut` doit etre une chaine compatible avec `StatusBadge`.
- `recentSales.montant` doit rester numerique, car le frontend applique `fmtCurrency`.

## 10. Tests

1. Demarrer le backend.
2. Se connecter dans le frontend.
3. Tester dans le navigateur :

```txt
GET http://localhost:3000/api/v1/dashboard/overview
```

4. Verifier que la reponse contient :

```json
{
  "success": true,
  "data": {
    "kpis": [],
    "salesTrend": [],
    "topProducts": [],
    "stockSplit": [],
    "alerts": [],
    "recentSales": []
  }
}
```

5. Ouvrir le tableau de bord.
6. Verifier que le rendu visuel reste identique : memes cartes, memes graphiques, meme table "Dernieres ventes".
7. Verifier que les valeurs changent quand on ajoute une facture, un paiement, un produit ou un stock.

## Resume

Pour dynamiser le dashboard sans casser le frontend :

- le backend doit renvoyer la meme forme que les anciennes constantes statiques;
- le frontend doit seulement remplacer la source des donnees;
- le JSX du dashboard peut rester quasiment identique;
- l'endpoint recommande est `GET /api/v1/dashboard/overview`;
- les anciennes routes dashboard peuvent rester disponibles.
