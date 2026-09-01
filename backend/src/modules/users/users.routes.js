import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { usersController } from "./users.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", authorize("users:lire"), usersController.list);
router.get("/:id", authorize("users:lire"), usersController.getById);
router.post("/", authorize("users:creer"), usersController.create);
router.put("/:id", authorize("users:modifier"), usersController.update);
router.delete("/:id", authorize("users:supprimer"), usersController.remove);
router.patch(
  "/:id/debloquer",
  authorize("users:modifier"),
  usersController.debloquer,
);

export default router;
