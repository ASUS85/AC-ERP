// ============================================================
// SWAGGER ANNOTATIONS — Auth & Utilisateurs
// À placer dans : backend/modules/auth/auth.routes.js
//                 backend/modules/users/users.routes.js
// ============================================================

// ─────────────────────────────────────────────────────────────
// MODULE AUTH
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [🔐 Auth]
 *     summary: Connexion utilisateur
 *     description: Authentifie un utilisateur et retourne un token JWT access + refresh
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Identifiants incorrects
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: { code: UNAUTHORIZED, message: Identifiants invalides }
 *       403:
 *         description: Compte bloqué
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: { code: ACCOUNT_LOCKED, message: Compte bloqué pendant 30 minutes }
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [🔐 Auth]
 *     summary: Renouveler l'access token
 *     description: Utilise le refresh token pour obtenir un nouvel access token sans se reconnecter
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de renouvellement obtenu lors du login
 *     responses:
 *       200:
 *         description: Nouveau token généré
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data: { accessToken: eyJhbGciOiJIUzI1NiJ9... }
 *       401:
 *         description: Refresh token invalide ou expiré
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [🔐 Auth]
 *     summary: Déconnexion
 *     description: Révoque le refresh token et invalide la session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Déconnexion réussie
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [🔐 Auth]
 *     summary: Profil de l'utilisateur connecté
 *     description: Retourne les informations complètes de l'utilisateur connecté avec ses permissions
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/UtilisateurProfil'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     tags: [🔐 Auth]
 *     summary: Changer son mot de passe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ancienPassword, nouveauPassword]
 *             properties:
 *               ancienPassword:  { type: string, example: AncienMDP1! }
 *               nouveauPassword: { type: string, example: NouveauMDP2@ }
 *     responses:
 *       200:
 *         description: Mot de passe modifié avec succès
 *         content:
 *           application/json:
 *             example: { success: true, message: Mot de passe modifié }
 *       400:
 *         description: Ancien mot de passe incorrect
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

// ─────────────────────────────────────────────────────────────
// MODULE UTILISATEURS
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /utilisateurs:
 *   get:
 *     tags: [👤 Utilisateurs]
 *     summary: Liste des utilisateurs
 *     description: Retourne la liste paginée de tous les utilisateurs du système
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/searchParam'
 *       - name: statut
 *         in: query
 *         schema: { type: string, enum: [ACTIF, INACTIF, BLOQUE] }
 *       - name: idRole
 *         in: query
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Liste paginée des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/UtilisateurProfil' }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *
 *   post:
 *     tags: [👤 Utilisateurs]
 *     summary: Créer un utilisateur
 *     description: Crée un nouveau compte utilisateur et envoie un email d'invitation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUtilisateurInput'
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Utilisateur créé. Email d'invitation envoyé.
 *               data: { id: uuid, email: jean.dupont@erp.local }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409:
 *         description: Email déjà utilisé
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: { code: DUPLICATE_ENTRY, message: Email déjà utilisé }
 */

/**
 * @swagger
 * /utilisateurs/{id}:
 *   get:
 *     tags: [👤 Utilisateurs]
 *     summary: Détail d'un utilisateur
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Détail utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/UtilisateurProfil' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 *   put:
 *     tags: [👤 Utilisateurs]
 *     summary: Modifier un utilisateur
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUtilisateurInput'
 *     responses:
 *       200:
 *         description: Utilisateur modifié
 *         content:
 *           application/json:
 *             example: { success: true, message: Utilisateur mis à jour }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 *   delete:
 *     tags: [👤 Utilisateurs]
 *     summary: Désactiver un utilisateur
 *     description: Désactive le compte (ne supprime pas les données pour préserver l'historique)
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Utilisateur désactivé
 *         content:
 *           application/json:
 *             example: { success: true, message: Utilisateur désactivé }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /utilisateurs/{id}/debloquer:
 *   patch:
 *     tags: [👤 Utilisateurs]
 *     summary: Débloquer un compte utilisateur
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Compte débloqué
 *         content:
 *           application/json:
 *             example: { success: true, message: Compte débloqué avec succès }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
