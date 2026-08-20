# AC ERP

## Présentation

**AC ERP** est un ERP commercial web destiné aux petites et moyennes entreprises qui doivent centraliser leur catalogue, leurs clients, leurs fournisseurs, leurs stocks, leurs achats, leurs ventes, leur facturation et leurs paiements.

Le projet cible notamment les équipes commerciales, achats, logistique/stock, comptabilité, administration et direction. Il fournit une interface opérationnelle, une API REST sécurisée, des documents PDF, des alertes temps réel et des fonctions d'intelligence artificielle orientées analyse ERP.

Fonctionnalités principales :

- gestion des utilisateurs, rôles et permissions ;
- gestion des catégories, produits, clients et fournisseurs ;
- suivi des stocks, mouvements, alertes et inventaires physiques ;
- achats fournisseur, réceptions et factures fournisseur importées ;
- ventes directes, devis, commandes client, livraisons et factures ;
- paiements, avoirs, relances et documents PDF ;
- tableau de bord, statistiques, rapports et notifications temps réel ;
- assistant conversationnel, prévisions et rapports IA.

## Architecture générale

AC ERP sépare clairement l'interface web et l'API :

```mermaid
flowchart TD
  U[Utilisateur] --> FE[Frontend React / TanStack Start]
  FE --> API[API REST Express /api/v1]
  FE <--> WS[Socket.IO]
  API --> MW[Middlewares: auth, RBAC, validation, audit, rate limit]
  MW --> R[Routes modulaires]
  R --> C[Controllers]
  C --> S[Services métier]
  S --> REP[Repositories / Prisma]
  REP --> DB[(MySQL)]
  S --> EV[Événements métier]
  EV --> N[Notifications + Socket.IO + emails]
  S --> PDF[Puppeteer / PDF]
  S --> AI[Anthropic Claude]
```

Le backend suit une architecture modulaire en couches :

```text
Route HTTP -> Controller -> Service métier -> Repository -> Prisma -> MySQL
```

- **Routes** : déclarent les endpoints et les middlewares appliqués.
- **Controllers** : adaptent la requête HTTP, appellent le service et utilisent le format de réponse commun.
- **Services** : portent les règles métier, les transactions, les événements et les intégrations externes.
- **Repositories** : centralisent les requêtes Prisma.
- **Prisma** : traduit les opérations applicatives vers MySQL.

Cette organisation combine une architecture **modulaire**, une **architecture en couches**, le **Service Layer Pattern** et le **Repository Pattern**.

## Technologies utilisées

### Frontend

| Technologie | Utilité réelle dans AC ERP | Où elle est utilisée |
|---|---|---|
| React 19 + TypeScript | Interface utilisateur et composants métier typés. | `frontend/src/routes`, `components`, `hooks`. |
| TanStack Router / TanStack Start | Routes fichier, navigation, préchargement et rendu serveur/client. | `router.tsx`, `routes/`, `routeTree.gen.ts`, `server.ts`. |
| Vite | Serveur de développement et build frontend. | Scripts `dev`, `build`, `preview`. |
| Tailwind CSS 4 | Mise en page, couleurs et responsive design. | `styles.css`, classes dans composants/routes. |
| Zustand | Cache mémoire et état partagé pour éviter les appels répétés. | `src/stores`: dashboard, auth, settings, categories, products, clients. |
| Axios | Client HTTP, injection Bearer, rafraîchissement du token et normalisation des erreurs. | `src/lib/api/client.ts`. |
| Socket.IO Client | Réception de notifications temps réel. | `src/hooks/useNotifications.ts`. |
| Recharts | Graphiques Dashboard, Statistiques et Prévisions IA. | `routes/_app.index.tsx`, `_app.statistics.tsx`, `_app.ai.tsx`. |
| Lucide React | Icônes de navigation et d'actions. | Composants UI et ERP. |
| Radix UI + shadcn-like components | Primitives accessibles : dialog, select, dropdown, tabs, avatar, etc. | `src/components/ui`. |
| Sonner | Notifications toast. | Routes et actions métier. |
| React Hook Form / Zod resolver | Installés ; utilisation non significative détectée dans les routes principales actuelles. | Dépendances frontend. |
| TanStack React Query | `QueryClient` est créé dans `router.tsx`, mais les chargements métier actuels reposent principalement sur services API, hooks et Zustand. |

### Backend

| Technologie | Utilité réelle dans AC ERP | Où elle est utilisée |
|---|---|---|
| Node.js + Express 5 | API REST modulaire en ESM. | `backend/src/app.js`, `server.js`. |
| Prisma 6 | ORM, requêtes, relations et transactions. | `backend/prisma/schema.prisma`, repositories. |
| MySQL | Base de données relationnelle. | Datasource Prisma via `DATABASE_URL`. |
| JSON Web Token | Access token et refresh token. | `config/jwt.js`, `services/jwt.service.js`, auth middleware. |
| bcryptjs | Hachage et vérification des mots de passe. | `modules/auth/auth.service.js`. |
| Zod | Validation de données dans les modules qui exposent des schémas de validation. | `*.validation.js`, middleware de validation. |
| Socket.IO | Notifications push par utilisateur. | `services/socket.service.js`, handlers d'événements. |
| Nodemailer | MFA e-mail, réinitialisation, factures, devis et alertes e-mail. | `config/email.js`, `services/email.service.js`. |
| Puppeteer + Handlebars | Génération de PDF A4 depuis HTML. | `services/pdf-render.service.js`, services documentaires. |
| Anthropic SDK | Assistant conversationnel IA Claude. | `modules/ia/ia.service.js`. |
| Winston + Morgan | Logs applicatifs et HTTP. | `utils/logger.js`, `app.js`. |
| Multer | Upload sécurisé d'images et documents. | `middlewares/upload.middleware.js`. |
| express-rate-limit + Helmet + CORS | Protection de l'API. | `middlewares/rateLimiter.middleware.js`, `app.js`, `config/cors.js`. |
| Swagger / OpenAPI | Documentation API interactive. | `config/swagger.js`, `docs/openapi`. |
| ExcelJS | Installé pour les exports tableurs ; usage non significatif confirmé dans les services inspectés. |
| node-cron | Installé ; présence de tâches planifiées à vérifier lors de l'ajout de nouveaux jobs. |

## Structure du projet

```text
ac_erp/
├── frontend/                         # Application React / TanStack Start
│   ├── src/
│   │   ├── routes/                   # Pages et layouts TanStack Router
│   │   ├── components/
│   │   │   ├── ui/                   # Primitives UI réutilisables
│   │   │   └── erp/                  # Composants métier partagés
│   │   ├── lib/api/                  # Services Axios par domaine
│   │   ├── stores/                   # Caches Zustand
│   │   ├── hooks/                    # Hooks, notamment notifications temps réel
│   │   ├── assets/                   # Ressources statiques importées
│   │   ├── router.tsx                # Création du router TanStack
│   │   └── styles.css                # Styles globaux
│   ├── package.json
│   └── vite.config.ts
├── backend/                          # API Express / Prisma
│   ├── prisma/
│   │   ├── schema.prisma             # Modèle relationnel MySQL
│   │   └── seed.js                   # Données de démarrage
│   ├── src/
│   │   ├── modules/                  # Domaines métier de l'API
│   │   ├── middlewares/              # Auth, RBAC, validation, upload, audit...
│   │   ├── services/                 # PDF, e-mail, JWT, Socket.IO...
│   │   ├── events/                   # Événements métier et handlers notifications
│   │   ├── config/                   # Base, CORS, JWT, e-mail, Swagger
│   │   ├── utils/                    # Réponses, pagination, slug, logs
│   │   ├── app.js                    # Composition Express
│   │   └── server.js                 # Démarrage HTTP, DB et Socket.IO
│   ├── uploads/                      # Fichiers uploadés, servis avec cache HTTP long
│   └── package.json
├── documentation-projet/             # Documentation pédagogique complémentaire
│   └── exemples/
└── README.md                         # Ce document
```

## Architecture Frontend

### Routes et layouts

Les routes suivent le système file-based de TanStack Router. Le layout privé `_app.tsx` protège les routes internes :

1. il vérifie la présence d'un access token ;
2. il récupère le profil via le cache Zustand ;
3. il redirige vers `/login` si la session est absente ou invalide ;
4. il ne rend pas l'interface privée avant la vérification cliente, évitant un flash de sidebar/contenu interne.

Les routes `_app.*.tsx` correspondent aux écrans métier : Dashboard, Produits, Clients, Fournisseurs, Stocks, Achats, Ventes, Factures, Paiements, IA, Rapports, Statistiques, Utilisateurs, Rôles, Notifications et Paramètres.

### Composants

- `components/ui` contient les éléments génériques : Button, Input, Dialog, DropdownMenu, Tabs, Avatar, Select, Skeleton, etc.
- `components/erp` contient les composants orientés ERP : `PageHeader`, `SectionCard`, `StatCard`, `DataTable`, `StatusBadge`, `AppModal`, `Sidebar`, `Topbar`, `ChartFrame`.
- `lib/api` conserve un service par domaine. Les composants ne dupliquent pas les URLs HTTP.

### État et cache

Les formulaires, filtres, modales, pagination d'écran et états temporaires restent gérés avec `useState`/`useEffect`.

Zustand centralise uniquement les données réutilisables ou coûteuses :

| Store | Données | Stratégie |
|---|---|---|
| `auth.store.ts` | Profil courant et sessions | Cache profil 30 min lié au token, sessions 5 min, déduplication. |
| `dashboard.store.ts` | Overview Dashboard | Cache 10 min, requête simultanée unique, invalidation manuelle. |
| `settings.store.ts` | Paramètres entreprise et système | Cache 20 min, mise à jour locale après sauvegarde. |
| `categories.store.ts` | Listes et arbre de catégories | Cache 10 min par paramètres et arbre dédié. |
| `products.store.ts` | Listes produits | Cache 5 min indexé par page, limite, recherche, catégorie et statut. |
| `clients.store.ts` | Listes clients | Cache 5 min indexé par paramètres, invalidé après CRUD. |

Les stores conservent une promesse par clé de requête : plusieurs composants demandant exactement la même liste utilisent une seule requête réseau.

### Communication HTTP

`lib/api/client.ts` configure Axios :

- URL de base : `VITE_API_URL` ou `http://localhost:3000/api/v1` ;
- ajout de `Authorization: Bearer <access token>` ;
- tentative de refresh sur `401 TOKEN_EXPIRED` ;
- redirection vers `/login` si le refresh échoue ;
- erreurs normalisées depuis la réponse API.

## Architecture Backend

### Modules métier

Chaque module est monté sous `/api/v1` dans `src/modules/index.js`.

| Préfixe API | Responsabilité |
|---|---|
| `/auth` | Connexion MFA, profil, sessions, mot de passe, refresh/logout. |
| `/utilisateurs`, `/roles` | Comptes, rôles et permissions. |
| `/categories`, `/produits` | Catalogue. |
| `/clients`, `/fournisseurs` | Partenaires commerciaux. |
| `/stocks` | Stocks, mouvements, alertes et inventaires. |
| `/achats` | Demandes d'achat, BCF, réceptions et factures fournisseur. |
| `/ventes` | Devis, commandes client, livraisons et ventes directes. |
| `/factures`, `/paiements` | Facturation, avoirs, paiements et états de règlement. |
| `/notifications` | Liste et lecture des alertes utilisateur. |
| `/dashboard`, `/rapports` | Indicateurs, exports et rapports métier. |
| `/ia` | Conversation IA, prévisions, alertes rupture et rapports IA. |
| `/parametres` | Paramètres entreprise et système, journal. |

### Middlewares et services transverses

- `auth.middleware.js` vérifie le JWT Bearer et alimente `req.user`.
- `rbac.middleware.js` impose une ou plusieurs permissions.
- `validate.middleware.js` valide les payloads Zod lorsqu'un schéma est branché.
- `rateLimiter.middleware.js` protège l'API globalement et les routes auth spécifiquement.
- `upload.middleware.js` applique type MIME et taille maximale aux uploads.
- `audit.middleware.js` trace l'activité.
- `maintenance.middleware.js` permet de protéger le système pendant une maintenance.
- `error.middleware.js` transforme erreurs métier, Prisma et Zod en réponses uniformes.

Les services transverses incluent JWT, email, rendu PDF, Socket.IO, numérotation, liens publics et logs.

## Base de données

### MySQL et Prisma

Le schéma est dans [backend/prisma/schema.prisma](backend/prisma/schema.prisma). Prisma utilise le provider MySQL et `DATABASE_URL`.

Commandes disponibles :

```bash
cd backend
npm run prisma:generate
npm run prisma:push
npm run db:migrate
npm run db:seed
```

`prisma:push` synchronise directement le schéma avec la base. `db:migrate`/`prisma:migrate` créent et appliquent des migrations Prisma. `db:seed` exécute `prisma/seed.js`.

### Entités principales

| Entité | Rôle et relations principales |
|---|---|
| `Utilisateur`, `Role`, `Permission`, `RolePermission` | Gestion des comptes et RBAC. Un utilisateur a un rôle ; un rôle porte plusieurs permissions. |
| `RefreshToken`, `PasswordResetToken` | Sessions renouvelables et réinitialisation sécurisée. |
| `AuditLog` | Traçabilité des actions. |
| `ParametreEntreprise`, `ParametreSysteme` | Configuration de l'entreprise et du système. |
| `Categorie`, `Produit`, `ProduitFournisseur` | Catalogue, unités, prix, catégories et relations fournisseurs. |
| `Client`, `Fournisseur` | Partenaires de vente et d'achat. |
| `Stock`, `MouvementStock`, `Inventaire`, `LigneInventaire` | Stock courant, mouvements et inventaires physiques. |
| `DemandeAchat`, `BonCommandeFournisseur`, `ReceptionMarchandise` | Cycle d'achat fournisseur. |
| `Devis`, `BonCommandeClient`, `BonLivraison` | Cycle commercial client. |
| `Facture`, `LigneFacture`, `Avoir`, `Paiement` | Facturation, lignes, corrections et règlements. |
| `Notification` | Alertes persistées par utilisateur. |
| `PrevisionVente`, `AlerteRupture` | Résultats de prévisions et alertes IA. |
| `ConversationIa`, `MessageIa`, `RapportIa` | Historique conversationnel et rapports IA. |

Relations simplifiées :

```mermaid
erDiagram
  UTILISATEUR }o--|| ROLE : "possède"
  ROLE ||--o{ ROLE_PERMISSION : "accorde"
  PERMISSION ||--o{ ROLE_PERMISSION : "définit"
  CATEGORIE ||--o{ PRODUIT : "classe"
  PRODUIT ||--|| STOCK : "possède"
  PRODUIT ||--o{ MOUVEMENT_STOCK : "alimente"
  CLIENT ||--o{ FACTURE : "reçoit"
  FOURNISSEUR ||--o{ BON_COMMANDE_FOURNISSEUR : "reçoit"
  BON_COMMANDE_FOURNISSEUR ||--o{ RECEPTION_MARCHANDISE : "donne lieu à"
  FACTURE ||--o{ PAIEMENT : "est réglée par"
  UTILISATEUR ||--o{ NOTIFICATION : "reçoit"
  UTILISATEUR ||--o{ CONVERSATION_IA : "possède"
```

## Authentification, autorisation et sécurité

### Flux d'authentification

```mermaid
sequenceDiagram
  participant U as Utilisateur
  participant FE as Frontend
  participant API as Auth API
  participant DB as MySQL
  participant Mail as SMTP
  U->>FE: Email + mot de passe
  FE->>API: POST /auth/login
  API->>DB: Vérifie utilisateur et hash bcrypt
  API->>Mail: Envoie code MFA e-mail
  API-->>FE: mfaToken temporaire
  U->>FE: Code à 6 chiffres
  FE->>API: POST /auth/verify-mfa
  API->>DB: Crée RefreshToken révocable
  API-->>FE: accessToken + refreshToken + profil
```

Le frontend conserve actuellement access token, refresh token et profil dans `localStorage` via `auth-session.ts`. Axios transmet l'access token dans l'en-tête Bearer. Un `401 TOKEN_EXPIRED` déclenche `POST /auth/refresh` puis la requête d'origine est rejouée.

Le backend :

- hache les mots de passe avec bcrypt ;
- limite les tentatives de connexion et verrouille un compte après cinq échecs ;
- impose MFA e-mail avec expiration et limite de tentatives ;
- crée un refresh token en base et permet sa révocation ;
- applique `authenticate` sur les routes protégées ;
- applique `authorize`/`authorizeAny` sur les routes nécessitant des permissions précises.

Les durées par défaut documentées dans `.env.example` sont `24h` pour l'access token et `7d` pour le refresh token.

## Communication API et format des réponses

Les réponses suivent les utilitaires `sendSuccess`/`sendError` :

```json
{
  "success": true,
  "data": {},
  "message": "Opération réussie",
  "meta": {}
}
```

Une erreur prend la forme :

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données invalides",
    "details": null
  }
}
```

Swagger/OpenAPI est configuré par `src/config/swagger.js`. La documentation est disponible lorsque l'API est démarrée selon le montage défini dans `app.js`.

## Modules fonctionnels et flux métier

### Catalogue et partenaires

- **Catégories** : listes, arbre hiérarchique et classification produits.
- **Produits** : prix, unité, TVA, catégorie, seuil de stock et image uploadée.
- **Clients** : coordonnées, conditions de paiement, plafond de crédit et encours.
- **Fournisseurs** : coordonnées, conditions, délais et association produit-fournisseur.

### Ventes et facturation

```text
Produit(s) -> Vente directe / Devis -> Commande client -> Livraison
          -> Facture vente -> Paiement partiel ou complet -> Facture soldée
```

La vente directe vérifie les stocks. Un client occasionnel doit régler la totalité immédiatement. Pour un client enregistré, le service vérifie le plafond de crédit et l'encours.

Les factures supportent les statuts brouillon, émise, partiellement payée, soldée, annulée et en retard. Les paiements mettent à jour le montant payé et le statut. Les avoirs permettent la correction documentaire.

### Achats et stock

```text
Demande d'achat -> Bon de commande fournisseur -> Envoi / confirmation
-> Réception marchandise -> Mise à jour des quantités reçues et du stock
-> Facture fournisseur importée -> Paiement
```

Le module Stock suit les entrées, sorties, retours et ajustements. Les inventaires démarrent avec un snapshot théorique, enregistrent le stock physique, peuvent être actualisés ou annulés, puis créent des mouvements d'ajustement transactionnels lors de la validation.

### Tableau de bord et rapports

Le dashboard agrège indicateurs, tendances ventes/achats, top produits, état stock, alertes et ventes récentes. Les rapports et documents utilisent HTML/CSS puis Puppeteer pour produire des PDF A4. Les rapports IA intègrent aussi des graphiques SVG générés côté backend, rendus directement par Puppeteer.

## Temps réel et notifications

Le backend lance Socket.IO avec le serveur HTTP. Chaque socket rejoint une room `user:<id>`. Les événements métier sont gérés dans `src/events/handlers` et peuvent créer une notification persistée, puis appeler `emitToUser`.

Le frontend se connecte dans `useNotifications.ts`. Le socket est la source principale ; un chargement initial récupère l'historique et un polling de secours de cinq minutes n'est activé qu'en cas de déconnexion Socket.IO. Le badge Topbar est mis à jour localement après lecture d'une ou de toutes les notifications.

## Emails

Nodemailer est configuré via SMTP. Les services détectés couvrent :

- code MFA ;
- réinitialisation de mot de passe ;
- e-mail de bienvenue ;
- facture PDF et devis ;
- relance de facture ;
- alerte stock ;
- bon de commande fournisseur.

La configuration SMTP est lue depuis les variables d'environnement dans `config/email.js`.

## Modules IA

Le module IA est opérationnel côté backend et frontend.

- **Assistant conversationnel** : conserve conversations et messages en base, injecte un contexte ERP sélectionné par mots-clés et appelle Anthropic Claude.
- **Prévisions** : calcule des projections de ventes et risques de rupture à partir des factures, lignes et mouvements ; les recommandations actuelles sont déterministes.
- **Rapports IA** : génère une synthèse métier depuis les données ERP, construit un HTML professionnel et produit un PDF A4 via Puppeteer.
- **Alertes** : les alertes de rupture sont persistées et exposées via l'API IA.

Limites actuelles : les prévisions sont des projections simples et les rapports n'appellent pas Claude sur le chemin de génération ; ils utilisent une synthèse déterministe pour rester rapides et fiables.

## Installation et démarrage

### Prérequis

- Node.js compatible avec les dépendances du projet ;
- MySQL accessible ;
- environnement SMTP si les e-mails doivent être envoyés ;
- une clé Anthropic valide si l'assistant conversationnel doit être utilisé ;
- navigateur Chromium fourni/téléchargeable par Puppeteer pour la génération PDF.

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:push
npm run db:seed
npm run dev
```

Autres scripts utiles :

```bash
npm run start
npm run db:migrate
npm run db:studio
npm run openapi:print
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Pour un build de production :

```bash
npm run build
npm run preview
```

Par défaut, le frontend appelle `http://localhost:3000/api/v1`. Définir `VITE_API_URL` pour pointer vers une autre API.

## Variables d'environnement

Ne jamais commiter de valeurs secrètes. Utiliser `backend/.env.example` comme base.

| Variable | Rôle |
|---|---|
| `NODE_ENV` | Environnement d'exécution. |
| `PORT` | Port HTTP de l'API. |
| `API_VERSION` | Version affichée par le health check. |
| `APP_NAME` | Nom applicatif. |
| `FRONTEND_URL` | Origine frontend autorisée par CORS et utilisée pour les liens. |
| `DATABASE_URL` | Connexion MySQL Prisma. |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secrets de signature JWT. |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | Durées des tokens. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Envoi e-mail. |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `RATE_LIMIT_AUTH_MAX` | Limitation de débit. |
| `UPLOAD_DIR`, `MAX_FILE_SIZE` | Répertoire et taille maximum des uploads. |
| `ANTHROPIC_API_KEY` | Clé Claude ; requise pour la conversation IA. |
| `LLM_MODEL`, `LLM_MAX_TOKENS` | Modèle et limite de tokens IA. |

Exemple minimal sans secrets :

```dotenv
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/erp_intelligent"
JWT_ACCESS_SECRET="secret_long_et_unique"
JWT_REFRESH_SECRET="secret_long_et_unique"
FRONTEND_URL="http://localhost:5173"
SMTP_HOST="smtp.example.com"
SMTP_USER="user@example.com"
SMTP_PASS="mot_de_passe_smtp"
ANTHROPIC_API_KEY="..."
```

## État actuel du projet

### Fonctionnalités terminées ou opérationnelles

- architecture frontend/backend séparée ;
- authentification JWT avec MFA e-mail, refresh token et gestion de sessions ;
- RBAC par rôles et permissions ;
- modules catalogue, clients, fournisseurs, stocks, inventaires, achats, ventes, factures et paiements ;
- dashboard, statistiques, graphiques, exports PDF et documents ;
- uploads images/documents avec limites MIME/taille ;
- notifications persistées et Socket.IO ;
- assistant IA Claude, prévisions, alertes de rupture et rapports PDF ;
- caches Zustand pour auth, settings, dashboard, catégories, produits et clients.

### Fonctionnalités partiellement implémentées ou à surveiller

- certaines dépendances frontend sont installées mais leur emploi métier est limité ou non significatif (`@tanstack/react-query`, React Hook Form, résolveurs Zod) ;
- les données de session frontend sont actuellement en `localStorage` ; une évolution vers cookies HTTP-only peut être étudiée pour un niveau de sécurité supérieur ;
- les prévisions IA reposent sur un calcul simple et non sur un modèle prédictif entraîné ;
- les caches Zustand doivent être invalidés lors de nouvelles mutations inter-modules pour conserver des écrans instantanés mais cohérents.

### Interfaces ou structures préparées

- la documentation OpenAPI contient certaines descriptions orientées évolution produit ; toujours vérifier les routes montées dans `src/modules/index.js` pour l'état contractuel actuel ;
- les fonctionnalités installées mais non significativement utilisées ne doivent pas être considérées comme des capacités métier actives.

## Synthèse technique

| Partie | Technologie / modèle | Rôle |
|---|---|---|
| Interface | React, TypeScript, Tailwind | Écrans ERP responsive. |
| Navigation | TanStack Router / Start | Routes, layout privé et SSR/client. |
| État partagé | Zustand | Cache, déduplication et invalidation ciblée. |
| API | Express 5, architecture modulaire en couches | Endpoints métier REST. |
| Données | Prisma + MySQL | Modèle relationnel et transactions. |
| Sécurité | JWT, bcrypt, MFA, RBAC, Helmet, CORS, rate limit | Protection des accès et des routes. |
| Temps réel | Socket.IO | Notifications utilisateur. |
| Documents | Handlebars/HTML + Puppeteer | PDF A4 et exports. |
| E-mail | Nodemailer/SMTP | MFA, notifications et documents. |
| IA | Anthropic SDK + règles ERP | Assistant, prévisions et rapports. |

---

Pour une lecture pédagogique complémentaire, consulter `documentation-projet/` et ses exemples. Ce README décrit l'architecture réellement présente à la date de sa rédaction ; les modules et contrats API doivent être maintenus à jour à chaque évolution importante.