import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize, authorizeAny } from "../../middlewares/rbac.middleware.js";
import { parametresController } from "./parametres.controller.js";

const router = Router();
router.use(authenticate);
router.get(
  "/entreprise",
  authorizeAny("users:modifier", "dashboard:lire"),
  parametresController.entreprise,
);
router.put(
  "/entreprise",
  authorize("users:modifier"),
  parametresController.updateEntreprise,
);
router.get(
  "/systeme",
  authorizeAny("users:modifier", "dashboard:lire"),
  parametresController.systeme,
);
router.put(
  "/systeme",
  authorize("users:modifier"),
  parametresController.updateSysteme,
);
router.patch("/systeme/maintenance", parametresController.maintenance);
router.get(
  "/journal",
  authorizeAny("users:modifier", "dashboard:lire"),
  parametresController.journal,
);
export default router;
