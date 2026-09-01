import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { iaController } from "./ia.controller.js";

const router = Router();
router.use(authenticate);
router.post("/chat", authorize("ia:chat"), iaController.chat);
router.get("/conversations", authorize("ia:lire"), iaController.getConversations);
router.get("/conversations/:id/messages", authorize("ia:lire"), iaController.getConversationMessages);
router.patch("/conversations/:id", authorize("ia:chat"), iaController.renameConversation);
router.delete("/conversations/:id", authorize("ia:chat"), iaController.deleteConversation);
router.post("/rapport", authorize("ia:rapport"), iaController.genererRapport);
router.get("/rapports", authorize("ia:lire"), iaController.getRapports);
router.get("/rapports/:id/pdf", authorize("ia:lire"), iaController.telechargerRapportPdf);
router.get("/previsions", authorize("ia:lire"), iaController.getPrevisions);
router.get("/alertes-rupture", authorize("ia:lire"), iaController.getAlertesRupture);

// Routes historiques conservees pour les integrations existantes.
router.get("/previsions-ventes", authorize("ia:lire"), iaController.previsionsVentes);
router.post("/rapport-auto", authorize("ia:rapport"), iaController.rapportAuto);

export default router;
