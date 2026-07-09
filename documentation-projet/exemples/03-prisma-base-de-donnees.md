# 03 - Echanger avec la base de donnees via Prisma

Le backend utilise Prisma pour parler avec MySQL.

Le schema principal est ici :

```txt
backend/prisma/schema.prisma
```

La connexion Prisma est centralisee ici :

```txt
backend/src/config/database.js
```

## Exemple de lecture simple

```js
import prisma from "../../config/database.js";

const clients = await prisma.client.findMany({
  orderBy: { createdAt: "desc" },
});
```

## Exemple de lecture avec filtre

```js
const produitsActifs = await prisma.produit.findMany({
  where: { statut: "ACTIF" },
  orderBy: { nom: "asc" },
});
```

## Exemple de creation

```js
const client = await prisma.client.create({
  data: {
    nom: "Entreprise Demo",
    email: "contact@demo.com",
    telephone: "690000000",
  },
});
```

## Exemple de modification

```js
const produit = await prisma.produit.update({
  where: { id: "id-du-produit" },
  data: {
    prixVente: 15000,
  },
});
```

## Exemple de suppression

```js
await prisma.client.delete({
  where: { id: "id-du-client" },
});
```

## Exemple avec relations

Pour recuperer un produit avec sa categorie :

```js
const produit = await prisma.produit.findUnique({
  where: { id },
  include: {
    categorie: true,
  },
});
```

## Exemple pour le tableau de bord

Compter les clients :

```js
const totalClients = await prisma.client.count();
```

Additionner le total des factures :

```js
const total = await prisma.facture.aggregate({
  _sum: { totalTtc: true },
});

const chiffreAffaires = total._sum.totalTtc || 0;
```

Faire plusieurs requetes en parallele :

```js
const [clients, produits, factures] = await Promise.all([
  prisma.client.count(),
  prisma.produit.count({ where: { statut: "ACTIF" } }),
  prisma.facture.aggregate({ _sum: { totalTtc: true } }),
]);
```

## Quand modifier le schema Prisma ?

Tu modifies `schema.prisma` quand tu dois ajouter :

- une nouvelle table ;
- une nouvelle colonne ;
- une relation entre deux tables ;
- une contrainte importante ;
- un enum metier.

Apres modification du schema, utiliser les scripts du backend :

```txt
npm run prisma:generate
npm run prisma:migrate
```

ou, pendant le developpement rapide :

```txt
npm run prisma:push
```

## Attention

Prisma utilise les noms des modeles du schema. Si le modele s'appelle `Produit`, le client Prisma l'utilise en minuscule :

```js
prisma.produit.findMany()
```
