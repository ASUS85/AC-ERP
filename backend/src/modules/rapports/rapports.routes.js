import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { rapportsController } from "./rapports.controller.js";

const router = Router();
router.use(authenticate);
router.get("/ventes", rapportsController.ventes);
router.get("/achats", rapportsController.achats);
router.get("/stocks", rapportsController.stocks);
router.get("/balance-clients", rapportsController.balanceClients);
router.get("/balance-fournisseurs", rapportsController.balanceFournisseurs);

export default router;

