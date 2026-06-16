// ============================================================
// backend/src/config/swagger.js
// Configuration Swagger / OpenAPI 3.0
// ERP Intelligent — MySQL / WAMP
// ============================================================

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'ERP Intelligent — API REST',
      version:     '1.0.0',
      description: `
## API REST de l'ERP Intelligent

Cette API permet de gérer l'ensemble des opérations commerciales :
utilisateurs, catalogue, stocks, achats, ventes, facturation,
paiements, notifications et intelligence artificielle.

### Authentification
Toutes les routes (sauf \`/auth/login\`) nécessitent un token JWT.

\`\`\`
Authorization: Bearer <votre_access_token>
\`\`\`

### Format des réponses
Toutes les réponses suivent ce format uniforme :
\`\`\`json
{ "success": true, "data": {...}, "message": "...", "meta": {...} }
\`\`\`

### Codes d'erreur métier
| Code | Signification |
|------|---------------|
| VALIDATION_ERROR | Données invalides |
| UNAUTHORIZED | Token manquant ou invalide |
| FORBIDDEN | Permission insuffisante |
| NOT_FOUND | Ressource introuvable |
| DUPLICATE_ENTRY | Doublon détecté |
| STOCK_INSUFFISANT | Stock insuffisant |
| BUSINESS_RULE_VIOLATION | Règle métier non respectée |
      `,
      contact: {
        name:  'Équipe ERP Intelligent',
        email: 'admin@erp.local',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url:         'http://localhost:3000/api/v1',
        description: 'Serveur de développement (WAMP)',
      },
      {
        url:         'https://erp.votre-domaine.com/api/v1',
        description: 'Serveur de production',
      },
    ],

    // ── Composants réutilisables ───────────────────────────
    components: {

      // ── Schémas de sécurité ──────────────────────────────
      securitySchemes: {
        BearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
          description:  'Token JWT obtenu via POST /auth/login',
        },
      },

      // ── Schémas de données réutilisables ─────────────────
      schemas: {

        // ── Réponses génériques ────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string',  example: 'Opération réussie' },
            data:    { type: 'object' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total:      { type: 'integer', example: 150 },
            page:       { type: 'integer', example: 1   },
            limit:      { type: 'integer', example: 20  },
            totalPages: { type: 'integer', example: 8   },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code:    { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Données invalides' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },

        // ── Auth ───────────────────────────────────────────
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'admin@erp.local' },
            password: { type: 'string', minLength: 8,    example: 'MonMotDePasse1!' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            accessToken:  { type: 'string', description: 'JWT valide 24h'  },
            refreshToken: { type: 'string', description: 'Token valide 7j' },
            user: { $ref: '#/components/schemas/UtilisateurProfil' },
          },
        },

        // ── Utilisateur ────────────────────────────────────
        UtilisateurProfil: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            nom:       { type: 'string', example: 'Dupont'  },
            prenom:    { type: 'string', example: 'Jean'    },
            email:     { type: 'string', example: 'jean.dupont@erp.local' },
            telephone: { type: 'string', example: '+237 6XX XXX XXX' },
            avatar:    { type: 'string', nullable: true },
            statut:    { type: 'string', enum: ['ACTIF','INACTIF','BLOQUE'] },
            role: {
              type: 'object',
              properties: {
                id:      { type: 'string' },
                nomRole: { type: 'string', example: 'COMMERCIAL' },
              },
            },
          },
        },
        CreateUtilisateurInput: {
          type: 'object',
          required: ['nom','prenom','email','idRole'],
          properties: {
            nom:       { type: 'string', example: 'Dupont' },
            prenom:    { type: 'string', example: 'Jean'   },
            email:     { type: 'string', format: 'email'   },
            telephone: { type: 'string', example: '+237 6XX XXX XXX' },
            idRole:    { type: 'string', format: 'uuid' },
          },
        },

        // ── Produit ────────────────────────────────────────
        Produit: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            reference:    { type: 'string', example: 'PRD-2025-001'   },
            designation:  { type: 'string', example: 'Laptop HP ProBook' },
            description:  { type: 'string', nullable: true },
            uniteMesure:  { type: 'string', enum: ['PIECE','KG','LITRE','METRE','M2','BOITE','CARTON'] },
            prixAchatHt:  { type: 'number', format: 'decimal', example: 350000 },
            prixVenteHt:  { type: 'number', format: 'decimal', example: 450000 },
            tauxTva:      { type: 'number', example: 19.25 },
            stockMinimum: { type: 'integer', example: 5 },
            statut:       { type: 'string', enum: ['ACTIF','INACTIF','ARCHIVE'] },
            categorie: {
              type: 'object',
              properties: {
                id:  { type: 'string' },
                nom: { type: 'string', example: 'Informatique' },
              },
            },
            stock: {
              type: 'object',
              properties: {
                stockActuel:    { type: 'integer', example: 42 },
                stockReserve:   { type: 'integer', example: 5  },
                stockDisponible: { type: 'integer', example: 37 },
              },
            },
          },
        },
        CreateProduitInput: {
          type: 'object',
          required: ['designation','uniteMesure','prixAchatHt','prixVenteHt','idCategorie'],
          properties: {
            designation:  { type: 'string', example: 'Laptop HP ProBook' },
            description:  { type: 'string' },
            uniteMesure:  { type: 'string', enum: ['PIECE','KG','LITRE','METRE','M2','BOITE','CARTON'] },
            prixAchatHt:  { type: 'number', example: 350000 },
            prixVenteHt:  { type: 'number', example: 450000 },
            tauxTva:      { type: 'number', example: 19.25  },
            stockMinimum: { type: 'integer', example: 5 },
            stockInitial: { type: 'integer', example: 10 },
            idCategorie:  { type: 'string', format: 'uuid' },
          },
        },

        // ── Client ─────────────────────────────────────────
        Client: {
          type: 'object',
          properties: {
            id:                 { type: 'string', format: 'uuid' },
            codeClient:         { type: 'string', example: 'CLI-0042' },
            type:               { type: 'string', enum: ['PARTICULIER','ENTREPRISE'] },
            nom:                { type: 'string', example: 'Société ACME' },
            email:              { type: 'string', example: 'contact@acme.cm' },
            telephone:          { type: 'string', example: '+237 6XX XXX XXX' },
            adresse:            { type: 'string' },
            ville:              { type: 'string', example: 'Douala' },
            pays:               { type: 'string', example: 'Cameroun' },
            plafondCredit:      { type: 'number', example: 5000000 },
            delaiPaiement:      { type: 'integer', example: 30 },
            statut:             { type: 'string', enum: ['ACTIF','INACTIF','BLOQUE'] },
          },
        },
        CreateClientInput: {
          type: 'object',
          required: ['type','nom','email','telephone','adresse','ville'],
          properties: {
            type:               { type: 'string', enum: ['PARTICULIER','ENTREPRISE'] },
            nom:                { type: 'string', example: 'Société ACME' },
            email:              { type: 'string', format: 'email' },
            telephone:          { type: 'string' },
            adresse:            { type: 'string' },
            ville:              { type: 'string' },
            pays:               { type: 'string', example: 'Cameroun' },
            numeroFiscal:       { type: 'string' },
            plafondCredit:      { type: 'number', example: 0 },
            modePaiementDefaut: { type: 'string', enum: ['ESPECES','CHEQUE','VIREMENT','MOBILE_MONEY','CARTE'] },
            delaiPaiement:      { type: 'integer', example: 30 },
          },
        },

        // ── Fournisseur ────────────────────────────────────
        Fournisseur: {
          type: 'object',
          properties: {
            id:                  { type: 'string', format: 'uuid' },
            codeFournisseur:     { type: 'string', example: 'FOUR-0007' },
            raisonSociale:       { type: 'string', example: 'Distributeur Global SARL' },
            email:               { type: 'string', example: 'contact@distrib.cm' },
            telephone:           { type: 'string' },
            adresse:             { type: 'string' },
            ville:               { type: 'string' },
            pays:                { type: 'string' },
            delaiLivraisonMoyen: { type: 'integer', example: 7 },
            statut:              { type: 'string', enum: ['ACTIF','INACTIF'] },
          },
        },

        // ── Stock ──────────────────────────────────────────
        StockDetail: {
          type: 'object',
          properties: {
            id:              { type: 'string' },
            reference:       { type: 'string', example: 'PRD-2025-001' },
            designation:     { type: 'string', example: 'Laptop HP ProBook' },
            categorie:       { type: 'string', example: 'Informatique' },
            stockActuel:     { type: 'integer', example: 42 },
            stockReserve:    { type: 'integer', example: 5  },
            stockDisponible: { type: 'integer', example: 37 },
            stockMinimum:    { type: 'integer', example: 5  },
            statutStock:     { type: 'string', enum: ['OK','ALERTE','RUPTURE'] },
            valeurStock:     { type: 'number', example: 14700000 },
          },
        },
        AjustementStockInput: {
          type: 'object',
          required: ['idProduit','quantite','type','motif'],
          properties: {
            idProduit: { type: 'string', format: 'uuid' },
            quantite:  { type: 'integer', example: 10 },
            type:      { type: 'string', enum: ['AJUSTEMENT_POS','AJUSTEMENT_NEG'] },
            motif:     { type: 'string', example: 'Correction suite inventaire' },
          },
        },

        // ── Devis ──────────────────────────────────────────
        LigneDocumentInput: {
          type: 'object',
          required: ['idProduit','quantite','prixUnitaireHt','tauxTva'],
          properties: {
            idProduit:      { type: 'string', format: 'uuid' },
            designation:    { type: 'string', example: 'Laptop HP ProBook' },
            quantite:       { type: 'integer', example: 2 },
            prixUnitaireHt: { type: 'number',  example: 450000 },
            remise:         { type: 'number',  example: 5, description: 'Remise en %' },
            tauxTva:        { type: 'number',  example: 19.25 },
          },
        },
        CreateDevisInput: {
          type: 'object',
          required: ['idClient','dateValidite','lignes'],
          properties: {
            idClient:     { type: 'string', format: 'uuid' },
            dateValidite: { type: 'string', format: 'date', example: '2025-07-30' },
            conditions:   { type: 'string' },
            lignes:       { type: 'array', items: { $ref: '#/components/schemas/LigneDocumentInput' } },
          },
        },
        Devis: {
          type: 'object',
          properties: {
            id:           { type: 'string' },
            numeroDevis:  { type: 'string', example: 'DEV-2025-06-0008' },
            client:       { $ref: '#/components/schemas/Client' },
            dateDevis:    { type: 'string', format: 'date' },
            dateValidite: { type: 'string', format: 'date' },
            statut:       { type: 'string', enum: ['BROUILLON','ENVOYE','ACCEPTE','REFUSE','EXPIRE','CONVERTI'] },
            totalHt:      { type: 'number' },
            totalTva:     { type: 'number' },
            totalTtc:     { type: 'number' },
            lignes:       { type: 'array', items: { type: 'object' } },
          },
        },

        // ── Bon de Commande Client ─────────────────────────
        CreateBCCInput: {
          type: 'object',
          required: ['idClient','lignes'],
          properties: {
            idClient:            { type: 'string', format: 'uuid' },
            idDevis:             { type: 'string', format: 'uuid', nullable: true },
            dateLivraisonPrevue: { type: 'string', format: 'date' },
            lignes:              { type: 'array', items: { $ref: '#/components/schemas/LigneDocumentInput' } },
          },
        },

        // ── Bon Commande Fournisseur ───────────────────────
        CreateBCFInput: {
          type: 'object',
          required: ['idFournisseur','lignes'],
          properties: {
            idFournisseur:       { type: 'string', format: 'uuid' },
            idDa:                { type: 'string', format: 'uuid', nullable: true },
            dateLivraisonPrevue: { type: 'string', format: 'date' },
            notes:               { type: 'string' },
            lignes: {
              type: 'array',
              items: {
                type: 'object',
                required: ['idProduit','quantiteCommandee','prixUnitaireHt'],
                properties: {
                  idProduit:         { type: 'string', format: 'uuid' },
                  quantiteCommandee: { type: 'integer', example: 20 },
                  prixUnitaireHt:    { type: 'number',  example: 350000 },
                  remise:            { type: 'number',  example: 2 },
                },
              },
            },
          },
        },

        // ── Facture ────────────────────────────────────────
        Facture: {
          type: 'object',
          properties: {
            id:             { type: 'string' },
            numeroFacture:  { type: 'string', example: 'FAC-2025-06-0042' },
            typeFacture:    { type: 'string', enum: ['VENTE','ACHAT'] },
            dateEmission:   { type: 'string', format: 'date' },
            dateEcheance:   { type: 'string', format: 'date' },
            statut:         { type: 'string', enum: ['BROUILLON','EMISE','PARTIELLEMENT_PAYEE','SOLDEE','ANNULEE','EN_RETARD'] },
            totalHt:        { type: 'number', example: 900000 },
            totalTva:       { type: 'number', example: 173250 },
            totalTtc:       { type: 'number', example: 1073250 },
            montantPaye:    { type: 'number', example: 500000 },
            soldeRestant:   { type: 'number', example: 573250 },
          },
        },
        CreateFactureInput: {
          type: 'object',
          required: ['idBl'],
          properties: {
            idBl:           { type: 'string', format: 'uuid' },
            dateEcheance:   { type: 'string', format: 'date' },
            mentionsLegales: { type: 'string' },
          },
        },

        // ── Paiement ───────────────────────────────────────
        CreatePaiementInput: {
          type: 'object',
          required: ['idFacture','montant','modePaiement'],
          properties: {
            idFacture:    { type: 'string', format: 'uuid' },
            montant:      { type: 'number', example: 500000 },
            datePaiement: { type: 'string', format: 'date' },
            modePaiement: { type: 'string', enum: ['ESPECES','CHEQUE','VIREMENT','MOBILE_MONEY','CARTE','COMPENSATION'] },
            reference:    { type: 'string', example: 'VIR-20250601-001' },
            notes:        { type: 'string' },
          },
        },

        // ── Dashboard KPIs ─────────────────────────────────
        KPIs: {
          type: 'object',
          properties: {
            caMoisCourant:    { type: 'number',  example: 15240000 },
            commandesEnCours: { type: 'integer', example: 12       },
            valeurStockTotal: { type: 'number',  example: 45000000 },
            produitsEnAlerte: { type: 'integer', example: 3        },
            totalCreances:    { type: 'number',  example: 8500000  },
          },
        },

        // ── IA ─────────────────────────────────────────────
        ChatInput: {
          type: 'object',
          required: ['message'],
          properties: {
            message:        { type: 'string', example: 'Quelles sont les ventes de ce mois ?' },
            idConversation: { type: 'string', format: 'uuid', nullable: true },
          },
        },
        ChatResponse: {
          type: 'object',
          properties: {
            reponse:        { type: 'string', example: 'Ce mois-ci, votre CA s\'élève à 15 240 000 FCFA...' },
            idConversation: { type: 'string', format: 'uuid' },
            donnees:        { type: 'object', nullable: true },
          },
        },
      },

      // ── Paramètres réutilisables ───────────────────────────
      parameters: {
        idParam: {
          name:        'id',
          in:          'path',
          required:    true,
          description: 'Identifiant UUID de la ressource',
          schema:      { type: 'string', format: 'uuid' },
        },
        pageParam: {
          name:        'page',
          in:          'query',
          description: 'Numéro de page (défaut : 1)',
          schema:      { type: 'integer', default: 1 },
        },
        limitParam: {
          name:        'limit',
          in:          'query',
          description: 'Nombre d\'éléments par page (défaut : 20, max : 100)',
          schema:      { type: 'integer', default: 20, maximum: 100 },
        },
        searchParam: {
          name:        'search',
          in:          'query',
          description: 'Recherche textuelle',
          schema:      { type: 'string' },
        },
      },

      // ── Réponses réutilisables ─────────────────────────────
      responses: {
        Unauthorized: {
          description: 'Token JWT manquant ou invalide',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, error: { code: 'UNAUTHORIZED', message: 'Token JWT manquant' } },
            },
          },
        },
        Forbidden: {
          description: 'Permission insuffisante',
          content: {
            'application/json': {
              schema:  { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, error: { code: 'FORBIDDEN', message: 'Permission requise : produits:creer' } },
            },
          },
        },
        NotFound: {
          description: 'Ressource introuvable',
          content: {
            'application/json': {
              schema:  { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, error: { code: 'NOT_FOUND', message: 'Ressource introuvable' } },
            },
          },
        },
        ValidationError: {
          description: 'Données invalides',
          content: {
            'application/json': {
              schema:  { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: {
                  code:    'VALIDATION_ERROR',
                  message: 'Données invalides',
                  details: [{ field: 'email', message: 'Format email invalide' }],
                },
              },
            },
          },
        },
      },
    },

    // ── Sécurité globale (toutes les routes sauf /auth/login) ──
    security: [{ BearerAuth: [] }],

    // ── Tags (groupes de routes dans Swagger UI) ───────────────
    tags: [
      { name: '🔐 Auth',          description: 'Authentification et sessions' },
      { name: '👤 Utilisateurs',  description: 'Gestion des comptes utilisateurs' },
      { name: '🔑 Rôles',         description: 'Rôles et permissions RBAC' },
      { name: '📂 Catégories',    description: 'Catégories et sous-catégories produits' },
      { name: '📦 Produits',      description: 'Catalogue produits' },
      { name: '👥 Clients',       description: 'Fichier clients' },
      { name: '🏭 Fournisseurs',  description: 'Fichier fournisseurs' },
      { name: '🏬 Stocks',        description: 'Gestion des stocks et inventaires' },
      { name: '🛒 Achats',        description: 'Circuit d\'achat (DA → BCF → Réception)' },
      { name: '💼 Ventes',        description: 'Circuit de vente (Devis → BCC → BL)' },
      { name: '🧾 Factures',      description: 'Facturation et avoirs' },
      { name: '💳 Paiements',     description: 'Enregistrement des paiements' },
      { name: '🔔 Notifications', description: 'Centre de notifications' },
      { name: '📊 Dashboard',     description: 'Tableau de bord et KPIs' },
      { name: '📈 Rapports',      description: 'Rapports et exports Excel/PDF' },
      { name: '🤖 IA',            description: 'Intelligence artificielle (prévisions, chatbot, rapports auto)' },
    ],
  },

  // Fichiers contenant les annotations @swagger.
  // Les fichiers *.docs.js documentent les routes avant leur implémentation.
  apis: ['./src/docs/openapi/**/*.docs.js', './src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'ERP Intelligent — API Docs',
      customCss: `
        .swagger-ui .topbar { background-color: #1a3a5c; }
        .swagger-ui .topbar-wrapper img { content: url(''); }
        .swagger-ui .topbar-wrapper::after {
          content: 'ERP Intelligent — API REST v1.0';
          color: white;
          font-size: 18px;
          font-weight: bold;
          margin-left: 10px;
        }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      },
    })
  );

  // Endpoint pour récupérer le JSON Swagger
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📖 Swagger UI : http://localhost:${process.env.PORT || 3000}/api-docs`);
};

export { setupSwagger, swaggerSpec };
