import api from "./client";

export type BackupInfo = {
  filename: string;
  sizeKb: number;
  createdAt: string;
};

/** Lister les sauvegardes disponibles */
export const listBackups = () => api.get("/backup");

/**
 * Déclencher une sauvegarde manuelle (mysqldump + compression).
 * Timeout étendu : l'opération peut prendre plus de 30 s.
 * Corps vide `{}` : le parser JSON du backend est en mode strict.
 */
export const createBackup = () => api.post("/backup", {}, { timeout: 120000 });

/**
 * Restaurer la base de données depuis une sauvegarde.
 * Nécessite le mode maintenance activé (vérifié côté serveur).
 * Timeout étendu : l'opération peut prendre plusieurs minutes.
 */
export const restoreBackup = (filename: string) =>
  api.post(
    `/backup/${encodeURIComponent(filename)}/restore`,
    {},
    {
      timeout: 300000,
    },
  );
