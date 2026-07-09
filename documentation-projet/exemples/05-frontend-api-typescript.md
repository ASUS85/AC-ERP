# 05 - Appeler le backend depuis le frontend TypeScript

Le frontend utilise Axios via un client centralise :

```txt
frontend/src/lib/api/client.ts
```

Ce client configure :

- l'URL de base de l'API ;
- le header `Content-Type` ;
- le token JWT ;
- la gestion du refresh token ;
- le format des erreurs.

## Creer un service API frontend

Exemple pour les produits :

```ts
// frontend/src/lib/api/produits.service.ts
import api from "./client";

export type Produit = {
  id: string;
  nom: string;
  reference?: string;
  prixVente: number;
  statut: "ACTIF" | "INACTIF";
};

export type ProduitPayload = {
  nom: string;
  prixVente: number;
  idCategorie?: string;
};

export const getProduits = () => api.get("/produits");

export const createProduit = (payload: ProduitPayload) =>
  api.post("/produits", payload);

export const updateProduit = (id: string, payload: Partial<ProduitPayload>) =>
  api.put(`/produits/${id}`, payload);

export const deleteProduit = (id: string) =>
  api.delete(`/produits/${id}`);
```

## Utiliser le service dans une page React

```tsx
import { useEffect, useState } from "react";
import { getProduits, type Produit } from "@/lib/api/produits.service";

export function ProductsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const response: any = await getProduits();
        setProduits(response.data || []);
      } catch (err: any) {
        setError(err.message || "Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <ul>
      {produits.map((produit) => (
        <li key={produit.id}>
          {produit.nom} - {produit.prixVente}
        </li>
      ))}
    </ul>
  );
}
```

## Regles importantes

- Les appels API doivent rester dans `frontend/src/lib/api`.
- Les pages React doivent appeler ces services, pas directement `axios`.
- Declare les types TypeScript proches du service API.
- Toujours prevoir `loading`, `error` et un etat vide.
- Ne jamais stocker une donnee sensible dans un fichier frontend.

## URL finale

Si le backend expose :

```txt
GET /api/v1/produits
```

Le frontend appelle seulement :

```ts
api.get("/produits");
```

car le client Axios contient deja :

```ts
baseURL: "http://localhost:3000/api/v1"
```
