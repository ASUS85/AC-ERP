// ============================================================
// SWAGGER ANNOTATIONS — Stocks, Achats, Ventes
// ============================================================

// ─────────────────────────────────────────────────────────────
// MODULE STOCKS
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /stocks:
 *   get:
 *     tags: [🏬 Stocks]
 *     summary: État des stocks en temps réel
 *     description: Retourne le niveau de stock de tous les produits actifs avec leur statut (OK, ALERTE, RUPTURE)
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/searchParam'
 *       - name: statut
 *         in: query
 *         description: Filtrer par statut de stock
 *         schema: { type: string, enum: [OK, ALERTE, RUPTURE] }
 *       - name: categorieId
 *         in: query
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Liste des stocks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/StockDetail' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

/**
 * @swagger
 * /stocks/ajustement:
 *   post:
 *     tags: [🏬 Stocks]
 *     summary: Ajuster manuellement un stock
 *     description: Permet de corriger le stock d'un produit (suite à un inventaire ou une erreur)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AjustementStockInput' }
 *     responses:
 *       200:
 *         description: Ajustement effectué
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Stock ajusté avec succès
 *               data: { stockAvant: 20, stockApres: 25, quantite: 5 }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

/**
 * @swagger
 * /stocks/mouvements:
 *   get:
 *     tags: [🏬 Stocks]
 *     summary: Historique des mouvements de stock
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - name: idProduit
 *         in: query
 *         schema: { type: string, format: uuid }
 *       - name: type
 *         in: query
 *         schema: { type: string, enum: [ENTREE_ACHAT, SORTIE_VENTE, AJUSTEMENT_POS, AJUSTEMENT_NEG, RETOUR_CLIENT, RETOUR_FOURNISSEUR] }
 *       - name: dateDebut
 *         in: query
 *         schema: { type: string, format: date }
 *       - name: dateFin
 *         in: query
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Historique des mouvements
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: uuid
 *                   typeMouvement: ENTREE_ACHAT
 *                   quantite: 20
 *                   stockAvant: 5
 *                   stockApres: 25
 *                   referenceDoc: BCF-2025-06-0010
 *                   createdAt: 2025-06-15T10:30:00Z
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

/**
 * @swagger
 * /stocks/inventaires:
 *   get:
 *     tags: [🏬 Stocks]
 *     summary: Liste des sessions d'inventaire
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Liste des inventaires
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 *   post:
 *     tags: [🏬 Stocks]
 *     summary: Lancer un inventaire physique
 *     description: Crée une nouvelle session d'inventaire avec toutes les lignes pré-remplies avec le stock théorique actuel
 *     responses:
 *       201:
 *         description: Inventaire lancé
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Inventaire lancé. 156 produits à compter.
 *               data: { id: uuid, statut: EN_COURS, nbProduits: 156 }
 *       409:
 *         description: Un inventaire est déjà en cours
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: { code: BUSINESS_RULE_VIOLATION, message: Un inventaire est déjà en cours }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

/**
 * @swagger
 * /stocks/inventaires/{id}/valider:
 *   post:
 *     tags: [🏬 Stocks]
 *     summary: Valider un inventaire et appliquer les ajustements
 *     description: Valide l'inventaire et génère automatiquement les mouvements de stock pour corriger les écarts
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Inventaire validé
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Inventaire validé. 8 ajustements appliqués.
 *               data: { ajustements: 8, excedents: 3, manquants: 5 }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// ─────────────────────────────────────────────────────────────
// MODULE ACHATS
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /achats/demandes:
 *   get:
 *     tags: [🛒 Achats]
 *     summary: Liste des demandes d'achat
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - name: statut
 *         in: query
 *         schema: { type: string, enum: [EN_ATTENTE, VALIDEE, REJETEE, ANNULEE] }
 *     responses:
 *       200: { description: Liste des demandes d'achat }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 *   post:
 *     tags: [🛒 Achats]
 *     summary: Créer une demande d'achat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lignes]
 *             properties:
 *               justification: { type: string, example: Rupture de stock imminente }
 *               lignes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [idProduit, quantiteDemandee]
 *                   properties:
 *                     idProduit:         { type: string, format: uuid }
 *                     quantiteDemandee:  { type: integer, example: 20 }
 *                     justificationLigne: { type: string }
 *     responses:
 *       201:
 *         description: Demande d'achat créée
 *         content:
 *           application/json:
 *             example: { success: true, message: Demande d'achat créée, data: { id: uuid, numeroDa: DA-2025-06-0003 } }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

/**
 * @swagger
 * /achats/demandes/{id}/valider:
 *   patch:
 *     tags: [🛒 Achats]
 *     summary: Valider ou rejeter une demande d'achat
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision]
 *             properties:
 *               decision: { type: string, enum: [VALIDER, REJETER] }
 *               motif:    { type: string, description: Obligatoire en cas de rejet }
 *     responses:
 *       200:
 *         description: Décision enregistrée
 *         content:
 *           application/json:
 *             example: { success: true, message: Demande validée avec succès }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /achats/bons-commande:
 *   get:
 *     tags: [🛒 Achats]
 *     summary: Liste des bons de commande fournisseurs
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - name: statut
 *         in: query
 *         schema: { type: string, enum: [BROUILLON, SOUMIS, VALIDE, ENVOYE, RECU_PARTIEL, RECU_TOTAL, ANNULE] }
 *       - name: idFournisseur
 *         in: query
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Liste des BCF }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 *   post:
 *     tags: [🛒 Achats]
 *     summary: Créer un bon de commande fournisseur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateBCFInput' }
 *     responses:
 *       201:
 *         description: BCF créé
 *         content:
 *           application/json:
 *             example: { success: true, data: { id: uuid, numeroBcf: BCF-2025-06-0015 } }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

/**
 * @swagger
 * /achats/bons-commande/{id}/envoyer:
 *   patch:
 *     tags: [🛒 Achats]
 *     summary: Envoyer le BCF au fournisseur par email
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: BCF envoyé
 *         content:
 *           application/json:
 *             example: { success: true, message: Bon de commande envoyé au fournisseur par email }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /achats/bons-commande/{id}/reception:
 *   post:
 *     tags: [🛒 Achats]
 *     summary: Enregistrer une réception de marchandises
 *     description: Met à jour le stock automatiquement via trigger MySQL
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lignes]
 *             properties:
 *               notes: { type: string }
 *               lignes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [idLigneBcf, quantiteRecue]
 *                   properties:
 *                     idLigneBcf:    { type: string, format: uuid }
 *                     quantiteRecue: { type: integer, example: 18 }
 *                     conforme:      { type: boolean, default: true }
 *                     observation:   { type: string }
 *     responses:
 *       200:
 *         description: Réception enregistrée et stock mis à jour
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Réception enregistrée. Stock mis à jour pour 3 produits.
 *               data: { statut: RECU_PARTIEL, produitsRecus: 3 }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// ─────────────────────────────────────────────────────────────
// MODULE VENTES
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /ventes/devis:
 *   get:
 *     tags: [💼 Ventes]
 *     summary: Liste des devis
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/searchParam'
 *       - name: statut
 *         in: query
 *         schema: { type: string, enum: [BROUILLON, ENVOYE, ACCEPTE, REFUSE, EXPIRE, CONVERTI] }
 *       - name: idClient
 *         in: query
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Liste paginée des devis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Devis' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 *   post:
 *     tags: [💼 Ventes]
 *     summary: Créer un devis
 *     description: Le numéro de devis est généré automatiquement (DEV-YYYY-MM-XXXX)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateDevisInput' }
 *     responses:
 *       201:
 *         description: Devis créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Devis' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

/**
 * @swagger
 * /ventes/devis/{id}/envoyer:
 *   patch:
 *     tags: [💼 Ventes]
 *     summary: Envoyer le devis au client par email
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Devis envoyé
 *         content:
 *           application/json:
 *             example: { success: true, message: Devis envoyé au client par email }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /ventes/devis/{id}/convertir:
 *   post:
 *     tags: [💼 Ventes]
 *     summary: Convertir un devis en bon de commande
 *     description: Vérifie le stock disponible. En cas de rupture, propose une commande partielle.
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       201:
 *         description: Bon de commande créé
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Devis converti en commande
 *               data: { id: uuid, numeroBcc: BCC-2025-06-0022 }
 *       409:
 *         description: Stock insuffisant
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 code: STOCK_INSUFFISANT
 *                 message: Stock insuffisant pour 2 produits
 *                 details:
 *                   - produit: Laptop HP ProBook
 *                     disponible: 3
 *                     demande: 5
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /ventes/commandes:
 *   get:
 *     tags: [💼 Ventes]
 *     summary: Liste des bons de commande clients
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - name: statut
 *         in: query
 *         schema: { type: string, enum: [EN_ATTENTE, CONFIRME, EN_PREPARATION, EXPEDIE, LIVRE, ANNULE] }
 *       - name: idClient
 *         in: query
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Liste des commandes clients }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 *   post:
 *     tags: [💼 Ventes]
 *     summary: Créer une commande client directe (sans devis)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateBCCInput' }
 *     responses:
 *       201: { description: Commande créée }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

/**
 * @swagger
 * /ventes/commandes/{id}/livraison:
 *   post:
 *     tags: [💼 Ventes]
 *     summary: Générer un bon de livraison
 *     description: Crée le BL et décrémente le stock automatiquement via trigger MySQL
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lignes]
 *             properties:
 *               notes: { type: string }
 *               lignes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [idLigneBcc, quantiteLivree]
 *                   properties:
 *                     idLigneBcc:     { type: string, format: uuid }
 *                     quantiteLivree: { type: integer, example: 2 }
 *     responses:
 *       201:
 *         description: Bon de livraison créé et stock mis à jour
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Bon de livraison créé. Stock mis à jour.
 *               data: { id: uuid, numeroBl: BL-2025-06-0031 }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
