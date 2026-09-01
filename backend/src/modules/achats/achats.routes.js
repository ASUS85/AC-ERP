import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { uploadSupplierInvoiceSingle } from "../../middlewares/upload.middleware.js";
import { achatsController } from "./achats.controller.js";

const router = Router();
router.get(
  "/public/bons-commande/valider",
  achatsController.fournisseurValider,
);
router.get(
  "/public/bons-commande/refuser",
  achatsController.fournisseurRefuser,
);
router.get(
  "/public/bons-commande/telecharger",
  achatsController.fournisseurTelecharger,
);

router.use(authenticate);
router.get("/demandes", authorize("achats:lire"), achatsController.getDemandes);
router.post("/demandes", authorize("achats:creer"), achatsController.createDemande);
router.get("/demandes/:id", authorize("achats:lire"), achatsController.getDemande);
router.patch("/demandes/:id/valider", authorize("achats:valider"), achatsController.validerDemande);
router.get("/bons-commande", authorize("achats:lire"), achatsController.getBonsCommande);
router.post("/bons-commande", authorize("achats:creer"), achatsController.createBonCommande);
router.get("/bons-commande/:id", authorize("achats:lire"), achatsController.getBonCommande);
router.patch("/bons-commande/:id/envoyer", authorize("achats:valider"), achatsController.envoyerBonCommande);
router.patch(
  "/bons-commande/:id/statut",
  authorize("achats:valider"),
  achatsController.transitionBonCommande,
);
router.post(
  "/bons-commande/:id/dupliquer",
  authorize("achats:creer"),
  achatsController.dupliquerBonCommande,
);
router.get(
  "/bons-commande/:id/pdf",
  authorize("achats:lire"),
  achatsController.telechargerBonCommandeInterne,
);
router.post("/bons-commande/:id/facture", authorize("achats:receptionner"), achatsController.creerFactureAchat);
router.get(
  "/bons-commande/:id/factures-importees",
  authorize("achats:lire"),
  achatsController.getFacturesImportees,
);
router.post(
  "/bons-commande/:id/factures-importees",
  authorize("achats:receptionner"),
  uploadSupplierInvoiceSingle("file"),
  achatsController.importerFactureFournisseur,
);
router.post("/bons-commande/:id/reception", authorize("achats:receptionner"), achatsController.reception);

export default router;
