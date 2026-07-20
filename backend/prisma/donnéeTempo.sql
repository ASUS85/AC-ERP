-- ==========================================================
-- NETTOYAGE COMPLET
-- ==========================================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE alertes_rupture;
TRUNCATE TABLE previsions_ventes;
TRUNCATE TABLE notifications;
TRUNCATE TABLE paiements;
TRUNCATE TABLE avoirs;
TRUNCATE TABLE lignes_avoir;
TRUNCATE TABLE factures;
TRUNCATE TABLE lignes_facture;
TRUNCATE TABLE bons_livraison;
TRUNCATE TABLE lignes_bl;
TRUNCATE TABLE bons_commande_clients;
TRUNCATE TABLE lignes_bcc;
TRUNCATE TABLE devis;
TRUNCATE TABLE lignes_devis;
TRUNCATE TABLE receptions_marchandises;
TRUNCATE TABLE lignes_reception;
TRUNCATE TABLE bons_commande_fournisseurs;
TRUNCATE TABLE lignes_bcf;
TRUNCATE TABLE demandes_achat;
TRUNCATE TABLE lignes_demande_achat;
TRUNCATE TABLE inventaires;
TRUNCATE TABLE lignes_inventaire;
TRUNCATE TABLE mouvements_stock;
TRUNCATE TABLE stocks;
TRUNCATE TABLE produit_fournisseurs;
TRUNCATE TABLE fournisseurs;
TRUNCATE TABLE clients;
TRUNCATE TABLE produits;
TRUNCATE TABLE categories;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;
TRUNCATE TABLE utilisateurs;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- 1. CATEGORIES (8 racines + 2 sous-categories)
-- Note: categories n a PAS de colonne updated_at
-- ==========================================================

SET @cat_informatique = UUID();
SET @cat_accessoires  = UUID();
SET @cat_mobilier     = UUID();
SET @cat_reseau       = UUID();
SET @cat_consommables = UUID();
SET @cat_impression   = UUID();
SET @cat_securite     = UUID();
SET @cat_eclairage    = UUID();

INSERT INTO categories (id, nom, description, slug, icone, statut, created_at) VALUES
(@cat_informatique, 'Informatique', 'Ordinateurs, composants et peripheriques', 'cat-informatique', 'Monitor', 'ACTIF', NOW()),
(@cat_accessoires,  'Accessoires', 'Claviers, souris, casques et accessoires divers', 'cat-accessoires', 'Headphones', 'ACTIF', NOW()),
(@cat_mobilier,     'Mobilier', 'Mobilier de bureau et rangement', 'cat-mobilier', 'Armchair', 'ACTIF', NOW()),
(@cat_reseau,       'Reseau', 'Routeurs, switchs, cables et equipements reseau', 'cat-reseau', 'Wifi', 'ACTIF', NOW()),
(@cat_consommables, 'Consommables', 'Encre, papier, fournitures de bureau', 'cat-consommables', 'Pen', 'ACTIF', NOW()),
(@cat_impression,   'Impression', 'Imprimantes, photocopieurs et scanners', 'cat-impression', 'Printer', 'ACTIF', NOW()),
(@cat_securite,     'Securite', 'Cameras, alarmes et controle d acces', 'cat-securite', 'Shield', 'ACTIF', NOW()),
(@cat_eclairage,    'Eclairage', 'Eclairage de bureau et lampes', 'cat-eclairage', 'Lightbulb', 'ACTIF', NOW());

-- Sous-categories
SET @cat_ordi      = UUID(); SET @cat_composants = UUID();
SET @cat_claviers  = UUID(); SET @cat_audio     = UUID();
SET @cat_bureaux   = UUID(); SET @cat_sieges    = UUID();
SET @cat_switchs   = UUID(); SET @cat_cables    = UUID();
SET @cat_encre     = UUID(); SET @cat_papier    = UUID();
SET @cat_imprimantes = UUID(); SET @cat_scanners = UUID();
SET @cat_cameras   = UUID(); SET @cat_alarmes   = UUID();
SET @cat_lampes_bureau = UUID(); SET @cat_veilleuses = UUID();

INSERT INTO categories (id, nom, description, slug, id_categorie_parent, statut, created_at) VALUES
(@cat_ordi,      'Ordinateurs',     'PC portables et fixes',       'sous-ordi',     @cat_informatique, 'ACTIF', NOW()),
(@cat_composants,'Composants',      'RAM, SSD, cartes graphiques', 'sous-compos',   @cat_informatique, 'ACTIF', NOW()),
(@cat_claviers,  'Claviers & souris','Claviers mecaniques, souris','sous-claviers', @cat_accessoires,  'ACTIF', NOW()),
(@cat_audio,     'Audio',           'Casques, enceintes, micros',  'sous-audio',    @cat_accessoires,  'ACTIF', NOW()),
(@cat_bureaux,   'Bureaux',         'Bureaux assis-debout, classiques', 'sous-bureaux', @cat_mobilier,   'ACTIF', NOW()),
(@cat_sieges,    'Sieges',          'Fauteuils, chaises ergonomiques','sous-sieges',  @cat_mobilier,     'ACTIF', NOW()),
(@cat_switchs,   'Switchs',         'Switchs maneges et non-manages', 'sous-switchs', @cat_reseau,       'ACTIF', NOW()),
(@cat_cables,    'Cables',          'Cables RJ45, fibre, adaptateurs','sous-cables',  @cat_reseau,       'ACTIF', NOW()),
(@cat_encre,     'Encre & toner',   'Cartouches et toners',        'sous-encre',    @cat_consommables, 'ACTIF', NOW()),
(@cat_papier,    'Papeterie',       'Ramettes, blocs, enveloppes', 'sous-papier',   @cat_consommables, 'ACTIF', NOW()),
(@cat_imprimantes,'Imprimantes',    'Laser, jet d encre, multifonctions', 'sous-imprimantes', @cat_impression, 'ACTIF', NOW()),
(@cat_scanners,  'Scanners',        'Scanners document et photo',  'sous-scanners', @cat_impression,   'ACTIF', NOW()),
(@cat_cameras,   'Cameras',         'Cameras IP et de surveillance','sous-cameras',  @cat_securite,     'ACTIF', NOW()),
(@cat_alarmes,   'Alarmes',         'Alarmes et detecteurs',       'sous-alarmes',  @cat_securite,     'ACTIF', NOW()),
(@cat_lampes_bureau, 'Lampes bureau', 'Lampes LED de bureau',      'sous-lampes',   @cat_eclairage,    'ACTIF', NOW()),
(@cat_veilleuses, 'Veilleuses',     'Lampes de nuit et decoratives','sous-veilleuses',@cat_eclairage,    'ACTIF', NOW());

-- ==========================================================
-- 2. PRODUITS (32 produits)
-- Note: produits a updated_at (champ @updatedAt dans Prisma)
-- ==========================================================
INSERT INTO produits (id, reference, designation, description, unite_mesure, prix_achat_ht, prix_vente_ht, taux_tva, stock_minimum, id_categorie, statut, created_at, updated_at) VALUES
(UUID(), 'PRD-INF-001', 'PC Portable Pro 15 i7 32Go 512Go SSD', 'Ordinateur portable professionnel 15 pouces', 'PIECE', 850000, 1299900, 18.00, 5, @cat_ordi, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-INF-002', 'PC Fixe Bureau Core i5 16Go RAM', 'Ordinateur de bureau complet', 'PIECE', 450000, 699900, 18.00, 5, @cat_ordi, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-INF-003', 'SSD 1To NVMe M.2', 'Disque SSD ultra rapide', 'PIECE', 75000, 129900, 18.00, 10, @cat_composants, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-INF-004', 'Barrette RAM DDR4 16Go', 'Memoire vive 16Go DDR4 3200MHz', 'PIECE', 35000, 54900, 18.00, 10, @cat_composants, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-ACC-001', 'Clavier Mecanique RGB', 'Clavier mecanique retroeclaire RGB', 'PIECE', 25000, 45900, 18.00, 10, @cat_claviers, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-ACC-002', 'Souris Ergonomique Sans Fil', 'Souris verticale sans fil', 'PIECE', 15000, 29900, 18.00, 10, @cat_claviers, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-ACC-003', 'Casque Audio Bluetooth ANC', 'Casque antibruit a reduction active', 'PIECE', 45000, 79900, 18.00, 8, @cat_audio, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-ACC-004', 'Microphone USB Pro', 'Microphone a condensateur pour visio', 'PIECE', 35000, 59900, 18.00, 5, @cat_audio, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-MOB-001', 'Bureau Assis-Debout Electrique', 'Bureau reglable en hauteur motorise', 'PIECE', 280000, 449900, 18.00, 3, @cat_bureaux, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-MOB-002', 'Bureau d angle 140cm', 'Bureau d angle avec rangements', 'PIECE', 150000, 249900, 18.00, 3, @cat_bureaux, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-MOB-003', 'Fauteuil de Bureau Ergonomique', 'Fauteuil haut de gamme reglable', 'PIECE', 200000, 349900, 18.00, 4, @cat_sieges, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-MOB-004', 'Chaise de Bureau Standard', 'Chaise confortable pour poste de travail', 'PIECE', 75000, 129900, 18.00, 8, @cat_sieges, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-RES-001', 'Switch Gigabit 24 Ports', 'Switch manage 24 ports Gigabit', 'PIECE', 120000, 199900, 18.00, 3, @cat_switchs, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-RES-002', 'Switch 8 Ports Bureau', 'Switch non-manage compact', 'PIECE', 25000, 44900, 18.00, 8, @cat_switchs, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-RES-003', 'Cable RJ45 Cat6 3m', 'Cable reseau RJ45 Cat6 blinde', 'PIECE', 2000, 4500, 18.00, 50, @cat_cables, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-RES-004', 'Cable RJ45 Cat6 10m', 'Cable reseau RJ45 Cat6 long', 'PIECE', 5000, 9900, 18.00, 30, @cat_cables, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-CON-001', 'Cartouche Encre Noire HP 305XL', 'Cartouche encre noire haute capacite', 'PIECE', 12000, 22900, 18.00, 15, @cat_encre, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-CON-002', 'Toner Canon 045H', 'Toner noir haute capacite pour Canon', 'PIECE', 35000, 59900, 18.00, 10, @cat_encre, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-CON-003', 'Ramette Papier A4 80g 500f', 'Papier blanc standard', 'BOITE', 4000, 7900, 18.00, 40, @cat_papier, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-CON-004', 'Bloc-Notes A5 100p', 'Bloc-Notes a spirales', 'PIECE', 1000, 2500, 18.00, 60, @cat_papier, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-IMP-001', 'Imprimante Laser Couleur', 'Imprimante laser couleur multifonction', 'PIECE', 250000, 399900, 18.00, 2, @cat_imprimantes, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-IMP-002', 'Imprimante Jet d Encre WiFi', 'Imprimante jet d encre compacte WiFi', 'PIECE', 45000, 79900, 18.00, 4, @cat_imprimantes, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-IMP-003', 'Scanner Document A4', 'Scanner a alimentation automatique', 'PIECE', 80000, 149900, 18.00, 3, @cat_scanners, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-IMP-004', 'Scanner Photo A3', 'Scanner pour photos et documents A3', 'PIECE', 150000, 249900, 18.00, 2, @cat_scanners, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-SEC-001', 'Camera IP Interieure 2K', 'Camera de surveillance interieure HD', 'PIECE', 25000, 49900, 18.00, 8, @cat_cameras, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-SEC-002', 'Kit Cameras Exterieur 4MP', 'Kit 4 cameras exterieures avec NVR', 'PIECE', 180000, 299900, 18.00, 2, @cat_cameras, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-SEC-003', 'Detecteur de Mouvement', 'Detecteur PIR pour alarme', 'PIECE', 8000, 14900, 18.00, 15, @cat_alarmes, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-SEC-004', 'Sirene Interieure 105dB', 'Sirene d alarme interieure', 'PIECE', 5000, 9900, 18.00, 20, @cat_alarmes, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-ECL-001', 'Lampe Bureau LED 12W', 'Lampe LED de bureau reglable', 'PIECE', 12000, 24900, 18.00, 10, @cat_lampes_bureau, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-ECL-002', 'Lampe Bureau Double Bras', 'Lampe LED double bras articule', 'PIECE', 22000, 39900, 18.00, 8, @cat_lampes_bureau, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-ECL-003', 'Veilleuse LED USB', 'Veilleuse decorative a intensite variable', 'PIECE', 3000, 6900, 18.00, 25, @cat_veilleuses, 'ACTIF', NOW(), NOW()),
(UUID(), 'PRD-ECL-004', 'Ruban LED RGB 2m', 'Ruban LED RGB avec telecommande', 'PIECE', 5000, 9900, 18.00, 20, @cat_veilleuses, 'ACTIF', NOW(), NOW());

-- ==========================================================
-- 3. CLIENTS (10 clients)
-- ==========================================================
INSERT INTO clients (id, code_client, type, nom, email, telephone, adresse, ville, pays, plafond_credit, mode_paiement_defaut, delai_paiement, statut, created_at) VALUES
(UUID(), 'CLI-0001', 'ENTREPRISE', 'TechnoPlus SARL', 'contact@technoplus.cm', '+237 699123456', '123 Rue de l Industrie', 'Douala', 'Cameroun', 5000000, 'VIREMENT', 45, 'ACTIF', NOW()),
(UUID(), 'CLI-0002', 'ENTREPRISE', 'Digital Store', 'info@digitalstore.cm', '+237 677987654', '45 Avenue de la Liberte', 'Yaounde', 'Cameroun', 3000000, 'MOBILE_MONEY', 30, 'ACTIF', NOW()),
(UUID(), 'CLI-0003', 'ENTREPRISE', 'Bureau Moderne', 'achats@bureaumoderne.cm', '+237 655112233', '78 Boulevard du Travail', 'Douala', 'Cameroun', 4000000, 'CHEQUE', 60, 'ACTIF', NOW()),
(UUID(), 'CLI-0004', 'ENTREPRISE', 'InfoCorp', 'hello@infocorp.cm', '+237 694445566', '12 Rue de la Technologie', 'Yaounde', 'Cameroun', 2000000, 'VIREMENT', 30, 'ACTIF', NOW()),
(UUID(), 'CLI-0005', 'PARTICULIER', 'ProShop', 'ventes@proshop.cm', '+237 677778899', '56 Rue des Commercants', 'Douala', 'Cameroun', 1000000, 'MOBILE_MONEY', 15, 'ACTIF', NOW()),
(UUID(), 'CLI-0006', 'PARTICULIER', 'Armand Christian', 'armandchristian41@gmail.com', '+237 699000111', '15 Rue de la Paix', 'Douala', 'Cameroun', 1500000, 'MOBILE_MONEY', 30, 'ACTIF', NOW()),
(UUID(), 'CLI-0007', 'ENTREPRISE', 'MediaTech', 'contact@mediatech.cm', '+237 622334455', '89 Rue des Arts', 'Douala', 'Cameroun', 2500000, 'VIREMENT', 45, 'ACTIF', NOW()),
(UUID(), 'CLI-0008', 'PARTICULIER', 'Jean Dupont', 'j.dupont@email.cm', '+237 655667788', '34 Rue Principale', 'Bafoussam', 'Cameroun', 500000, 'ESPECES', 15, 'ACTIF', NOW()),
(UUID(), 'CLI-0009', 'ENTREPRISE', 'Solutions Plus', 'info@solutionsplus.cm', '+237 694556677', '67 Rue des Affaires', 'Douala', 'Cameroun', 3500000, 'VIREMENT', 60, 'ACTIF', NOW()),
(UUID(), 'CLI-0010', 'PARTICULIER', 'Marie Ngono', 'm.ngono@email.cm', '+237 677889900', '23 Rue des Etoiles', 'Yaounde', 'Cameroun', 750000, 'MOBILE_MONEY', 30, 'ACTIF', NOW());

-- ==========================================================
-- 4. FOURNISSEURS (10 fournisseurs)
-- ==========================================================
INSERT INTO fournisseurs (id, code_fournisseur, raison_sociale, email, telephone, adresse, ville, pays, delai_livraison_moyen, conditions_paiement, statut, created_at) VALUES
(UUID(), 'FRS-0001', 'Global Supplies', 'sales@globalsupplies.com', '+237 677000001', '100 Rue du Commerce', 'Douala', 'Cameroun', 7, 'Paiement 30 jours', 'ACTIF', NOW()),
(UUID(), 'FRS-0002', 'ElectroDist', 'pro@electrodist.cm', '+237 677000002', '200 Avenue de l Electronique', 'Yaounde', 'Cameroun', 5, 'Paiement 30 jours', 'ACTIF', NOW()),
(UUID(), 'FRS-0003', 'MegaParts', 'contact@megaparts.eu', '+237 677000003', '150 Rue des Pieces', 'Douala', 'Cameroun', 10, 'Paiement 45 jours', 'ACTIF', NOW()),
(UUID(), 'FRS-0004', 'NordTech', 'info@nordtech.se', '+237 677000004', '75 Boulevard Technique', 'Douala', 'Cameroun', 8, 'Paiement 30 jours', 'ACTIF', NOW()),
(UUID(), 'FRS-0005', 'OfficePro', 'ventes@officepro.cm', '+237 677000005', '50 Rue du Mobilier', 'Yaounde', 'Cameroun', 6, 'Paiement 30 jours', 'ACTIF', NOW()),
(UUID(), 'FRS-0006', 'PrintSolutions', 'commercial@printsolutions.cm', '+237 677000006', '88 Rue de l Impression', 'Douala', 'Cameroun', 4, 'Paiement 15 jours', 'ACTIF', NOW()),
(UUID(), 'FRS-0007', 'SafeGuard', 'info@safeguard.cm', '+237 677000007', '120 Rue de la Securite', 'Yaounde', 'Cameroun', 9, 'Paiement 30 jours', 'ACTIF', NOW()),
(UUID(), 'FRS-0008', 'LightTech', 'contact@lighttech.cm', '+237 677000008', '33 Rue des Lumieres', 'Douala', 'Cameroun', 5, 'Paiement 15 jours', 'ACTIF', NOW()),
(UUID(), 'FRS-0009', 'Cablexpert', 'info@cablexpert.cm', '+237 677000009', '66 Rue des Cables', 'Douala', 'Cameroun', 7, 'Paiement 30 jours', 'ACTIF', NOW()),
(UUID(), 'FRS-0010', 'NetEquip', 'ventes@netequip.cm', '+237 677000010', '99 Rue du Reseau', 'Yaounde', 'Cameroun', 6, 'Paiement 30 jours', 'ACTIF', NOW());

INSERT INTO permissions (id, module, action, description) VALUES
-- Tableau de bord
(UUID(), 'dashboard', 'lire', 'Voir le tableau de bord'),
-- Produits & categories
(UUID(), 'produits', 'creer', 'Créer un produit'),
(UUID(), 'produits', 'lire', 'Lire les produits'),
(UUID(), 'produits', 'modifier', 'Modifier un produit'),
(UUID(), 'produits', 'supprimer', 'Supprimer un produit'),
(UUID(), 'categories', 'creer', 'Créer une catégorie'),
(UUID(), 'categories', 'lire', 'Lire les catégories'),
(UUID(), 'categories', 'modifier', 'Modifier une catégorie'),
(UUID(), 'categories', 'supprimer', 'Supprimer une catégorie'),
-- Tiers (clients & fournisseurs)
(UUID(), 'clients', 'creer', 'Créer un client'),
(UUID(), 'clients', 'lire', 'Lire les clients'),
(UUID(), 'clients', 'modifier', 'Modifier un client'),
(UUID(), 'clients', 'supprimer', 'Supprimer un client'),
(UUID(), 'fournisseurs', 'creer', 'Créer un fournisseur'),
(UUID(), 'fournisseurs', 'lire', 'Lire les fournisseurs'),
(UUID(), 'fournisseurs', 'modifier', 'Modifier un fournisseur'),
(UUID(), 'fournisseurs', 'supprimer', 'Supprimer un fournisseur'),
-- Ventes
(UUID(), 'ventes', 'creer', 'Créer une vente'),
(UUID(), 'ventes', 'lire', 'Lire les ventes'),
(UUID(), 'ventes', 'modifier', 'Modifier une vente'),
(UUID(), 'ventes', 'valider', 'Valider une vente'),
(UUID(), 'ventes', 'livrer', 'Valider une livraison'),
(UUID(), 'devis', 'creer', 'Créer un devis'),
(UUID(), 'devis', 'lire', 'Lire les devis'),
(UUID(), 'devis', 'modifier', 'Modifier un devis'),
(UUID(), 'devis', 'supprimer', 'Supprimer un devis'),
(UUID(), 'livraisons', 'creer', 'Créer un bon de livraison'),
(UUID(), 'livraisons', 'lire', 'Lire les bons de livraison'),
(UUID(), 'livraisons', 'modifier', 'Modifier un bon de livraison'),
-- Achats
(UUID(), 'achats', 'creer', 'Créer une demande d''achat'),
(UUID(), 'achats', 'lire', 'Lire les achats'),
(UUID(), 'achats', 'modifier', 'Modifier un achat'),
(UUID(), 'achats', 'valider', 'Valider un achat'),
(UUID(), 'achats', 'receptionner', 'Receptionner une commande'),
(UUID(), 'commandes_fournisseurs', 'creer', 'Créer une commande fournisseur'),
(UUID(), 'commandes_fournisseurs', 'lire', 'Lire les commandes fournisseur'),
(UUID(), 'commandes_fournisseurs', 'modifier', 'Modifier une commande fournisseur'),
(UUID(), 'receptions', 'creer', 'Créer une réception de marchandise'),
(UUID(), 'receptions', 'lire', 'Lire les réceptions'),
(UUID(), 'receptions', 'valider', 'Valider une réception'),
-- Stock
(UUID(), 'stocks', 'lire', 'Consulter les stocks'),
(UUID(), 'stocks', 'ajuster', 'Ajuster un stock'),
(UUID(), 'stocks', 'inventaire', 'Gérer les inventaires'),
(UUID(), 'mouvements_stock', 'lire', 'Consulter les mouvements de stock'),
(UUID(), 'inventaires', 'creer', 'Créer un inventaire'),
(UUID(), 'inventaires', 'lire', 'Lire les inventaires'),
(UUID(), 'inventaires', 'modifier', 'Modifier un inventaire'),
(UUID(), 'inventaires', 'valider', 'Valider un inventaire'),
-- Facturation & paiements
(UUID(), 'factures', 'creer', 'Créer une facture'),
(UUID(), 'factures', 'lire', 'Lire les factures'),
(UUID(), 'factures', 'modifier', 'Modifier une facture'),
(UUID(), 'factures', 'supprimer', 'Supprimer une facture'),
(UUID(), 'factures', 'avoir', 'Créer un avoir'),
(UUID(), 'factures', 'envoyer', 'Envoyer une facture'),
(UUID(), 'paiements', 'creer', 'Enregistrer un paiement'),
(UUID(), 'paiements', 'lire', 'Lire les paiements'),
-- Administration
(UUID(), 'users', 'creer', 'Créer un utilisateur'),
(UUID(), 'users', 'lire', 'Lire les utilisateurs'),
(UUID(), 'users', 'modifier', 'Modifier un utilisateur'),
(UUID(), 'users', 'supprimer', 'Supprimer un utilisateur'),
(UUID(), 'roles', 'creer', 'Créer un rôle'),
(UUID(), 'roles', 'lire', 'Lire les rôles'),
(UUID(), 'roles', 'modifier', 'Modifier un rôle'),
(UUID(), 'roles', 'supprimer', 'Supprimer un rôle'),
(UUID(), 'permissions', 'lire', 'Lire les permissions'),
-- Rapports & IA
(UUID(), 'rapports', 'lire', 'Lire les rapports'),
(UUID(), 'rapports', 'exporter', 'Exporter un rapport'),
(UUID(), 'ia', 'lire', 'Lire la configuration IA'),
(UUID(), 'ia', 'modifier', 'Modifier la configuration IA'),
(UUID(), 'ia', 'chat', 'Utiliser le chat IA'),
(UUID(), 'ia', 'rapport', 'Generer un rapport IA');

-- ==========================================================
-- 6. ROLES
-- ==========================================================
INSERT INTO roles (id, nom_role, description, is_system_role, created_at) VALUES
(UUID(), 'SUPER_ADMIN', 'Accès total à toutes les fonctionnalités, y compris la configuration système.', true, NOW()),
(UUID(), 'ADMIN', 'Administrateur fonctionnel, gère les utilisateurs et les droits.', false, NOW()),
(UUID(), 'GESTIONNAIRE', 'Gère les opérations commerciales, achats, ventes et stocks.', false, NOW()),
(UUID(), 'COMMERCIAL', 'Gère le cycle de vente (clients, devis, commandes).', false, NOW()),
(UUID(), 'MAGASINIER', 'Gère les stocks, les inventaires et les réceptions.', false, NOW());

-- ==========================================================
-- 7. UTILISATEURS DE TEST
-- ==========================================================
-- On récupère l'ID du rôle SUPER_ADMIN pour créer notre utilisateur de test.
SELECT id INTO @role_super_admin_id FROM roles WHERE nom_role = 'SUPER_ADMIN';
SELECT id INTO @role_admin_id FROM roles WHERE nom_role = 'ADMIN';
SELECT id INTO @role_gestionnaire_id FROM roles WHERE nom_role = 'GESTIONNAIRE';
SELECT id INTO @role_commercial_id FROM roles WHERE nom_role = 'COMMERCIAL';
SELECT id INTO @role_magasinier_id FROM roles WHERE nom_role = 'MAGASINIER';

-- Le mot de passe pour tous les utilisateurs de test est 'Admin@1234'.
-- Le hash est généré avec bcrypt (cost 10).
SET @password_hash = '$2a$12$I5n/FX/JTYp8HzetN7w.4uFaA9QMZGDoD5QVGN0etdbs3gerYjNeO';

-- Utilisateur SUPER_ADMIN (principal pour les opérations du script)
SET @user_id = UUID();
INSERT INTO utilisateurs (id, nom, prenom, email, password_hash, id_role, statut, created_at, updated_at) VALUES
(@user_id, 'Admin', 'Super', 'armandchristian85@gmail.com', @password_hash, @role_super_admin_id, 'ACTIF', NOW(), NOW());

-- Autres utilisateurs
INSERT INTO utilisateurs (id, nom, prenom, email, password_hash, id_role, statut, created_at, updated_at) VALUES
(UUID(), 'Ministrator', 'Ad', 'admin@ac-erp.com', @password_hash, @role_admin_id, 'ACTIF', NOW(), NOW()),
(UUID(), 'Dupont', 'Jean', 'jean.dupont@ac-erp.com', @password_hash, @role_gestionnaire_id, 'ACTIF', NOW(), NOW()),
(UUID(), 'Martin', 'Sophie', 'sophie.martin@ac-erp.com', @password_hash, @role_gestionnaire_id, 'ACTIF', NOW(), NOW()),
(UUID(), 'Bernard', 'Luc', 'luc.bernard@ac-erp.com', @password_hash, @role_commercial_id, 'ACTIF', NOW(), NOW()),
(UUID(), 'Petit', 'Alice', 'alice.petit@ac-erp.com', @password_hash, @role_commercial_id, 'ACTIF', NOW(), NOW()),
(UUID(), 'Leroy', 'Paul', 'paul.leroy@ac-erp.com', @password_hash, @role_magasinier_id, 'ACTIF', NOW(), NOW()),
(UUID(), 'Moreau', 'Juliette', 'juliette.moreau@ac-erp.com', @password_hash, @role_magasinier_id, 'ACTIF', NOW(), NOW());

-- ==========================================================
-- 8. RECUPERATION DES IDs (Produits, Clients, Fournisseurs)
-- ==========================================================
-- Recuperation de quelques produits
SELECT id INTO @prod_pc_pro FROM produits WHERE reference = 'PRD-INF-001';
SELECT id INTO @prod_ssd FROM produits WHERE reference = 'PRD-INF-003';
SELECT id INTO @prod_clavier FROM produits WHERE reference = 'PRD-ACC-001';
SELECT id INTO @prod_casque FROM produits WHERE reference = 'PRD-ACC-003';
SELECT id INTO @prod_bureau FROM produits WHERE reference = 'PRD-MOB-001';
SELECT id INTO @prod_switch FROM produits WHERE reference = 'PRD-RES-001';
SELECT id INTO @prod_papier FROM produits WHERE reference = 'PRD-CON-003';
SELECT id INTO @prod_ram FROM produits WHERE reference = 'PRD-INF-004';

-- Recuperation de quelques clients
SELECT id INTO @client_technoplus FROM clients WHERE code_client = 'CLI-0001';
SELECT id INTO @client_digital FROM clients WHERE code_client = 'CLI-0002';
SELECT id INTO @client_armand FROM clients WHERE code_client = 'CLI-0006';

-- Recuperation de quelques fournisseurs
SELECT id INTO @fournisseur_global FROM fournisseurs WHERE code_fournisseur = 'FRS-0001';
SELECT id INTO @fournisseur_electro FROM fournisseurs WHERE code_fournisseur = 'FRS-0002';

-- ==========================================================
-- 9. PRODUIT_FOURNISSEURS
-- ==========================================================
INSERT INTO produit_fournisseurs (id_produit, id_fournisseur, prix_achat_fournisseur, est_fournisseur_principal) VALUES
(@prod_pc_pro, @fournisseur_global, 845000, true),
(@prod_ssd, @fournisseur_global, 74000, false),
(@prod_clavier, @fournisseur_electro, 24500, true),
(@prod_casque, @fournisseur_electro, 44000, false);

-- ==========================================================
-- 10. STOCKS & MOUVEMENTS INITIAUX
-- ==========================================================
-- Pour chaque produit, on cree une ligne de stock avec une quantite initiale.
-- Note: TRUNCATE TABLE a deja vide les tables stocks et mouvements_stock.
INSERT INTO stocks (id, id_produit, stock_actuel, stock_reserve, created_at, updated_at)
SELECT UUID(), id, 25, 0, NOW(), NOW() FROM produits;

-- On cree un mouvement d'entree initiale pour chaque produit.
INSERT INTO mouvements_stock (id, id_produit, type_mouvement, quantite, stock_avant, stock_apres, motif, id_utilisateur, created_at)
SELECT UUID(), p.id, 'ENTREE_INITIALE', 25, 0, 25, 'Stock de départ', @user_id, NOW() FROM produits p;

-- ==========================================================
-- 11. FLUX DE VENTE COMPLET (Devis -> Commande -> Livraison -> Facture -> Paiement)
-- ==========================================================

-- DEVIS
SET @devis1_id = UUID();
INSERT INTO devis (id, numero_devis, id_client, id_utilisateur, date_devis, date_validite, statut, total_ht, total_tva, total_ttc, created_at) VALUES
(@devis1_id, 'DEV-2024-001', @client_technoplus, @user_id, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 5 DAY, 'ACCEPTE', 1749800, 314964, 2064764, NOW() - INTERVAL 20 DAY);

INSERT INTO lignes_devis (id, id_devis, id_produit, designation, quantite, prix_unitaire_ht, taux_tva, montant_ht, montant_tva, montant_ttc) VALUES
(UUID(), @devis1_id, @prod_pc_pro, 'PC Portable Pro 15 i7 32Go 512Go SSD', 1, 1299900, 18.00, 1299900, 233982, 1533882),
(UUID(), @devis1_id, @prod_bureau, 'Bureau Assis-Debout Electrique', 1, 449900, 18.00, 449900, 80982, 530882);

-- BON DE COMMANDE CLIENT (BCC)
SET @bcc1_id = UUID();
INSERT INTO bons_commande_clients (id, numero_bcc, id_client, id_utilisateur, id_devis, date_commande, statut, total_ht, total_tva, total_ttc, created_at) VALUES
(@bcc1_id, 'BCC-2024-001', @client_technoplus, @user_id, @devis1_id, NOW() - INTERVAL 18 DAY, 'LIVRE', 1749800, 314964, 2064764, NOW() - INTERVAL 18 DAY);

INSERT INTO lignes_bcc (id, id_bcc, id_produit, designation, quantite, prix_unitaire_ht, taux_tva, montant_ht, montant_tva, montant_ttc)
SELECT UUID(), @bcc1_id, id_produit, designation, quantite, prix_unitaire_ht, taux_tva, montant_ht, montant_tva, montant_ttc FROM lignes_devis WHERE id_devis = @devis1_id;

-- BON DE LIVRAISON (BL)
SET @bl1_id = UUID();
INSERT INTO bons_livraison (id, numero_bl, id_bcc, id_utilisateur, date_livraison, statut, created_at) VALUES
(@bl1_id, 'BL-2024-001', @bcc1_id, @user_id, NOW() - INTERVAL 10 DAY, 'LIVRE', NOW() - INTERVAL 10 DAY);

INSERT INTO lignes_bl (id, id_bl, id_ligne_bcc, id_produit, quantite_livree)
SELECT UUID(), @bl1_id, lbcc.id, lbcc.id_produit, lbcc.quantite FROM lignes_bcc lbcc WHERE lbcc.id_bcc = @bcc1_id;

-- MOUVEMENTS DE STOCK (SORTIE VENTE)
UPDATE stocks SET stock_actuel = stock_actuel - 1, updated_at = NOW() WHERE id_produit = @prod_pc_pro;
INSERT INTO mouvements_stock (id, id_produit, type_mouvement, quantite, stock_avant, stock_apres, motif, reference_doc, id_utilisateur, created_at)
VALUES (UUID(), @prod_pc_pro, 'SORTIE_VENTE', 1, 25, 24, 'Vente BL-2024-001', 'BL-2024-001', @user_id, NOW() - INTERVAL 10 DAY);

UPDATE stocks SET stock_actuel = stock_actuel - 1, updated_at = NOW() WHERE id_produit = @prod_bureau;
INSERT INTO mouvements_stock (id, id_produit, type_mouvement, quantite, stock_avant, stock_apres, motif, reference_doc, id_utilisateur, created_at)
VALUES (UUID(), @prod_bureau, 'SORTIE_VENTE', 1, 25, 24, 'Vente BL-2024-001', 'BL-2024-001', @user_id, NOW() - INTERVAL 10 DAY);

-- FACTURE (partiellement payee)
SET @facture1_id = UUID();
INSERT INTO factures (id, numero_facture, type_facture, id_client, id_bl, id_utilisateur, date_emission, date_echeance, statut, total_ht, total_tva, total_ttc, montant_paye, created_at) VALUES
(@facture1_id, 'FAC-2024-001', 'VENTE', @client_technoplus, @bl1_id, @user_id, NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 20 DAY, 'PARTIELLEMENT_PAYEE', 1749800, 314964, 2064764, 1000000, NOW() - INTERVAL 10 DAY);

INSERT INTO lignes_facture (id, id_facture, id_produit, designation, quantite, prix_unitaire_ht, taux_tva, montant_ht, montant_tva, montant_ttc)
SELECT UUID(), @facture1_id, id_produit, designation, quantite, prix_unitaire_ht, taux_tva, montant_ht, montant_tva, montant_ttc FROM lignes_devis WHERE id_devis = @devis1_id;

-- PAIEMENT (partiel)
INSERT INTO paiements (id, id_facture, id_utilisateur, montant, date_paiement, mode_paiement, created_at) VALUES
(UUID(), @facture1_id, @user_id, 1000000, NOW() - INTERVAL 5 DAY, 'VIREMENT', NOW() - INTERVAL 5 DAY);

-- ==========================================================
-- 12. FACTURE DIRECTE (payee) & AVOIR
-- ==========================================================
SET @facture2_id = UUID();
INSERT INTO factures (id, numero_facture, type_facture, id_client, id_utilisateur, date_emission, date_echeance, statut, total_ht, total_tva, total_ttc, montant_paye, created_at) VALUES
(@facture2_id, 'FAC-2024-002', 'VENTE', @client_digital, @user_id, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 5 DAY, 'SOLDEE', 1353900, 243702, 1597602, 1597602, NOW() - INTERVAL 15 DAY);

INSERT INTO lignes_facture (id, id_facture, id_produit, designation, quantite, prix_unitaire_ht, taux_tva, montant_ht, montant_tva, montant_ttc) VALUES
(UUID(), @facture2_id, @prod_clavier, 'Clavier Mecanique RGB', 10, 45900, 18.00, 459000, 82620, 541620),
(UUID(), @facture2_id, @prod_casque, 'Casque Audio Bluetooth ANC', 10, 79900, 18.00, 799000, 143820, 942820),
(UUID(), @facture2_id, @prod_ssd, 'SSD 1To NVMe M.2', 1, 95900, 18.00, 95900, 17262, 113162);

INSERT INTO paiements (id, id_facture, id_utilisateur, montant, date_paiement, mode_paiement, created_at) VALUES
(UUID(), @facture2_id, @user_id, 1597602, NOW() - INTERVAL 14 DAY, 'MOBILE_MONEY', NOW() - INTERVAL 14 DAY);

-- AVOIR sur la facture 2
SET @avoir1_id = UUID();
INSERT INTO avoirs (id, numero_avoir, id_facture, id_utilisateur, date_avoir, motif, total_ht, total_ttc, created_at) VALUES
(@avoir1_id, 'AV-2024-001', @facture2_id, @user_id, NOW() - INTERVAL 2 DAY, 'Retour de 2 claviers défectueux', 91800, 108324, NOW() - INTERVAL 2 DAY);

INSERT INTO lignes_avoir (id, id_avoir, id_produit, designation, quantite, prix_unitaire_ht, taux_tva, montant_ht, montant_ttc) VALUES
(UUID(), @avoir1_id, @prod_clavier, 'Clavier Mecanique RGB', 2, 45900, 18.00, 91800, 108324);

-- ==========================================================
-- 13. FACTURE EN RETARD
-- ==========================================================
SET @facture3_id = UUID();
INSERT INTO factures (id, numero_facture, type_facture, id_client, id_utilisateur, date_emission, date_echeance, statut, total_ht, total_tva, total_ttc, montant_paye, created_at) VALUES
(@facture3_id, 'FAC-2024-003', 'VENTE', @client_armand, @user_id, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 15 DAY, 'EN_RETARD', 54900, 9882, 64782, 0, NOW() - INTERVAL 45 DAY);

INSERT INTO lignes_facture (id, id_facture, id_produit, designation, quantite, prix_unitaire_ht, taux_tva, montant_ht, montant_tva, montant_ttc) VALUES
(UUID(), @facture3_id, @prod_ram, 'Barrette RAM DDR4 16Go', 1, 54900, 18.00, 54900, 9882, 64782);

-- ==========================================================
-- 14. FLUX D'ACHAT
-- ==========================================================
SET @bcf1_id = UUID();
INSERT INTO bons_commande_fournisseurs (id, numero_bcf, id_fournisseur, id_utilisateur, date_commande, statut, total_ht, total_tva, total_ttc, created_at) VALUES
(@bcf1_id, 'BCF-2024-001', @fournisseur_global, @user_id, NOW() - INTERVAL 8 DAY, 'RECU_PARTIEL', 850000, 153000, 1003000, NOW() - INTERVAL 8 DAY);

SET @ligne_bcf_1_id = UUID();
INSERT INTO lignes_bcf (id, id_bcf, id_produit, quantite_commandee, prix_unitaire_ht, montant_ht) VALUES
(@ligne_bcf_1_id, @bcf1_id, @prod_pc_pro, 10, 85000, 850000);

SET @reception1_id = UUID();
INSERT INTO receptions_marchandises (id, id_bcf, id_utilisateur, date_reception, statut, created_at) VALUES
(@reception1_id, @bcf1_id, @user_id, NOW() - INTERVAL 1 DAY, 'PARTIELLE', NOW() - INTERVAL 1 DAY);

INSERT INTO lignes_reception (id, id_reception, id_ligne_bcf, quantite_recue, conforme) VALUES
(UUID(), @reception1_id, @ligne_bcf_1_id, 8, true);

-- MOUVEMENT DE STOCK (ENTREE ACHAT)
UPDATE stocks SET stock_actuel = stock_actuel + 8, updated_at = NOW() WHERE id_produit = @prod_pc_pro;
INSERT INTO mouvements_stock (id, id_produit, type_mouvement, quantite, stock_avant, stock_apres, motif, reference_doc, id_utilisateur, created_at)
VALUES (UUID(), @prod_pc_pro, 'ENTREE_ACHAT', 8, 24, 32, 'Réception BCF-2024-001', 'REC-2024-001', @user_id, NOW() - INTERVAL 1 DAY);

-- ==========================================================
-- 15. INVENTAIRE & AJUSTEMENTS
-- ==========================================================
SET @inv1_id = UUID();
INSERT INTO inventaires (id, id_utilisateur_createur, statut, date_debut, date_fin, created_at) VALUES
(@inv1_id, @user_id, 'VALIDE', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 3 DAY);

INSERT INTO lignes_inventaire (id, id_inventaire, id_produit, stock_theorique, stock_reel) VALUES
(UUID(), @inv1_id, @prod_papier, 25, 24),
(UUID(), @inv1_id, @prod_switch, 25, 26);

-- MOUVEMENTS D'AJUSTEMENT
UPDATE stocks SET stock_actuel = 24, updated_at = NOW() WHERE id_produit = @prod_papier;
INSERT INTO mouvements_stock (id, id_produit, type_mouvement, quantite, stock_avant, stock_apres, motif, reference_doc, id_utilisateur, created_at)
VALUES (UUID(), @prod_papier, 'AJUSTEMENT_NEG', 1, 25, 24, 'Inventaire', 'INV-1', @user_id, NOW() - INTERVAL 2 DAY);

UPDATE stocks SET stock_actuel = 26, updated_at = NOW() WHERE id_produit = @prod_switch;
INSERT INTO mouvements_stock (id, id_produit, type_mouvement, quantite, stock_avant, stock_apres, motif, reference_doc, id_utilisateur, created_at)
VALUES (UUID(), @prod_switch, 'AJUSTEMENT_POS', 1, 25, 26, 'Inventaire', 'INV-1', @user_id, NOW() - INTERVAL 2 DAY);

-- ==========================================================
-- 16. NOTIFICATIONS
-- ==========================================================
INSERT INTO notifications (id, id_utilisateur, type_notif, titre, message, is_lue, created_at) VALUES
(UUID(), @user_id, 'ALERTE_STOCK', 'Stock faible - PC Portable Pro 15', 'Le stock du produit PRD-INF-001 est de 32 unités (seuil: 5).', false, NOW() - INTERVAL 1 DAY),
(UUID(), @user_id, 'FACTURE_ECHEANCE', 'Facture FAC-2024-003 en retard', 'La facture de Armand Christian est en retard de 15 jours.', false, NOW());

-- ==========================================================
-- 17. DONNEES IA (simulées)
-- ==========================================================
INSERT INTO alertes_rupture (id, id_produit, jours_avant_rupture, vitesse_ecoulement, qte_recommandee, statut, created_at)
SELECT UUID(), id, 10, 2.5, 20, 'VIGILANCE', NOW()
FROM produits p
WHERE p.reference = 'PRD-ACC-002'; -- Souris Ergonomique

INSERT INTO previsions_ventes (id, id_produit, periode, quantite_prevue, quantite_min, quantite_max, tendance, taux_confiance, created_at) VALUES
(UUID(), @prod_pc_pro, LAST_DAY(NOW() + INTERVAL 1 MONTH), 15, 12, 18, 'HAUSSE', 88.5, NOW()),
(UUID(), @prod_casque, LAST_DAY(NOW() + INTERVAL 1 MONTH), 30, 25, 35, 'STABLE', 92.1, NOW());

-- ==========================================================
-- 18. AFFECTATION DES PERMISSIONS AUX ROLES
-- ==========================================================
SELECT id INTO @role_super_admin FROM roles WHERE nom_role = 'SUPER_ADMIN';
SELECT id INTO @role_admin FROM roles WHERE nom_role = 'ADMIN';
SELECT id INTO @role_gestionnaire FROM roles WHERE nom_role = 'GESTIONNAIRE';
SELECT id INTO @role_commercial FROM roles WHERE nom_role = 'COMMERCIAL';
SELECT id INTO @role_magasinier FROM roles WHERE nom_role = 'MAGASINIER';

-- 1. SUPER_ADMIN et ADMIN recoivent toutes les permissions
INSERT INTO role_permissions (id_role, id_permission)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.nom_role IN ('SUPER_ADMIN', 'ADMIN');

-- 2. Le GESTIONNAIRE a presque tout, sauf la gestion des utilisateurs/rôles et de l'IA.
INSERT INTO role_permissions (id_role, id_permission)
SELECT @role_gestionnaire, p.id
FROM permissions p
WHERE p.module NOT IN ('users', 'roles', 'permissions', 'ia');

-- 3. Le COMMERCIAL gère le cycle de vente et la consultation utile du catalogue.
INSERT INTO role_permissions (id_role, id_permission)
SELECT @role_commercial, p.id
FROM permissions p
WHERE (p.module IN ('clients', 'ventes', 'factures') AND p.action IN ('creer', 'lire', 'modifier', 'valider', 'livrer', 'avoir', 'envoyer'))
   OR (p.module IN ('produits', 'stocks', 'dashboard', 'rapports') AND p.action = 'lire');

-- 4. Le MAGASINIER gère les stocks, les achats et les réceptions.
INSERT INTO role_permissions (id_role, id_permission)
SELECT @role_magasinier, p.id
FROM permissions p
WHERE (p.module IN ('stocks', 'mouvements_stock', 'inventaires', 'receptions', 'achats') AND p.action IN ('creer', 'lire', 'modifier', 'ajuster', 'inventaire', 'valider', 'receptionner'))
   OR (p.module IN ('produits', 'fournisseurs', 'categories', 'dashboard') AND p.action = 'lire');
