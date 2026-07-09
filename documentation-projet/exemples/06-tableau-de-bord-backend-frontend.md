# 06 - Exemple concret : lier le tableau de bord backend et frontend

Le backend du tableau de bord existe deja.

Routes disponibles :

```txt
GET /api/v1/dashboard/kpis
GET /api/v1/dashboard/evolution-ventes
GET /api/v1/dashboard/top-produits
GET /api/v1/dashboard/top-clients
GET /api/v1/dashboard/repartition-categories
```

Le frontend a deja un fichier service :

```txt
frontend/src/lib/api/dashboard.service.ts
```

Mais la page du tableau de bord utilise encore des donnees statiques venant de :

```txt
frontend/src/lib/erp-data.ts
```

L'objectif est donc de remplacer progressivement les donnees statiques par les donnees de l'API.

## 1. Backend : repository

Le repository interroge la base :

```js
// backend/src/modules/dashboard/dashboard.repository.js
import prisma from "../../config/database.js";

export const dashboardRepository = {
  async kpis() {
    const [clients, produits, factures, impayees] = await Promise.all([
      prisma.client.count(),
      prisma.produit.count({ where: { statut: "ACTIF" } }),
      prisma.facture.aggregate({
        _sum: { totalTtc: true, montantPaye: true },
      }),
      prisma.facture.count({
        where: { statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "EN_RETARD"] } },
      }),
    ]);

    return {
      clients,
      produits,
      chiffreAffaires: factures._sum.totalTtc || 0,
      montantPaye: factures._sum.montantPaye || 0,
      facturesImpayees: impayees,
    };
  },
};
```

## 2. Backend : service

Le service appelle le repository :

```js
// backend/src/modules/dashboard/dashboard.service.js
import { dashboardRepository } from "./dashboard.repository.js";

export const dashboardService = {
  kpis: () => dashboardRepository.kpis(),
};
```

## 3. Backend : controller

Le controller renvoie la reponse HTTP :

```js
// backend/src/modules/dashboard/dashboard.controller.js
import { sendSuccess } from "../../utils/response.util.js";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  async kpis(_req, res, next) {
    try {
      const data = await dashboardService.kpis();
      return sendSuccess(res, data, "KPIs recuperes");
    } catch (error) {
      next(error);
    }
  },
};
```

## 4. Backend : route

La route expose l'endpoint :

```js
// backend/src/modules/dashboard/dashboard.routes.js
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();

router.use(authenticate);
router.get("/kpis", dashboardController.kpis);

export default router;
```

## 5. Frontend : service API TypeScript

Ajouter ou completer les types :

```ts
// frontend/src/lib/api/dashboard.service.ts
import api from "./client";

export type DashboardKpis = {
  clients: number;
  produits: number;
  chiffreAffaires: number;
  montantPaye: number;
  facturesImpayees: number;
};

export const getKPIs = () => api.get("/dashboard/kpis");
```

Version plus typee :

```ts
export const getKPIs = () =>
  api.get<unknown, { data: DashboardKpis }>("/dashboard/kpis");
```

Dans ce projet, l'intercepteur Axios renvoie directement `response.data`. Il faut donc souvent lire `response.data` pour recuperer la vraie donnee metier.

## 6. Frontend : utiliser les KPI dans la page

Exemple simple a integrer dans `frontend/src/routes/_app.index.tsx`.

```tsx
import { useEffect, useMemo, useState } from "react";
import { getKPIs, type DashboardKpis } from "@/lib/api/dashboard.service";

function Dashboard() {
  const [kpiData, setKpiData] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const response: any = await getKPIs();
        setKpiData(response.data);
      } catch (err: any) {
        setError(err.message || "Impossible de charger le tableau de bord");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const cards = useMemo(() => {
    if (!kpiData) return [];

    return [
      {
        label: "Chiffre d'affaires",
        value: fmtCurrency(kpiData.chiffreAffaires),
        sub: "Total facture",
        icon: "revenue",
      },
      {
        label: "Montant paye",
        value: fmtCurrency(kpiData.montantPaye),
        sub: "Paiements recus",
        icon: "sales",
      },
      {
        label: "Clients",
        value: String(kpiData.clients),
        sub: "clients enregistres",
        icon: "customers",
      },
      {
        label: "Produits",
        value: String(kpiData.produits),
        sub: "produits actifs",
        icon: "products",
      },
      {
        label: "Factures impayees",
        value: String(kpiData.facturesImpayees),
        sub: "a suivre",
        icon: "invoice",
      },
    ];
  }, [kpiData]);

  if (loading) return <p>Chargement du tableau de bord...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((k) => (
        <StatCard key={k.label} {...k} icon={kpiIcons[k.icon]} />
      ))}
    </div>
  );
}
```

## 7. Adapter les icones

Dans `_app.index.tsx`, `kpiIcons` contient seulement certaines cles. Si tu ajoutes `invoice`, ajoute aussi l'icone :

```tsx
import { FileWarning } from "lucide-react";

const kpiIcons: Record<string, React.ReactNode> = {
  revenue: <Banknote className="h-5 w-5" />,
  sales: <Receipt className="h-5 w-5" />,
  customers: <Users className="h-5 w-5" />,
  products: <Package className="h-5 w-5" />,
  invoice: <FileWarning className="h-5 w-5" />,
};
```

## 8. Tester

1. Demarrer le backend.
2. Se connecter dans le frontend pour avoir un token JWT.
3. Ouvrir le tableau de bord.
4. Verifier dans l'onglet reseau du navigateur que l'appel part vers :

```txt
GET http://localhost:3000/api/v1/dashboard/kpis
```

5. Si la reponse est `401`, le token est absent ou expire.
6. Si la reponse est `500`, regarder les logs backend.
7. Si l'ecran reste vide, verifier le format de `response.data`.

## Resume

Le backend fournit les donnees. Le frontend ne fait que :

- appeler le service API ;
- stocker les donnees dans un state ;
- afficher un chargement ;
- afficher une erreur si besoin ;
- transformer les donnees pour les composants visuels.
