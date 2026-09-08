import { startBackupCron } from "./backup.cron.js";
import { startIaCron } from "./ia.cron.js";

export function initCrons() {
  // ... vos crons existants ...
  startBackupCron(); // ← ajouter ici
  startIaCron();
}
