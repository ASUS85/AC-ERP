# 07 - Checklist pour ajouter un nouveau module

Exemple : tu veux ajouter un module `depenses`.

## 1. Base de donnees

Verifier si le modele existe deja dans :

```txt
backend/prisma/schema.prisma
```

S'il n'existe pas, ajouter un modele :

```prisma
model Depense {
  id          String   @id @default(uuid())
  libelle     String
  montant     Decimal
  dateDepense DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Puis executer cote backend :

```txt
npm run prisma:generate
npm run prisma:migrate
```

## 2. Backend

Creer le dossier :

```txt
backend/src/modules/depenses
```

Ajouter :

```txt
depenses.repository.js
depenses.service.js
depenses.controller.js
depenses.routes.js
```

Repository :

```js
import prisma from "../../config/database.js";

export const depensesRepository = {
  list() {
    return prisma.depense.findMany({ orderBy: { dateDepense: "desc" } });
  },

  create(data) {
    return prisma.depense.create({ data });
  },
};
```

Service :

```js
import { depensesRepository } from "./depenses.repository.js";

export const depensesService = {
  list: () => depensesRepository.list(),

  create(payload) {
    return depensesRepository.create({
      libelle: payload.libelle,
      montant: payload.montant,
      dateDepense: new Date(payload.dateDepense),
    });
  },
};
```

Controller :

```js
import { sendSuccess } from "../../utils/response.util.js";
import { depensesService } from "./depenses.service.js";

export const depensesController = {
  async list(_req, res, next) {
    try {
      return sendSuccess(res, await depensesService.list(), "Depenses recuperees");
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      return sendSuccess(res, await depensesService.create(req.body), "Depense creee", null, 201);
    } catch (error) {
      next(error);
    }
  },
};
```

Routes :

```js
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { depensesController } from "./depenses.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", depensesController.list);
router.post("/", depensesController.create);

export default router;
```

Ajouter dans le routeur principal :

```js
// backend/src/modules/index.js
import depensesRoutes from "./depenses/depenses.routes.js";

router.use("/depenses", depensesRoutes);
```

## 3. Frontend

Creer le service :

```txt
frontend/src/lib/api/depenses.service.ts
```

```ts
import api from "./client";

export type Depense = {
  id: string;
  libelle: string;
  montant: number;
  dateDepense: string;
};

export type DepensePayload = {
  libelle: string;
  montant: number;
  dateDepense: string;
};

export const getDepenses = () => api.get("/depenses");
export const createDepense = (payload: DepensePayload) => api.post("/depenses", payload);
```

Creer une page route :

```txt
frontend/src/routes/_app.depenses.tsx
```

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getDepenses, type Depense } from "@/lib/api/depenses.service";

export const Route = createFileRoute("/_app/depenses")({
  component: DepensesPage,
});

function DepensesPage() {
  const [items, setItems] = useState<Depense[]>([]);

  useEffect(() => {
    async function load() {
      const response: any = await getDepenses();
      setItems(response.data || []);
    }

    load();
  }, []);

  return (
    <div>
      <h1>Depenses</h1>
      {items.map((item) => (
        <p key={item.id}>{item.libelle} - {item.montant}</p>
      ))}
    </div>
  );
}
```

## 4. Navigation

Ajouter l'entree de menu dans :

```txt
frontend/src/lib/erp-data.ts
```

Exemple :

```ts
{ title: "Depenses", url: "/depenses", icon: Wallet, permission: "depenses:lire" }
```

## 5. Permissions

Si le module doit etre protege par des permissions, ajouter les permissions correspondantes dans le seed ou dans le systeme d'administration :

```txt
depenses:lire
depenses:creer
depenses:modifier
depenses:supprimer
```

## 6. Tests manuels minimum

- L'utilisateur connecte peut ouvrir la page.
- La page appelle bien `/api/v1/depenses`.
- La liste s'affiche.
- La creation fonctionne.
- Une erreur backend affiche un message clair.
- Un utilisateur non connecte recoit une erreur `401`.

## Regle finale

Un nouveau module est termine seulement quand il existe :

- en base de donnees ;
- dans le backend ;
- dans le frontend ;
- dans la navigation ;
- dans les permissions si necessaire ;
- avec au moins un test manuel complet.
