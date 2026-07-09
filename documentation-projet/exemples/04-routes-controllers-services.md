# 04 - Routes, controllers, services et repositories

Cette architecture evite de melanger tout le code dans un seul fichier.

## Route

La route definit l'URL et le verbe HTTP.

```js
router.get("/kpis", dashboardController.kpis);
```

Cela veut dire :

```txt
Quand quelqu'un appelle GET /dashboard/kpis,
execute dashboardController.kpis.
```

## Controller

Le controller connait Express : `req`, `res`, `next`.

```js
async kpis(_req, res, next) {
  try {
    const data = await dashboardService.kpis();
    return sendSuccess(res, data, "KPIs recuperes");
  } catch (error) {
    next(error);
  }
}
```

Le controller doit rester simple :

- lire `req.params`, `req.query` ou `req.body` ;
- appeler le service ;
- renvoyer une reponse ;
- envoyer l'erreur a `next(error)`.

## Service

Le service contient la logique metier.

```js
async createVente(payload, ctx) {
  if (!payload.lignes?.length) {
    throw new Error("Une vente doit contenir au moins une ligne");
  }

  return ventesRepository.create(payload, ctx.user.userId);
}
```

Exemples de logique metier :

- verifier qu'un champ est obligatoire ;
- calculer un montant ;
- verifier un stock ;
- appliquer une regle de permission ;
- declencher une notification ;
- appeler plusieurs repositories.

## Repository

Le repository parle avec Prisma.

```js
const factures = await prisma.facture.findMany({
  where: { statut: "EMISE" },
  include: { client: true },
});
```

Il ne doit pas connaitre Express. Donc pas de `req` ou `res` ici.

## Reponse standard

Le projet utilise `sendSuccess` pour renvoyer une reponse coherente.

```js
return sendSuccess(res, data, "Operation reussie");
```

La reponse ressemble generalement a :

```json
{
  "success": true,
  "message": "Operation reussie",
  "data": {}
}
```

## Resume

```txt
Route      = quelle URL ?
Controller = comment recevoir et repondre ?
Service    = quelle logique metier ?
Repository = quelle requete base de donnees ?
```
