import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { rolesController } from "./roles.controller.js";

const router = Router();
router.use(authenticate);
router.get("/permissions", authorize("roles:lire"), rolesController.permissionsCatalog);
router.get("/", authorize("roles:lire"), rolesController.list);
router.get("/:id/permissions", authorize("roles:lire"), rolesController.permissions);
router.put("/:id/permissions", authorize("roles:modifier"), rolesController.setPermissions);
router.get("/:id", authorize("roles:lire"), rolesController.getById);
router.post("/", authorize("roles:creer"), rolesController.create);
router.put("/:id", authorize("roles:modifier"), rolesController.update);
router.delete("/:id", authorize("roles:modifier"), rolesController.remove);

export default router;
