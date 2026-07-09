# Exemples pratiques pour continuer AC ERP

Ce dossier contient de petits guides tutoriels pour aider un programmeur debutant a continuer le projet sans devoir chercher dans toute la documentation.

Chaque fichier explique une partie precise du fonctionnement :

- `01-comprendre-le-flux.md` : trajet complet d'une donnee, de la base jusqu'a l'ecran.
- `02-backend-module-exemple.md` : comment creer ou modifier un module backend.
- `03-prisma-base-de-donnees.md` : comment echanger avec la base de donnees via Prisma.
- `04-routes-controllers-services.md` : role des routes, controllers, services et repositories.
- `05-frontend-api-typescript.md` : comment appeler le backend depuis le frontend.
- `06-tableau-de-bord-backend-frontend.md` : exemple concret pour connecter le tableau de bord a l'API.
- `07-checklist-nouveau-module.md` : checklist simple pour ajouter un nouveau module.

L'idee generale du projet est simple :

```txt
Base MySQL
   |
Prisma repository
   |
Service metier
   |
Controller Express
   |
Route API /api/v1/...
   |
Service frontend Axios
   |
Page React / TypeScript
```

Quand tu ajoutes une fonctionnalite, essaie de suivre ce chemin dans cet ordre.
