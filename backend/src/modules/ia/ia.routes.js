import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { iaController } from "./ia.controller.js";

const router = Router();
router.use(authenticate);
router.post("/chat", iaController.chat);
router.get("/conversations", iaController.getConversations);
router.get("/conversations/:id/messages", iaController.getConversationMessages);
router.patch("/conversations/:id", iaController.renameConversation);
router.delete("/conversations/:id", iaController.deleteConversation);
router.post("/rapport", iaController.genererRapport);
router.get("/rapports", iaController.getRapports);
router.get("/rapports/:id/pdf", iaController.telechargerRapportPdf);
router.get("/previsions", iaController.getPrevisions);
router.get("/alertes-rupture", iaController.getAlertesRupture);

// Routes historiques conservees pour les integrations existantes.
router.get("/previsions-ventes", iaController.previsionsVentes);
router.post("/rapport-auto", iaController.rapportAuto);

export default router;
