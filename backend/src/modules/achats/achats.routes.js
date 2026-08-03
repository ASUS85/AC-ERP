import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
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
router.get("/demandes", achatsController.getDemandes);
router.post("/demandes", achatsController.createDemande);
router.get("/demandes/:id", achatsController.getDemande);
router.patch("/demandes/:id/valider", achatsController.validerDemande);
router.get("/bons-commande", achatsController.getBonsCommande);
router.post("/bons-commande", achatsController.createBonCommande);
router.get("/bons-commande/:id", achatsController.getBonCommande);
router.patch("/bons-commande/:id/envoyer", achatsController.envoyerBonCommande);
router.patch(
  "/bons-commande/:id/statut",
  achatsController.transitionBonCommande,
);
router.post(
  "/bons-commande/:id/dupliquer",
  achatsController.dupliquerBonCommande,
);
router.get(
  "/bons-commande/:id/pdf",
  achatsController.telechargerBonCommandeInterne,
);
router.post("/bons-commande/:id/facture", achatsController.creerFactureAchat);
router.post("/bons-commande/:id/reception", achatsController.reception);

export default router;
