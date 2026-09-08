-- Donnees de demonstration AC ERP.
-- Ce script ne touche qu'aux categories, produits, clients et fournisseurs.
-- Les codes DEMO permettent de reconnaitre et de nettoyer uniquement ces donnees.
-- Il ne supprime ni utilisateurs, ni roles, ni permissions, ni stocks,
-- ni ventes, ni achats, ni factures, ni paiements.

START TRANSACTION;

-- Suppression definitive des seules donnees de demonstration de ce script.
-- L'ordre respecte les relations produits -> categories.
DELETE FROM produits WHERE reference LIKE 'DEMO-PRD-%';

DELETE FROM categories
WHERE slug IN ('demo-informatique', 'demo-bureau', 'demo-reseau');

DELETE FROM clients
WHERE code_client LIKE 'DEMO-CLI-%';

DELETE FROM fournisseurs
WHERE code_fournisseur LIKE 'DEMO-FRS-%';

-- Categories de base.
INSERT INTO categories
  (id, nom, description, slug, icone, statut, is_active, created_at)
VALUES
  (UUID(), 'Informatique', 'Materiel informatique de demonstration', 'demo-informatique', 'Monitor', 'ACTIF', true, NOW()),
  (UUID(), 'Bureau', 'Equipement de bureau de demonstration', 'demo-bureau', 'Armchair', 'ACTIF', true, NOW()),
  (UUID(), 'Reseau', 'Equipement reseau de demonstration', 'demo-reseau', 'Wifi', 'ACTIF', true, NOW());

SET @cat_info = (
  SELECT id
  FROM categories
  WHERE slug = 'demo-informatique'
  LIMIT 1
);

SET @cat_bureau = (
  SELECT id
  FROM categories
  WHERE slug = 'demo-bureau'
  LIMIT 1
);

SET @cat_reseau = (
  SELECT id
  FROM categories
  WHERE slug = 'demo-reseau'
  LIMIT 1
);

-- Produits de base. Les prix sont en XAF et la TVA est comprise entre 0 et 100.
INSERT INTO produits
  (id, reference, designation, description, unite_mesure, prix_achat_ht,
   prix_vente_ht, taux_tva, stock_minimum, photo, id_categorie, statut,
   is_active, created_at, updated_at)
VALUES
  (UUID(), 'DEMO-PRD-001', 'Ordinateur portable', 'Ordinateur portable de test', 'PIECE', 250000, 325000, 18.00, 2, NULL, @cat_info, 'ACTIF', true, NOW(), NOW()),
  (UUID(), 'DEMO-PRD-002', 'Clavier USB', 'Clavier USB de test', 'PIECE', 8000, 12500, 18.00, 5, NULL, @cat_info, 'ACTIF', true, NOW(), NOW()),
  (UUID(), 'DEMO-PRD-003', 'Souris sans fil', 'Souris sans fil de test', 'PIECE', 6000, 10000, 18.00, 5, NULL, @cat_info, 'ACTIF', true, NOW(), NOW()),
  (UUID(), 'DEMO-PRD-004', 'Bureau simple', 'Bureau de test', 'PIECE', 75000, 110000, 18.00, 1, NULL, @cat_bureau, 'ACTIF', true, NOW(), NOW()),
  (UUID(), 'DEMO-PRD-005', 'Chaise de bureau', 'Chaise de test', 'PIECE', 45000, 70000, 18.00, 2, NULL, @cat_bureau, 'ACTIF', true, NOW(), NOW()),
  (UUID(), 'DEMO-PRD-006', 'Switch 8 ports', 'Switch reseau de test', 'PIECE', 18000, 30000, 18.00, 2, NULL, @cat_reseau, 'ACTIF', true, NOW(), NOW());

-- Clients de base.
INSERT INTO clients
  (id, code_client, type, nom, email, telephone, adresse, ville, pays,
   plafond_credit, mode_paiement_defaut, delai_paiement, statut, is_active, created_at)
VALUES
  (UUID(), 'DEMO-CLI-001', 'ENTREPRISE', 'Client Demo Alpha', 'armandchristian2005@gmail.com', '+237690000101', 'Rue de la Demo 1', 'Douala', 'Cameroun', 1000000, 'VIREMENT', 30, 'ACTIF', true, NOW()),
  (UUID(), 'DEMO-CLI-002', 'ENTREPRISE', 'Client Demo Beta', 'client.beta.demo@example.com', '+237690000102', 'Rue de la Demo 2', 'Yaounde', 'Cameroun', 750000, 'MOBILE_MONEY', 15, 'ACTIF', true, NOW()),
  (UUID(), 'DEMO-CLI-003', 'PARTICULIER', 'Client Demo Gamma', 'client.gamma.demo@example.com', '+237690000103', 'Rue de la Demo 3', 'Bafoussam', 'Cameroun', 250000, 'ESPECES', 0, 'ACTIF', true, NOW());

-- Fournisseurs de base.
INSERT INTO fournisseurs
  (id, code_fournisseur, raison_sociale, email, telephone, adresse, ville,
   pays, numero_fiscal, delai_livraison_moyen, conditions_paiement, statut,
   is_active, created_at)
VALUES
  (UUID(), 'DEMO-FRS-001', 'Fournisseur Demo Alpha', 'armandchristian85@gmail.com', '+237690000201', 'Avenue de la Demo 1', 'Douala', 'Cameroun', NULL, 7, 'Paiement comptant', 'ACTIF', true, NOW()),
  (UUID(), 'DEMO-FRS-002', 'Fournisseur Demo Beta', 'fournisseur.beta.demo@example.com', '+237690000202', 'Avenue de la Demo 2', 'Yaounde', 'Cameroun', NULL, 10, 'Paiement a 30 jours', 'ACTIF', true, NOW()),
  (UUID(), 'DEMO-FRS-003', 'Fournisseur Demo Gamma', 'fournisseur.gamma.demo@example.com', '+237690000203', 'Avenue de la Demo 3', 'Bafoussam', 'Cameroun', NULL, 5, 'Paiement a 15 jours', 'ACTIF', true, NOW());

COMMIT;