import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { clientsController } from "./clients.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", authorize("clients:lire"), clientsController.list);
router.get("/export.pdf", authorize("clients:lire"), clientsController.exportPdf);
router.get("/:id/historique", authorize("clients:lire"), clientsController.historique);
router.get("/:id", authorize("clients:lire"), clientsController.getById);
router.post("/", authorize("clients:creer"), clientsController.create);
router.put("/:id", authorize("clients:modifier"), clientsController.update);
router.delete("/:id", authorize("clients:modifier"), clientsController.remove);

export default router;
