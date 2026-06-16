import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { usersController } from "./users.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", usersController.list);
router.get("/:id", usersController.getById);
router.post("/", usersController.create);
router.put("/:id", usersController.update);
router.delete("/:id", usersController.remove);
router.patch("/:id/debloquer", usersController.debloquer);

export default router;

