import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { parametresController } from "./parametres.controller.js";

const router = Router();
router.use(authenticate);
router.get("/entreprise", authorize("users:modifier"), parametresController.entreprise);
router.put("/entreprise", authorize("users:modifier"), parametresController.updateEntreprise);
router.get("/systeme", authorize("users:modifier"), parametresController.systeme);
router.put("/systeme", authorize("users:modifier"), parametresController.updateSysteme);
router.patch("/systeme/maintenance", parametresController.maintenance);
router.get("/journal", authorize("users:modifier"), parametresController.journal);
export default router;
