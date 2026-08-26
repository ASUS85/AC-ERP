import cron from "node-cron";
import { backupService } from "../services/backup.service.js";
import logger from "../utils/logger.js";

export function startBackupCron() {
  // Tous les jours à 2h00 du matin
  cron.schedule("0 2 * * *", async () => {
    logger.info("CRON backup démarré...");
    try {
      const result = await backupService.runFullBackup();
      logger.info(`CRON backup OK : ${result.backup.filename} (${result.backup.sizeKb} Ko) | ${result.deletedOldBackups} ancien(s) supprimé(s)`);
    } catch (error) {
      logger.error("CRON backup ÉCHOUÉ :", error.message);
    }
  }, {
    timezone: "Africa/Douala", // ← votre fuseau horaire
  });

  logger.info("CRON backup planifié (chaque nuit à 2h00)");
}