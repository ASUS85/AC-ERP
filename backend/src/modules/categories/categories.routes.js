import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { categoriesController } from "./categories.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", categoriesController.list);
router.get("/arbre", categoriesController.arbre);
router.get("/:id", categoriesController.getById);
router.post("/", categoriesController.create);
router.put("/:id", categoriesController.update);
router.delete("/:id", categoriesController.remove);

export default router;

