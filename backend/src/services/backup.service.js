import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzip, createGzip } from "node:zlib";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import mysqldump from "mysqldump";
import mysql from "mysql2/promise";
import logger from "../utils/logger.js";
import { ApiError } from "../utils/response.util.js";
import prisma from "../config/database.js";
import { parametresRepository } from "../modules/parametres/parametres.repository.js";
import { sendRestoreNotificationEmail } from "./email.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dossier de stockage des backups
const BACKUP_DIR = path.resolve(__dirname, "../../backups");

// Nombre de jours de rétention
const RETENTION_DAYS = 30;

function normalizeMysqlDumpSql(sql) {
  return sql.replace(/"([A-Za-z_][A-Za-z0-9_]*)"/g, "`$1`");
}

// Extraire les infos de connexion depuis DATABASE_URL
// Format : mysql://user:password@host:port/database
function parseDatabaseUrl(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== "mysql:") throw new Error("DATABASE_URL invalide");
  return {
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password || ""),
    host: parsed.hostname,
    port: parsed.port || "3306",
    database: decodeURIComponent(parsed.pathname.replace(/^\/+/, "")),
  };
}

// Verrou : empêche le lancement de plusieurs restaurations simultanées
let restoreInProgress = false;

async function assertMaintenanceMode() {
  const systeme = await parametresRepository.systeme();
  if (!systeme.modeMaintenance) {
    throw new ApiError(
      403,
      "MAINTENANCE_REQUIRED",
      "Le mode maintenance doit être activé avant toute restauration de la base de données",
    );
  }
}

// Importe un dump .sql.gz via mysql2, sans dépendre d'un binaire système.
async function runMysqlImport(db, gzPath) {
  const compressed = await fs.readFile(gzPath);
  const sql = await new Promise((resolve, reject) => {
    gunzip(compressed, (error, result) => {
      if (error) reject(error);
      else resolve(normalizeMysqlDumpSql(result.toString("utf8")));
    });
  });
  const connection = await mysql.createConnection({
    host: db.host,
    port: Number(db.port),
    user: db.user,
    password: db.password,
    database: db.database,
    multipleStatements: true,
  });
  try {
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    const [tables] = await connection.query("SHOW TABLES");
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      if (typeof tableName !== "string") continue;
      const escapedTableName = `\`${tableName.replace(/`/g, "``")}\``;
      await connection.query(`TRUNCATE TABLE ${escapedTableName}`);
    }
    await connection.query(sql);
  } finally {
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    await connection.end();
  }
}

// Générer le nom du fichier de backup
function buildBackupFilename() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10); // 2025-08-25
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "-"); // 02-00-00
  return `erp_backup_${date}_${time}.sql`;
}

export const backupService = {
  // ── Créer un backup ────────────────────────────────────────────────────
  async createBackup() {
    // Créer le dossier si inexistant
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    const db = parseDatabaseUrl(process.env.DATABASE_URL);
    const filename = buildBackupFilename();
    const sqlPath = path.join(BACKUP_DIR, filename);
    const gzPath = `${sqlPath}.gz`;

    await mysqldump({
      connection: {
        host: db.host,
        port: Number(db.port),
        user: db.user,
        password: db.password,
        database: db.database,
      },
      dumpToFile: sqlPath,
      compressFile: false,
    });

    const sql = await fs.readFile(sqlPath, "utf8");
    await fs.writeFile(sqlPath, normalizeMysqlDumpSql(sql), "utf8");

    // Compresser le fichier SQL en .gz
    await pipeline(
      createReadStream(sqlPath),
      createGzip(),
      createWriteStream(gzPath),
    );

    // Supprimer le fichier SQL non compressé
    await fs.unlink(sqlPath);

    // Récupérer la taille du fichier compressé
    const stats = await fs.stat(gzPath);
    const sizeKb = Math.round(stats.size / 1024);

    logger.info(`Backup terminé : ${filename}.gz (${sizeKb} Ko)`);

    return {
      filename: `${filename}.gz`,
      path: gzPath,
      sizeKb,
      createdAt: new Date(),
    };
  },

  // ── Lister les backups disponibles ────────────────────────────────────
  async listBackups() {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const files = await fs.readdir(BACKUP_DIR);
    const backups = await Promise.all(
      files
        .filter((f) => f.endsWith(".sql.gz"))
        .map(async (f) => {
          const filePath = path.join(BACKUP_DIR, f);
          const stats = await fs.stat(filePath);
          return {
            filename: f,
            sizeKb: Math.round(stats.size / 1024),
            createdAt: stats.mtime,
          };
        }),
    );
    // Trier par date décroissante
    return backups.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  },

  // ── Supprimer les backups expirés ────────────────────────────────────
  async purgeOldBackups() {
    const files = await this.listBackups();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

    let deleted = 0;
    for (const file of files) {
      if (file.createdAt < cutoff) {
        await fs.unlink(path.join(BACKUP_DIR, file.filename));
        logger.info(`Backup supprimé (expiré) : ${file.filename}`);
        deleted++;
      }
    }

    return deleted;
  },

  // ── Télécharger un backup (retourne le chemin) ────────────────────────
  async getBackupPath(filename) {
    // Sécurité : empêcher la traversée de répertoires
    const safe = path.basename(filename);
    if (!safe.endsWith(".sql.gz")) {
      throw new Error("Fichier invalide");
    }
    const filePath = path.join(BACKUP_DIR, safe);
    await fs.access(filePath); // lève une erreur si le fichier n'existe pas
    return filePath;
  },

  // ── Backup complet : créer + purger ──────────────────────────────────
  async runFullBackup() {
    const backup = await this.createBackup();
    const deleted = await this.purgeOldBackups();
    return { backup, deletedOldBackups: deleted };
  },

  // ── Restaurer la base depuis une sauvegarde ──────────────────────────
  async restoreBackup(filename) {
    if (restoreInProgress) {
      throw new ApiError(
        409,
        "RESTORE_IN_PROGRESS",
        "Une restauration est déjà en cours, veuillez patienter",
      );
    }

    // Sécurité : le mode maintenance est obligatoire (vérifié côté serveur)
    await assertMaintenanceMode();

    // Valide le nom du fichier et son existence
    const filePath = await this.getBackupPath(filename);
    const db = parseDatabaseUrl(process.env.DATABASE_URL);

    restoreInProgress = true;
    try {
      await runMysqlImport(db, filePath);
      logger.info(`Restauration terminée : ${filename}`);
      return { filename, restoredAt: new Date() };
    } finally {
      restoreInProgress = false;
    }
  },

  // ── Notifier les utilisateurs internes d'une restauration ────────────
  // (les clients et fournisseurs sont des tables séparées : exclus d'office)
  async notifyRestoreToInternalUsers({ filename, restoredAt, actorName }) {
    const users = await prisma.utilisateur.findMany({
      where: { statut: "ACTIF" },
      select: { email: true, prenom: true, nom: true },
    });
    if (users.length === 0) return { sent: 0, total: 0 };

    const date = restoredAt.toLocaleDateString("fr-FR");
    const heure = restoredAt.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const results = await Promise.allSettled(
      users.map((user) =>
        sendRestoreNotificationEmail(
          user.email,
          `${user.prenom} ${user.nom}`.trim(),
          { date, heure, sauvegarde: filename, effectuePar: actorName },
        ),
      ),
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      logger.error(
        `Notifications restauration échouées : ${failed}/${results.length}`,
      );
    }
    logger.info(
      `Notifications restauration envoyées : ${results.length - failed}/${results.length}`,
    );
    return { sent: results.length - failed, total: results.length };
  },
};
