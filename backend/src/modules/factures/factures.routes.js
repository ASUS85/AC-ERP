import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { facturesController } from "./factures.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", facturesController.list);
router.post("/", facturesController.create);
router.get("/impayees", facturesController.impayees);
router.get("/:id/pdf", facturesController.pdf);
router.get("/:id", facturesController.getById);
router.post("/:id/envoyer", facturesController.envoyer);
router.post("/:id/avoir", facturesController.avoir);

export default router;

