// backend/src/modules/backup/backup.routes.js
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { backupService } from "../../services/backup.service.js";
import { sendSuccess } from "../../utils/response.util.js";
import logger from "../../utils/logger.js";
import { authRepository } from "../auth/auth.repository.js";
import path from "node:path";

const router = Router();
router.use(authenticate);
router.use(authorize("users:supprimer")); // Super Admin seulement

// Lister les backups
router.get("/", async (req, res, next) => {
  try {
    const backups = await backupService.listBackups();
    return sendSuccess(
      res,
      backups,
      `${backups.length} backup(s) disponible(s)`,
    );
  } catch (e) {
    next(e);
  }
});

// Déclencher un backup manuel
router.post("/", async (req, res, next) => {
  try {
    const result = await backupService.runFullBackup();
    return sendSuccess(
      res,
      result.backup,
      "Backup créé avec succès",
      null,
      201,
    );
  } catch (e) {
    next(e);
  }
});

// Télécharger un backup
router.get("/:filename", async (req, res, next) => {
  try {
    const filePath = await backupService.getBackupPath(req.params.filename);
    res.download(filePath, req.params.filename);
  } catch (e) {
    next(e);
  }
});

// Restaurer la base depuis une sauvegarde
// Sécurités : permission users:supprimer (router.use) + mode maintenance
// obligatoire vérifié côté serveur dans backupService.restoreBackup
router.post("/:filename/restore", async (req, res, next) => {
  try {
    const result = await backupService.restoreBackup(req.params.filename);

    // Notification email aux utilisateurs internes (hors clients/fournisseurs).
    // Un échec d'envoi ne remet pas en cause le succès de la restauration.
    let notifications = null;
    try {
      const actor = await authRepository.findUserById(req.user.userId);
      notifications = await backupService.notifyRestoreToInternalUsers({
        filename: req.params.filename,
        restoredAt: result.restoredAt,
        actorName: actor ? `${actor.prenom} ${actor.nom}`.trim() : null,
      });
    } catch (mailError) {
      logger.error(
        `Envoi des notifications de restauration échoué : ${mailError.message}`,
      );
    }

    return sendSuccess(
      res,
      { ...result, notifications },
      "Base de données restaurée avec succès",
    );
  } catch (e) {
    next(e);
  }
});

export default router;
