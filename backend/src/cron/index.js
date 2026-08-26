import { startBackupCron } from "./backup.cron.js";

export function initCrons() {
  // ... vos crons existants ...
  startBackupCron(); // ← ajouter ici
}