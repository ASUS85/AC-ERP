import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();
router.use(authenticate);
router.get("/kpis", dashboardController.kpis);
router.get("/evolution-ventes", dashboardController.evolutionVentes);
router.get("/top-produits", dashboardController.topProduits);
router.get("/top-clients", dashboardController.topClients);
router.get("/repartition-categories", dashboardController.repartitionCategories);

export default router;

