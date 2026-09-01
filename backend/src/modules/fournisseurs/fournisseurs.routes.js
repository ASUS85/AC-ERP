import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { fournisseursController } from "./fournisseurs.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", authorize("fournisseurs:lire"), fournisseursController.list);
router.get("/:id", authorize("fournisseurs:lire"), fournisseursController.getById);
router.post("/", authorize("fournisseurs:creer"), fournisseursController.create);
router.put("/:id", authorize("fournisseurs:modifier"), fournisseursController.update);

export default router;

