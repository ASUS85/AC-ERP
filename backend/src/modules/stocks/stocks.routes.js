import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { stocksController } from "./stocks.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", stocksController.list);
router.get("/alertes", stocksController.alertes);
router.get("/mouvements", stocksController.mouvements);
router.post("/ajustement", stocksController.ajustement);
router.get("/inventaires", stocksController.inventaires);
router.post("/inventaires", stocksController.createInventaire);
router.get("/inventaires/:id", stocksController.inventaireById);
router.patch(
  "/inventaires/:id/comptage",
  stocksController.enregistrerComptageInventaire,
);
router.post(
  "/inventaires/:id/rafraichir",
  stocksController.rafraichirInventaire,
);
router.post("/inventaires/:id/annuler", stocksController.annulerInventaire);
router.post("/inventaires/:id/valider", stocksController.validerInventaire);

export default router;
