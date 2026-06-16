import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { fournisseursController } from "./fournisseurs.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", fournisseursController.list);
router.get("/:id", fournisseursController.getById);
router.post("/", fournisseursController.create);
router.put("/:id", fournisseursController.update);

export default router;

