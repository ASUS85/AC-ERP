import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { iaController } from "./ia.controller.js";

const router = Router();
router.use(authenticate);
router.get("/previsions-ventes", iaController.previsionsVentes);
router.get("/alertes-rupture", iaController.alertesRupture);
router.post("/chat", iaController.chat);
router.get("/conversations", iaController.conversations);
router.get("/rapports", iaController.rapports);
router.post("/rapport-auto", iaController.rapportAuto);

export default router;

