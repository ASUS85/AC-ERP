// ============================================================
// SWAGGER ANNOTATIONS — Catalogue, Clients, Fournisseurs
// ============================================================

// ─────────────────────────────────────────────────────────────
// MODULE CATÉGORIES
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [📂 Catégories]
 *     summary: Liste des catégories
 *     description: Retourne l'arborescence complète des catégories et sous-catégories
 *     parameters:
 *       - name: arbre
 *         in: query
 *         description: Si true, retourne l'arborescence hiérarchique complète
 *         schema: { type: boolean, default: false }
 *     responses:
 *       200:
 *         description: Liste des catégories
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: uuid
 *                   nom: Informatique
 *                   slug: informatique
 *                   statut: ACTIF
 *                   enfants:
 *                     - id: uuid
 *                       nom: Ordinateurs portables
 *                       slug: ordinateurs-portables
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 *   post:
 *     tags: [📂 Catégories]
 *     summary: Créer une catégorie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom]
 *             properties:
 *               nom:               { type: string, example: Électronique }
 *               description:       { type: string }
 *               idCategorieParent: { type: string, format: uuid, nullable: true }
 *               icone:             { type: string, example: fa-laptop }
 *     responses:
 *       201:
 *         description: Catégorie créée
 *         content:
 *           application/json:
 *             example: { success: true, message: Catégorie créée, data: { id: uuid, nom: Électronique, slug: electronique } }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     tags: [📂 Catégories]
 *     summary: Modifier une catégorie
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:         { type: string }
 *               description: { type: string }
 *               statut:      { type: string, enum: [ACTIF, INACTIF] }
 *     responses:
 *       200: { description: Catégorie modifiée }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 *   delete:
 *     tags: [📂 Catégories]
 *     summary: Supprimer une catégorie
 *     description: Impossible si la catégorie contient des produits ou des sous-catégories
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200: { description: Catégorie supprimée }
 *       409:
 *         description: Catégorie non supprimable (contient des produits)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: { code: BUSINESS_RULE_VIOLATION, message: Impossible de supprimer une catégorie contenant des produits }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

// ─────────────────────────────────────────────────────────────
// MODULE PRODUITS
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /produits:
 *   get:
 *     tags: [📦 Produits]
 *     summary: Liste des produits
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/searchParam'
 *       - name: categorieId
 *         in: query
 *         schema: { type: string, format: uuid }
 *       - name: statut
 *         in: query
 *         schema: { type: string, enum: [ACTIF, INACTIF, ARCHIVE] }
 *     responses:
 *       200:
 *         description: Liste paginée des produits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Produit' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 *   post:
 *     tags: [📦 Produits]
 *     summary: Créer un produit
 *     description: Crée un produit avec son stock initial. La référence SKU est générée automatiquement.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateProduitInput' }
 *     responses:
 *       201:
 *         description: Produit créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Produit' }
 *                 message: { type: string, example: Produit créé avec succès }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

/**
 * @swagger
 * /produits/{id}:
 *   get:
 *     tags: [📦 Produits]
 *     summary: Détail d'un produit
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Détail complet du produit avec stock et fournisseurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Produit' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 *   put:
 *     tags: [📦 Produits]
 *     summary: Modifier un produit
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateProduitInput' }
 *     responses:
 *       200:
 *         description: Produit modifié
 *         content:
 *           application/json:
 *             example: { success: true, message: Produit mis à jour }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 *   delete:
 *     tags: [📦 Produits]
 *     summary: Archiver un produit
 *     description: Archive le produit (non suppression physique). Impossible si stock > 0.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200: { description: Produit archivé }
 *       409:
 *         description: Produit non archivable (stock restant)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: { code: BUSINESS_RULE_VIOLATION, message: Impossible d'archiver un produit avec du stock restant }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

// ─────────────────────────────────────────────────────────────
// MODULE CLIENTS
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /clients:
 *   get:
 *     tags: [👥 Clients]
 *     summary: Liste des clients
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/searchParam'
 *       - name: statut
 *         in: query
 *         schema: { type: string, enum: [ACTIF, INACTIF, BLOQUE] }
 *       - name: type
 *         in: query
 *         schema: { type: string, enum: [PARTICULIER, ENTREPRISE] }
 *     responses:
 *       200:
 *         description: Liste paginée des clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Client' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 *   post:
 *     tags: [👥 Clients]
 *     summary: Créer un client
 *     description: Le code client est généré automatiquement (CLI-XXXX)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateClientInput' }
 *     responses:
 *       201:
 *         description: Client créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Client' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409:
 *         description: Email ou NIF déjà utilisé
 *         content:
 *           application/json:
 *             example: { success: false, error: { code: DUPLICATE_ENTRY, message: Email déjà utilisé } }
 */

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     tags: [👥 Clients]
 *     summary: Détail d'un client
 *     description: Retourne le client avec son encours, son historique et ses statistiques
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Détail du client
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: uuid
 *                 codeClient: CLI-0042
 *                 nom: Société ACME
 *                 encours: 1250000
 *                 totalAchats: 8500000
 *                 nombreCommandes: 15
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 *   put:
 *     tags: [👥 Clients]
 *     summary: Modifier un client
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateClientInput' }
 *     responses:
 *       200: { description: Client modifié }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /clients/{id}/historique:
 *   get:
 *     tags: [👥 Clients]
 *     summary: Historique des commandes d'un client
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Historique des commandes et factures du client
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data: { commandes: [], factures: [], paiements: [] }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// ─────────────────────────────────────────────────────────────
// MODULE FOURNISSEURS
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /fournisseurs:
 *   get:
 *     tags: [🏭 Fournisseurs]
 *     summary: Liste des fournisseurs
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/searchParam'
 *       - name: statut
 *         in: query
 *         schema: { type: string, enum: [ACTIF, INACTIF] }
 *     responses:
 *       200:
 *         description: Liste paginée des fournisseurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Fournisseur' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 *   post:
 *     tags: [🏭 Fournisseurs]
 *     summary: Créer un fournisseur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [raisonSociale, email, telephone, adresse, ville]
 *             properties:
 *               raisonSociale:       { type: string, example: Distributeur Global SARL }
 *               email:               { type: string, format: email }
 *               telephone:           { type: string }
 *               adresse:             { type: string }
 *               ville:               { type: string }
 *               pays:                { type: string, example: Cameroun }
 *               numeroFiscal:        { type: string }
 *               delaiLivraisonMoyen: { type: integer, example: 7 }
 *               conditionsPaiement:  { type: string }
 *     responses:
 *       201: { description: Fournisseur créé }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

/**
 * @swagger
 * /fournisseurs/{id}:
 *   get:
 *     tags: [🏭 Fournisseurs]
 *     summary: Détail d'un fournisseur
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Détail du fournisseur avec ses produits associés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Fournisseur' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 *   put:
 *     tags: [🏭 Fournisseurs]
 *     summary: Modifier un fournisseur
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               raisonSociale:       { type: string }
 *               email:               { type: string, format: email }
 *               telephone:           { type: string }
 *               adresse:             { type: string }
 *               delaiLivraisonMoyen: { type: integer }
 *               conditionsPaiement:  { type: string }
 *               statut:              { type: string, enum: [ACTIF, INACTIF] }
 *     responses:
 *       200: { description: Fournisseur modifié }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
