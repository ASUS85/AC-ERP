import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { notificationsController } from "./notifications.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", notificationsController.list);
router.patch("/tout-lire", notificationsController.toutLire);
router.patch("/:id/lire", notificationsController.lire);

export default router;

