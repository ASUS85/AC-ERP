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
TRUNCATE TABLE lignes_devis;arq
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
