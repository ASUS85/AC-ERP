import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { categoriesController } from "./categories.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", authorize("categories:lire"), categoriesController.list);
router.get("/arbre", authorize("categories:lire"), categoriesController.arbre);
router.get("/:id", authorize("categories:lire"), categoriesController.getById);
router.post("/", authorize("categories:creer"), categoriesController.create);
router.put("/:id", authorize("categories:modifier"), categoriesController.update);
router.delete("/:id", authorize("categories:supprimer"), categoriesController.remove);

export default router;

