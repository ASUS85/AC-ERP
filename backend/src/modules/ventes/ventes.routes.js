import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { ventesController } from "./ventes.controller.js";
import { createVenteDirecteSchema } from "./ventes.validation.js";

const router = Router();
router.get(
  "/public/devis/telecharger",
  ventesController.telechargerDevisPublic,
);
router.use(authenticate);
router.post(
  "/directes",
  authorize("ventes:creer"),
  validate(createVenteDirecteSchema),
  ventesController.createVenteDirecte,
);
router.get("/devis", authorize("ventes:lire"), ventesController.getDevis);
router.post("/devis", authorize("ventes:creer"), ventesController.createDevis);
router.get("/devis/:id", authorize("ventes:lire"), ventesController.getDevisById);
router.patch("/devis/:id/envoyer", authorize("ventes:valider"), ventesController.envoyerDevis);
router.post("/devis/:id/convertir", authorize("ventes:valider"), ventesController.convertirDevis);
router.get("/commandes", authorize("ventes:lire"), ventesController.getCommandes);
router.post("/commandes", authorize("ventes:creer"), ventesController.createCommande);
router.get("/commandes/:id", authorize("ventes:lire"), ventesController.getCommande);
router.patch("/commandes/:id/confirmer", authorize("ventes:valider"), ventesController.confirmerCommande);
router.post("/commandes/:id/livraison", authorize("ventes:livrer"), ventesController.creerLivraison);
router.get("/commandes/:id/livraisons", authorize("ventes:lire"), ventesController.livraisons);

export default router;
