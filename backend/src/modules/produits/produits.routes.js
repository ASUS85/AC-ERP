import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize, authorizeAny } from "../../middlewares/rbac.middleware.js";
import { uploadSingle } from "../../middlewares/upload.middleware.js";
import { produitsController } from "./produits.controller.js";

const router = Router();
router.use(authenticate);
router.post(
  "/upload-photo",
  authorizeAny("produits:creer", "produits:modifier"),
  uploadSingle("photo"),
  produitsController.uploadPhoto,
);
router.get("/export.pdf", authorize("produits:lire"), produitsController.exportPdf);
router.get("/", authorize("produits:lire"), produitsController.list);
router.get("/:id", authorize("produits:lire"), produitsController.getById);
router.post("/", authorize("produits:creer"), produitsController.create);
router.put("/:id", authorize("produits:modifier"), produitsController.update);
router.delete("/:id", authorize("produits:supprimer"), produitsController.remove);

export default router;
