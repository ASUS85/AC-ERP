import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { ventesController } from "./ventes.controller.js";

const router = Router();
router.use(authenticate);
router.get("/devis", ventesController.getDevis);
router.post("/devis", ventesController.createDevis);
router.get("/devis/:id", ventesController.getDevisById);
router.patch("/devis/:id/envoyer", ventesController.envoyerDevis);
router.post("/devis/:id/convertir", ventesController.convertirDevis);
router.get("/commandes", ventesController.getCommandes);
router.post("/commandes", ventesController.createCommande);
router.get("/commandes/:id", ventesController.getCommande);
router.patch("/commandes/:id/confirmer", ventesController.confirmerCommande);
router.post("/commandes/:id/livraison", ventesController.creerLivraison);
router.get("/commandes/:id/livraisons", ventesController.livraisons);

export default router;

