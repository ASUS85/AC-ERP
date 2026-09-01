import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { facturesController } from "./factures.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", authorize("factures:lire"), facturesController.list);
router.post("/", authorize("factures:creer"), facturesController.create);
router.get("/impayees", authorize("factures:lire"), facturesController.impayees);
router.get("/:id/pdf", authorize("factures:lire"), facturesController.pdf);
router.get("/:id", authorize("factures:lire"), facturesController.getById);
router.post("/:id/envoyer", authorize("factures:envoyer"), facturesController.envoyer);
router.post("/:id/avoir", authorize("factures:avoir"), facturesController.avoir);

export default router;

