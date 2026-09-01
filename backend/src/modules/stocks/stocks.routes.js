import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { stocksController } from "./stocks.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", authorize("stocks:lire"), stocksController.list);
router.get("/alertes", authorize("stocks:lire"), stocksController.alertes);
router.get("/mouvements", authorize("stocks:lire"), stocksController.mouvements);
router.post("/ajustement", authorize("stocks:ajuster"), stocksController.ajustement);
router.get("/inventaires", authorize("stocks:lire"), stocksController.inventaires);
router.post("/inventaires", authorize("stocks:inventaire"), stocksController.createInventaire);
router.get("/inventaires/:id", authorize("stocks:lire"), stocksController.inventaireById);
router.patch(
  "/inventaires/:id/comptage",
  authorize("stocks:inventaire"),
  stocksController.enregistrerComptageInventaire,
);
router.post(
  "/inventaires/:id/rafraichir",
  authorize("stocks:inventaire"),
  stocksController.rafraichirInventaire,
);
router.post("/inventaires/:id/annuler", authorize("stocks:inventaire"), stocksController.annulerInventaire);
router.post("/inventaires/:id/valider", authorize("stocks:inventaire"), stocksController.validerInventaire);

export default router;
