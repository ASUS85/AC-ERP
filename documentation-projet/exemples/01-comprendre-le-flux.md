# 01 - Comprendre le flux complet

Dans AC ERP, une information traverse plusieurs couches avant d'etre affichee a l'utilisateur.

Exemple avec les KPI du tableau de bord :

```txt
1. La base MySQL contient les clients, produits, factures, paiements...
2. Prisma interroge ces tables dans dashboard.repository.js.
3. dashboard.service.js appelle le repository et peut appliquer la logique metier.
4. dashboard.controller.js prepare la reponse HTTP.
5. dashboard.routes.js expose l'endpoint GET /dashboard/kpis.
6. Le frontend appelle /api/v1/dashboard/kpis avec Axios.
7. La page React affiche les valeurs dans des cartes.
```

## Cote backend

Endpoint final :

```txt
GET http://localhost:3000/api/v1/dashboard/kpis
```

Ce endpoint passe par :

```txt
backend/src/modules/index.js
backend/src/modules/dashboard/dashboard.routes.js
backend/src/modules/dashboard/dashboard.controller.js
backend/src/modules/dashboard/dashboard.service.js
backend/src/modules/dashboard/dashboard.repository.js
backend/src/config/database.js
backend/prisma/schema.prisma
```

## Cote frontend

Le frontend ne doit pas appeler `fetch` partout directement. Le projet a deja un client Axios centralise :

```txt
frontend/src/lib/api/client.ts
```

Il ajoute automatiquement le token JWT :

```ts
const token = localStorage.getItem("erp_access_token");
if (token) config.headers.Authorization = `Bearer ${token}`;
```

Ensuite chaque module frontend a son petit service API, par exemple :

```txt
frontend/src/lib/api/dashboard.service.ts
```

La page React importe ce service, appelle l'API, stocke le resultat dans un state, puis affiche les donnees.

## Regle simple

Pour ajouter une fonctionnalite, ne commence pas par l'interface. Commence par verifier :

1. Quelles donnees sont necessaires ?
2. Existe-t-il deja un modele Prisma ?
3. Existe-t-il deja une route backend ?
4. Existe-t-il deja un service frontend ?
5. Quelle page doit afficher ou modifier ces donnees ?
