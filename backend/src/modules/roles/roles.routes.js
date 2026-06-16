import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { rolesController } from "./roles.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", rolesController.list);
router.get("/:id/permissions", rolesController.permissions);
router.put("/:id/permissions", rolesController.setPermissions);
router.get("/:id", rolesController.getById);
router.post("/", rolesController.create);
router.put("/:id", rolesController.update);
router.delete("/:id", rolesController.remove);

export default router;

