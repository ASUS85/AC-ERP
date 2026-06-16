// ============================================================
// SWAGGER ANNOTATIONS — Factures, Paiements, Dashboard, Rapports, IA
// ============================================================

// ─────────────────────────────────────────────────────────────
// MODULE FACTURES
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /factures:
 *   get:
 *     tags: [🧾 Factures]
 *     summary: Liste des factures
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - name: type
 *         in: query
 *         description: Type de facture
 *         schema: { type: string, enum: [VENTE, ACHAT] }
 *       - name: statut
 *         in: query
 *         schema: { type: string, enum: [BROUILLON, EMISE, PARTIELLEMENT_PAYEE, SOLDEE, ANNULEE, EN_RETARD] }
 *       - name: idClient
 *         in: query
 *         schema: { type: string, format: uuid }
 *       - name: dateDebut
 *         in: query
 *         schema: { type: string, format: date }
 *       - name: dateFin
 *         in: query
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Liste paginée des factures
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Facture' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 *   post:
 *     tags: [🧾 Factures]
 *     summary: Générer une facture depuis un bon de livraison
 *     description: Le numéro de facture est généré automatiquement (FAC-YYYY-MM-XXXX)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateFactureInput' }
 *     responses:
 *       201:
 *         description: Facture générée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Facture' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

/**
 * @swagger
 * /factures/{id}:
 *   get:
 *     tags: [🧾 Factures]
 *     summary: Détail d'une facture
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Détail complet de la facture avec ses lignes et paiements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Facture' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /factures/{id}/pdf:
 *   get:
 *     tags: [🧾 Factures]
 *     summary: Télécharger la facture en PDF
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Fichier PDF de la facture
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /factures/{id}/envoyer:
 *   post:
 *     tags: [🧾 Factures]
 *     summary: Envoyer la facture par email au client
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Facture envoyée par email
 *         content:
 *           application/json:
 *             example: { success: true, message: Facture envoyée à contact@acme.cm }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /factures/{id}/avoir:
 *   post:
 *     tags: [🧾 Factures]
 *     summary: Créer un avoir sur une facture
 *     description: Génère une note de crédit pour corriger ou annuler partiellement la facture
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [motif, lignes]
 *             properties:
 *               motif: { type: string, example: Retour marchandise non conforme }
 *               lignes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [idProduit, quantite, prixUnitaireHt, tauxTva]
 *                   properties:
 *                     idProduit:      { type: string, format: uuid }
 *                     designation:   { type: string }
 *                     quantite:      { type: integer, example: 1 }
 *                     prixUnitaireHt: { type: number,  example: 450000 }
 *                     tauxTva:       { type: number,  example: 19.25 }
 *     responses:
 *       201:
 *         description: Avoir créé
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Avoir créé
 *               data: { id: uuid, numeroAvoir: AV-2025-06-0005, totalTtc: 537131.25 }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /factures/impayees:
 *   get:
 *     tags: [🧾 Factures]
 *     summary: Factures impayées avec jours de retard
 *     description: Retourne toutes les factures dont le solde restant est > 0, triées par date d'échéance
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - name: retardMin
 *         in: query
 *         description: Filtrer les factures en retard depuis au moins N jours
 *         schema: { type: integer, example: 0 }
 *     responses:
 *       200:
 *         description: Liste des factures impayées
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - numeroFacture: FAC-2025-05-0031
 *                   client: Société ACME
 *                   totalTtc: 1073250
 *                   montantPaye: 500000
 *                   soldeRestant: 573250
 *                   dateEcheance: 2025-06-01
 *                   joursRetard: 14
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

// ─────────────────────────────────────────────────────────────
// MODULE PAIEMENTS
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /paiements:
 *   get:
 *     tags: [💳 Paiements]
 *     summary: Liste des paiements
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - name: idFacture
 *         in: query
 *         schema: { type: string, format: uuid }
 *       - name: modePaiement
 *         in: query
 *         schema: { type: string, enum: [ESPECES, CHEQUE, VIREMENT, MOBILE_MONEY, CARTE, COMPENSATION] }
 *       - name: dateDebut
 *         in: query
 *         schema: { type: string, format: date }
 *       - name: dateFin
 *         in: query
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Liste des paiements
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: uuid
 *                   numeroFacture: FAC-2025-06-0042
 *                   montant: 500000
 *                   modePaiement: VIREMENT
 *                   reference: VIR-20250601-001
 *                   datePaiement: 2025-06-01
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 *   post:
 *     tags: [💳 Paiements]
 *     summary: Enregistrer un paiement
 *     description: Enregistre un paiement et met à jour automatiquement le statut de la facture
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreatePaiementInput' }
 *     responses:
 *       201:
 *         description: Paiement enregistré
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Paiement enregistré. Facture partiellement payée.
 *               data:
 *                 id: uuid
 *                 montant: 500000
 *                 statutFacture: PARTIELLEMENT_PAYEE
 *                 soldeRestant: 573250
 *       400:
 *         description: Montant dépasse le solde restant
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: { code: BUSINESS_RULE_VIOLATION, message: Le montant dépasse le solde restant de la facture }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

// ─────────────────────────────────────────────────────────────
// MODULE NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [🔔 Notifications]
 *     summary: Notifications de l'utilisateur connecté
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - name: isLue
 *         in: query
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Liste des notifications
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: uuid
 *                   typeNotif: ALERTE_STOCK
 *                   titre: Stock bas — Laptop HP ProBook
 *                   message: Le stock du produit PRD-001 est tombé à 3 unités (seuil minimum = 5)
 *                   isLue: false
 *                   createdAt: 2025-06-15T10:30:00Z
 *               meta: { total: 8, nonLues: 3 }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

/**
 * @swagger
 * /notifications/{id}/lire:
 *   patch:
 *     tags: [🔔 Notifications]
 *     summary: Marquer une notification comme lue
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *         content:
 *           application/json:
 *             example: { success: true, message: Notification marquée comme lue }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

/**
 * @swagger
 * /notifications/tout-lire:
 *   patch:
 *     tags: [🔔 Notifications]
 *     summary: Marquer toutes les notifications comme lues
 *     responses:
 *       200:
 *         description: Toutes les notifications marquées comme lues
 *         content:
 *           application/json:
 *             example: { success: true, message: 8 notifications marquées comme lues }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

// ─────────────────────────────────────────────────────────────
// MODULE DASHBOARD
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /dashboard/kpis:
 *   get:
 *     tags: [📊 Dashboard]
 *     summary: Indicateurs clés (KPIs) du tableau de bord
 *     description: Retourne tous les KPIs en temps réel calculés depuis la vue MySQL v_kpis_dashboard
 *     responses:
 *       200:
 *         description: KPIs du tableau de bord
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/KPIs' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

/**
 * @swagger
 * /dashboard/evolution-ventes:
 *   get:
 *     tags: [📊 Dashboard]
 *     summary: Évolution du chiffre d'affaires sur 12 mois
 *     parameters:
 *       - name: annee
 *         in: query
 *         schema: { type: integer, example: 2025 }
 *     responses:
 *       200:
 *         description: CA mensuel sur 12 mois
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - mois: 2025-01
 *                   ca: 12400000
 *                   nbCommandes: 18
 *                 - mois: 2025-02
 *                   ca: 9800000
 *                   nbCommandes: 14
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

/**
 * @swagger
 * /dashboard/top-produits:
 *   get:
 *     tags: [📊 Dashboard]
 *     summary: Top 10 des produits les plus vendus
 *     parameters:
 *       - name: periode
 *         in: query
 *         description: Période d'analyse
 *         schema: { type: string, enum: [semaine, mois, trimestre, annee], default: mois }
 *     responses:
 *       200:
 *         description: Classement des produits
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - rang: 1
 *                   produit: Laptop HP ProBook
 *                   reference: PRD-2025-001
 *                   quantiteVendue: 42
 *                   ca: 18900000
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

/**
 * @swagger
 * /dashboard/top-clients:
 *   get:
 *     tags: [📊 Dashboard]
 *     summary: Top 10 des meilleurs clients
 *     parameters:
 *       - name: periode
 *         in: query
 *         schema: { type: string, enum: [semaine, mois, trimestre, annee], default: mois }
 *     responses:
 *       200:
 *         description: Classement des clients
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - rang: 1
 *                   client: Société ACME
 *                   codeClient: CLI-0042
 *                   ca: 5200000
 *                   nbCommandes: 8
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

// ─────────────────────────────────────────────────────────────
// MODULE RAPPORTS
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /rapports/ventes:
 *   get:
 *     tags: [📈 Rapports]
 *     summary: Rapport des ventes
 *     parameters:
 *       - name: dateDebut
 *         in: query
 *         required: true
 *         schema: { type: string, format: date, example: 2025-06-01 }
 *       - name: dateFin
 *         in: query
 *         required: true
 *         schema: { type: string, format: date, example: 2025-06-30 }
 *       - name: format
 *         in: query
 *         schema: { type: string, enum: [json, pdf, excel], default: json }
 *       - name: idClient
 *         in: query
 *         schema: { type: string, format: uuid }
 *       - name: idProduit
 *         in: query
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Rapport des ventes (JSON ou fichier PDF/Excel)
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 periode: { debut: 2025-06-01, fin: 2025-06-30 }
 *                 totalCA: 15240000
 *                 nbFactures: 28
 *                 nbClients: 15
 *                 lignes: []
 *           application/pdf:
 *             schema: { type: string, format: binary }
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema: { type: string, format: binary }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

/**
 * @swagger
 * /rapports/stocks:
 *   get:
 *     tags: [📈 Rapports]
 *     summary: Rapport d'état des stocks et valorisation
 *     parameters:
 *       - name: format
 *         in: query
 *         schema: { type: string, enum: [json, pdf, excel], default: json }
 *       - name: dateReference
 *         in: query
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Rapport stocks avec valorisation
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 dateReference: 2025-06-15
 *                 valeurTotale: 45000000
 *                 nbProduits: 156
 *                 produitsEnAlerte: 3
 *                 produitsEnRupture: 1
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

/**
 * @swagger
 * /rapports/achats:
 *   get:
 *     tags: [📈 Rapports]
 *     summary: Rapport des achats
 *     parameters:
 *       - name: dateDebut
 *         in: query
 *         required: true
 *         schema: { type: string, format: date }
 *       - name: dateFin
 *         in: query
 *         required: true
 *         schema: { type: string, format: date }
 *       - name: format
 *         in: query
 *         schema: { type: string, enum: [json, pdf, excel], default: json }
 *     responses:
 *       200: { description: Rapport des achats }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

/**
 * @swagger
 * /rapports/balance-clients:
 *   get:
 *     tags: [📈 Rapports]
 *     summary: Balance clients (encours et impayés)
 *     parameters:
 *       - name: format
 *         in: query
 *         schema: { type: string, enum: [json, pdf, excel], default: json }
 *     responses:
 *       200:
 *         description: Balance clients
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 totalEncours: 8500000
 *                 totalCreances: 5200000
 *                 clients: []
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

// ─────────────────────────────────────────────────────────────
// MODULE IA
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /ia/previsions-ventes:
 *   get:
 *     tags: [🤖 IA]
 *     summary: Prévisions de ventes par produit
 *     description: Retourne les prévisions calculées automatiquement chaque nuit pour les 4 prochaines semaines
 *     parameters:
 *       - name: idProduit
 *         in: query
 *         schema: { type: string, format: uuid }
 *       - name: horizon
 *         in: query
 *         description: Horizon de prévision en semaines
 *         schema: { type: integer, default: 4, minimum: 1, maximum: 12 }
 *     responses:
 *       200:
 *         description: Prévisions de ventes
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - produit: Laptop HP ProBook
 *                   reference: PRD-2025-001
 *                   previsions:
 *                     - semaine: 2025-W25
 *                       quantitePrevue: 8
 *                       quantiteMin: 5
 *                       quantiteMax: 12
 *                       tendance: HAUSSE
 *                       tauxConfiance: 87.5
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

/**
 * @swagger
 * /ia/alertes-rupture:
 *   get:
 *     tags: [🤖 IA]
 *     summary: Produits à risque de rupture de stock
 *     description: Analyse le stock actuel et la vitesse d'écoulement pour détecter les ruptures imminentes
 *     responses:
 *       200:
 *         description: Produits à risque
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - produit: Laptop HP ProBook
 *                   reference: PRD-2025-001
 *                   stockActuel: 5
 *                   vitesseEcoulement: 2.3
 *                   joursAvantRupture: 2
 *                   qteRecommandee: 25
 *                   statut: CRITIQUE
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

/**
 * @swagger
 * /ia/chat:
 *   post:
 *     tags: [🤖 IA]
 *     summary: Envoyer un message à l'assistant IA
 *     description: |
 *       L'assistant IA peut répondre à des questions sur les données de l'ERP en langage naturel.
 *
 *       **Exemples de questions :**
 *       - "Quel est le stock du produit Laptop HP ?"
 *       - "Combien de ventes avons-nous fait ce mois ?"
 *       - "Quelles factures sont en retard ?"
 *       - "Qui sont nos 5 meilleurs clients ?"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ChatInput' }
 *     responses:
 *       200:
 *         description: Réponse de l'assistant IA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/ChatResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       503:
 *         description: Service IA temporairement indisponible
 *         content:
 *           application/json:
 *             example: { success: false, error: { code: IA_UNAVAILABLE, message: Le service IA est temporairement indisponible } }
 */

/**
 * @swagger
 * /ia/conversations:
 *   get:
 *     tags: [🤖 IA]
 *     summary: Historique des conversations IA de l'utilisateur
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Liste des conversations
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: uuid
 *                   titre: Analyse ventes juin 2025
 *                   nbMessages: 6
 *                   createdAt: 2025-06-15T10:00:00Z
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

/**
 * @swagger
 * /ia/rapport-auto:
 *   post:
 *     tags: [🤖 IA]
 *     summary: Générer un rapport narratif automatique
 *     description: |
 *       L'IA analyse les données de la période et génère un rapport exécutif en langage naturel.
 *       Le rapport est disponible en JSON (texte) et en PDF téléchargeable.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, periode]
 *             properties:
 *               type:    { type: string, enum: [mensuel, trimestriel, annuel, personnalise] }
 *               periode: { type: string, example: 2025-06, description: Format YYYY-MM pour mensuel }
 *     responses:
 *       202:
 *         description: Rapport en cours de génération (tâche asynchrone)
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Rapport en cours de génération. Vous recevrez une notification quand il sera prêt.
 *               data: { jobId: job_abc123 }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */

/**
 * @swagger
 * /ia/rapports:
 *   get:
 *     tags: [🤖 IA]
 *     summary: Liste des rapports IA générés
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Liste des rapports IA
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: uuid
 *                   typeRapport: mensuel
 *                   periode: 2025-06
 *                   fichierPdf: /uploads/rapports/rapport_2025_06.pdf
 *                   createdAt: 2025-07-01T00:05:00Z
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
