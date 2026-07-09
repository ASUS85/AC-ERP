# 02 - Creer ou modifier un module backend

Un module backend contient en general 4 fichiers :

```txt
monmodule.routes.js
monmodule.controller.js
monmodule.service.js
monmodule.repository.js
```

Le projet utilise deja cette organisation dans `produits`, `clients`, `dashboard`, `ventes`, etc.

## Exemple : module Produits simplifie

### 1. Repository

Le repository parle directement avec Prisma et la base de donnees.

```js
// backend/src/modules/produits/produits.repository.js
import prisma from "../../config/database.js";

export const produitsRepository = {
  list() {
    return prisma.produit.findMany({
      orderBy: { createdAt: "desc" },
      include: { categorie: true },
    });
  },

  findById(id) {
    return prisma.produit.findUnique({
      where: { id },
      include: { categorie: true },
    });
  },

  create(data) {
    return prisma.produit.create({ data });
  },
};
```

### 2. Service

Le service contient la logique metier. C'est ici qu'on verifie les regles avant d'enregistrer.

```js
// backend/src/modules/produits/produits.service.js
import { produitsRepository } from "./produits.repository.js";

export const produitsService = {
  list() {
    return produitsRepository.list();
  },

  async create(payload) {
    if (!payload.nom) {
      throw new Error("Le nom du produit est obligatoire");
    }

    return produitsRepository.create({
      nom: payload.nom,
      prixVente: Number(payload.prixVente || 0),
      statut: "ACTIF",
    });
  },
};
```

### 3. Controller

Le controller recoit la requete HTTP et renvoie une reponse.

```js
// backend/src/modules/produits/produits.controller.js
import { sendSuccess } from "../../utils/response.util.js";
import { produitsService } from "./produits.service.js";

export const produitsController = {
  async list(req, res, next) {
    try {
      const produits = await produitsService.list(req.query);
      return sendSuccess(res, produits, "Produits recuperes");
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const produit = await produitsService.create(req.body);
      return sendSuccess(res, produit, "Produit cree", null, 201);
    } catch (error) {
      next(error);
    }
  },
};
```

### 4. Routes

La route relie une URL a une methode du controller.

```js
// backend/src/modules/produits/produits.routes.js
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { produitsController } from "./produits.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", produitsController.list);
router.post("/", produitsController.create);

export default router;
```

### 5. Enregistrer le module

Le module doit etre ajoute dans le routeur principal :

```js
// backend/src/modules/index.js
import produitsRoutes from "./produits/produits.routes.js";

router.use("/produits", produitsRoutes);
```

L'URL finale devient :

```txt
GET  /api/v1/produits
POST /api/v1/produits
```

## Bonne pratique

Ne mets pas les requetes Prisma directement dans le controller. Garde le flux :

```txt
route -> controller -> service -> repository -> Prisma
```
