import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { paiementsController } from "./paiements.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", paiementsController.list);
router.post("/", paiementsController.create);
router.get("/:id", paiementsController.getById);

export default router;

