import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { paiementsController } from "./paiements.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", authorize("paiements:lire"), paiementsController.list);
router.post("/", authorize("paiements:creer"), paiementsController.create);
router.get("/:id", authorize("paiements:lire"), paiementsController.getById);

export default router;

