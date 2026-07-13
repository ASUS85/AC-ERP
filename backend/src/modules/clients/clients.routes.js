import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { clientsController } from "./clients.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", clientsController.list);
router.get("/:id/historique", clientsController.historique);
router.get("/:id", clientsController.getById);
router.post("/", clientsController.create);
router.put("/:id", clientsController.update);
router.delete("/:id", clientsController.remove);

export default router;

