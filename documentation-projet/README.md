# Documentation générale du projet AC ERP

## Présentation

AC ERP est une application de gestion d'entreprise orientée gestion commerciale, stocks, achats, ventes, facturation, paiements, reporting et aide à la décision. Le projet est organisé en deux grandes parties :

- `backend` : API REST, logique métier, sécurité, accès à la base de données et services transversaux.
- `frontend` : interface web moderne permettant aux utilisateurs de piloter les modules ERP.

L'objectif principal est de fournir une plateforme centralisée pour gérer les opérations courantes d'une entreprise : catalogue produits, clients, fournisseurs, stocks, achats, ventes, factures, paiements, utilisateurs, rôles, notifications, tableaux de bord et fonctionnalités d'intelligence artificielle.

Pour continuer le développement, des mini-guides pratiques avec exemples de code sont disponibles dans le dossier `exemples`. Ils expliquent le flux base de données, backend, routes API, services frontend TypeScript et affichage React.

## Technologies utilisées

### Backend

Le backend est développé en JavaScript moderne avec Node.js et Express.

Principaux choix techniques :

- Node.js : environnement d'exécution JavaScript côté serveur.
- Express 5 : framework utilisé pour exposer les routes HTTP de l'API.
- Prisma ORM : couche d'accès aux données et génération du client de base de données.
- MySQL : système de gestion de base de données relationnelle.
- JWT : authentification par jetons d'accès et jetons de rafraîchissement.
- RBAC : gestion des rôles et permissions pour contrôler les accès aux modules.
- Zod : validation des données entrantes.
- Socket.IO : notifications et événements temps réel.
- Swagger / OpenAPI : documentation technique de l'API.
- Winston et Morgan : journalisation applicative et logs HTTP.
- Helmet, CORS et rate limiting : sécurité HTTP, contrôle des origines et limitation des requêtes.
- Nodemailer : envoi d'e-mails, notamment pour les fonctions de sécurité.
- Puppeteer : génération de documents PDF côté serveur.
- ExcelJS : export de rapports au format Excel.
- Anthropic SDK : intégration possible d'un assistant IA lorsque la clé API est configurée.

### Frontend

Le frontend est développé en TypeScript avec React.

Principaux choix techniques :

- React 19 : construction de l'interface utilisateur.
- TypeScript : typage du code frontend pour réduire les erreurs et améliorer la maintenabilité.
- TanStack Start et TanStack Router : routage fichier par fichier et architecture web moderne.
- TanStack React Query : gestion des requêtes, du cache et de la synchronisation avec l'API.
- Vite : serveur de développement et outil de build rapide.
- Tailwind CSS 4 : stylisation utilitaire et design responsive.
- Radix UI : composants accessibles et robustes pour les éléments interactifs.
- Lucide React : icônes de l'interface.
- Recharts : graphiques et visualisation de données.
- Axios : communication HTTP avec l'API backend.
- Socket.IO Client : réception de notifications temps réel.
- React Hook Form et Zod : gestion et validation des formulaires.
- Sonner : notifications visuelles côté interface.

## Langages utilisés

- JavaScript : principalement dans le backend Node.js/Express.
- TypeScript : principalement dans le frontend React.
- SQL : utilisé indirectement via Prisma et directement pour certains scripts.
- CSS : via Tailwind CSS et les styles globaux de l'interface.
- HTML : produit par React et utilisé pour les documents ou rendus web.

## Architecture générale

Le projet suit une séparation claire entre frontend et backend.

Le backend expose une API versionnée sous `/api/v1`. Il est organisé par modules métier : authentification, utilisateurs, rôles, catégories, produits, clients, fournisseurs, stocks, achats, ventes, factures, paiements, notifications, tableau de bord, rapports, intelligence artificielle et paramètres.

Chaque module backend suit une approche proche de :

- routes : définition des endpoints HTTP.
- controller : réception des requêtes et réponses.
- service : logique métier.
- repository : accès aux données via Prisma.

Cette organisation facilite la maintenance, car chaque domaine fonctionnel reste isolé tout en partageant des composants communs.

Le frontend est organisé autour de routes applicatives correspondant aux principaux écrans de l'ERP : tableau de bord, produits, catégories, clients, fournisseurs, stocks, achats, ventes, factures, paiements, notifications, utilisateurs, rôles, paramètres, rapports, statistiques et assistant IA.

## Approche fonctionnelle

AC ERP adopte une approche modulaire. Chaque partie de l'activité de l'entreprise est représentée par un module indépendant mais connecté aux autres.

Exemples :

- Les ventes peuvent entraîner la génération de factures, des mouvements de stock et des notifications.
- Les achats sont liés aux fournisseurs, aux bons de commande et aux réceptions.
- Les stocks sont liés au catalogue produits, aux entrées, aux sorties et aux alertes de rupture.
- Les rôles et permissions contrôlent l'accès aux fonctionnalités sensibles.
- Le tableau de bord consolide les indicateurs importants pour la prise de décision.

Cette approche convient bien à un ERP, car elle permet d'ajouter progressivement de nouveaux modules sans remettre en cause toute la structure.

## Sécurité et contrôle d'accès

La sécurité est traitée à plusieurs niveaux :

- Authentification par JWT avec access token et refresh token.
- Middleware d'authentification pour protéger les routes privées.
- Gestion des rôles et permissions afin de limiter les actions selon le profil utilisateur.
- Protection HTTP avec Helmet.
- Configuration CORS pour contrôler les origines autorisées.
- Rate limiting pour réduire les abus de requêtes.
- Journalisation des activités importantes.
- Gestion des sessions et changement de mot de passe.
- Fonctionnalités de réinitialisation de mot de passe.

Le choix d'un modèle RBAC est cohérent pour un ERP, car les utilisateurs n'ont pas tous les mêmes responsabilités : administrateur, gestionnaire, commercial, responsable stock, comptabilité, etc.

## Base de données

Le projet utilise MySQL avec Prisma. Ce choix permet de bénéficier :

- d'une base relationnelle adaptée aux données métier structurées ;
- d'un schéma centralisé décrivant les entités principales ;
- d'un client Prisma généré pour simplifier les requêtes ;
- de migrations et scripts de seed pour préparer l'environnement ;
- d'une meilleure cohérence entre le code et la base de données.

Le modèle de données couvre les besoins classiques d'un ERP : utilisateurs, rôles, permissions, produits, catégories, clients, fournisseurs, stocks, achats, ventes, factures, paiements, notifications, rapports et éléments liés à l'IA.

## Documentation API

Le backend intègre Swagger / OpenAPI. Cela permet de consulter les endpoints, les paramètres, les réponses attendues et les règles d'authentification.

Ce choix est utile pour :

- tester l'API plus facilement ;
- faciliter la collaboration entre frontend et backend ;
- présenter le fonctionnement technique du projet ;
- préparer une éventuelle intégration avec d'autres applications.

## Temps réel et événements

Le projet utilise Socket.IO et un système d'événements côté backend. Cette approche permet d'envoyer des notifications aux utilisateurs lorsque certains événements métier se produisent, par exemple une vente, un paiement, une alerte de stock ou une notification administrative.

Le temps réel apporte une meilleure réactivité à l'application, surtout pour les alertes et les informations qui doivent être visibles rapidement.

## Intelligence artificielle

Le projet contient un module IA avec des prévisions, un assistant conversationnel et des rapports IA. L'intégration Anthropic est prévue côté backend lorsque la variable d'environnement correspondante est disponible.

L'IA est utilisée comme couche d'aide à la décision plutôt que comme coeur du système. Elle peut aider à analyser les données, résumer des tendances, générer des recommandations ou assister l'utilisateur dans ses recherches.

## Génération de documents et rapports

Le projet prévoit la génération de documents et d'exports :

- PDF avec Puppeteer pour des documents comme les devis ou bons de commande.
- Excel avec ExcelJS pour des exports et rapports.
- Rapports de ventes, achats, stocks, balances clients et fournisseurs.

Ce choix est pertinent pour un ERP, car les utilisateurs ont souvent besoin de documents imprimables, transmissibles ou exploitables hors de l'application.

## Interface utilisateur

L'interface frontend est pensée comme un tableau de bord de gestion. Elle comprend :

- une navigation latérale par modules ;
- des pages métier spécialisées ;
- des tableaux de données ;
- des cartes d'indicateurs ;
- des formulaires ;
- des graphiques ;
- des notifications ;
- des vues d'administration.

Le choix de React, TypeScript, Tailwind CSS, Radix UI et TanStack permet de construire une interface moderne, maintenable, réactive et adaptée à une application de gestion.

## Possibilité de conversion en application mobile

Le projet a été pensé au départ comme une application web pouvant évoluer vers le mobile. C'est possible, mais il faut distinguer plusieurs approches.

### Option 1 : application web responsive

La première possibilité est de rendre l'interface parfaitement responsive pour mobile et tablette. Comme le frontend utilise React, Tailwind CSS et des composants modernes, cette approche est réaliste.

Avantage :

- pas besoin de créer une application mobile séparée ;
- une seule base de code frontend ;
- accès depuis un navigateur mobile.

Limite :

- l'application reste dépendante du navigateur ;
- les fonctionnalités natives du téléphone sont plus limitées.

### Option 2 : Progressive Web App

Une PWA permettrait d'installer l'application web sur un téléphone comme une application, avec une icône, un affichage plein écran et éventuellement certaines capacités hors ligne.

Avantage :

- bonne continuité avec le frontend actuel ;
- coût de développement raisonnable ;
- compatible avec l'approche web existante.

Limite :

- accès limité à certaines fonctionnalités natives selon les plateformes.

### Option 3 : wrapper mobile avec Capacitor

Une solution comme Capacitor permettrait d'encapsuler le frontend React dans une application Android ou iOS.

Avantage :

- réutilisation importante du frontend existant ;
- possibilité d'accéder à certaines fonctionnalités natives ;
- publication possible sur Play Store ou App Store.

Limite :

- nécessite une adaptation de l'interface mobile ;
- nécessite une configuration spécifique Android/iOS ;
- demande des tests sur appareils réels.

### Option 4 : application mobile dédiée

Une autre approche serait de créer une application mobile séparée avec React Native, Flutter ou une autre technologie mobile.

Avantage :

- meilleure expérience native ;
- liberté totale sur l'ergonomie mobile.

Limite :

- coût de développement plus élevé ;
- deux interfaces à maintenir ;
- duplication possible de certaines logiques.

### Recommandation mobile

Pour ce projet, l'approche la plus cohérente serait de commencer par une interface responsive solide, puis de transformer progressivement le frontend en PWA. Si le besoin d'une vraie application installable devient prioritaire, Capacitor serait une bonne étape suivante, car il permettrait de réutiliser une grande partie du travail déjà réalisé en React.

## Choix techniques et justification

Les technologies choisies sont cohérentes avec le type de projet :

- Express est simple, flexible et adapté à une API REST modulaire.
- Prisma facilite la gestion d'une base relationnelle complexe.
- MySQL est approprié pour des données métier structurées et relationnelles.
- React et TypeScript apportent une interface riche et maintenable.
- TanStack Router et TanStack Query structurent proprement la navigation et les échanges avec l'API.
- Tailwind CSS accélère la création d'une interface responsive et homogène.
- Socket.IO ajoute la dimension temps réel utile aux notifications ERP.
- Swagger facilite la documentation et la démonstration de l'API.
- JWT et RBAC répondent aux besoins de sécurité et de contrôle d'accès.

## Conclusion

AC ERP est un projet ERP web complet, structuré autour d'une API backend modulaire et d'une interface frontend moderne. Les choix techniques sont adaptés à une application de gestion : base relationnelle, API REST, sécurité par rôles, documentation OpenAPI, temps réel, rapports, génération de documents et modules d'aide à la décision.

Le projet peut évoluer vers une application mobile, principalement grâce à son frontend React et à son architecture séparée entre interface et API. La voie la plus progressive serait : responsive design, PWA, puis éventuellement Capacitor pour une publication mobile.
