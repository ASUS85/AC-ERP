import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { produitsController } from "./produits.controller.js";

const router = Router();
router.use(authenticate);
router.get("/export.pdf", produitsController.exportPdf);
router.get("/", produitsController.list);
router.get("/:id", produitsController.getById);
router.post("/", produitsController.create);
router.put("/:id", produitsController.update);
router.delete("/:id", produitsController.remove);

export default router;
