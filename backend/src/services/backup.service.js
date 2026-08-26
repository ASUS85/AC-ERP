import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGzip, createGunzip } from "node:zlib";
import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import logger from "../utils/logger.js";
import { ApiError } from "../utils/response.util.js";
import prisma from "../config/database.js";
import { parametresRepository } from "../modules/parametres/parametres.repository.js";
import { sendRestoreNotificationEmail } from "./email.service.js";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dossier de stockage des backups
const BACKUP_DIR = path.resolve(__dirname, "../../backups");

// Nombre de jours de rétention
const RETENTION_DAYS = 30;

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

function resolveMysqldumpPath() {
  if (process.env.MYSQLDUMP_PATH) return process.env.MYSQLDUMP_PATH;
  const wampPath = "C:\\wamp64\\bin\\mysql\\mysql8.4.7\\bin\\mysqldump.exe";
  if (process.platform === "win32" && existsSync(wampPath)) return wampPath;
  return "mysqldump";
}

function resolveMysqlPath() {
  if (process.env.MYSQL_PATH) return process.env.MYSQL_PATH;
  const wampPath = "C:\\wamp64\\bin\\mysql\\mysql8.4.7\\bin\\mysql.exe";
  if (process.platform === "win32" && existsSync(wampPath)) return wampPath;
  return "mysql";
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

// Importe un dump .sql.gz directement dans MySQL via stdin (sans fichier temporaire)
function runMysqlImport(db, gzPath) {
  return new Promise((resolve, reject) => {
    const args = ["-u", db.user, "-h", db.host, "-P", db.port, db.database];
    const child = spawn(resolveMysqlPath(), args, {
      windowsHide: true,
      env: { ...process.env, MYSQL_PWD: db.password },
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 2000) stderr = stderr.slice(0, 2000);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      // Journal complet côté serveur uniquement ; message public générique
      logger.error(`Restauration échouée (code ${code}) : ${stderr}`);
      reject(new Error(`Échec de l'import MySQL (code ${code})`));
    });

    pipeline(createReadStream(gzPath), createGunzip(), child.stdin).catch(
      (err) => {
        child.kill();
        reject(err);
      },
    );
  });
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

    const mysqldump = resolveMysqldumpPath();
    const args = [
      "-u",
      db.user,
      "-h",
      db.host,
      "-P",
      db.port,
      "--single-transaction",
      "--routines",
      "--triggers",
      "--add-drop-table",
      `--result-file=${sqlPath}`,
      db.database,
    ];

    await execFileAsync(mysqldump, args, {
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 20,
      env: {
        ...process.env,
        MYSQL_PWD: db.password,
      },
    });

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
      logger.error(`Notifications restauration échouées : ${failed}/${results.length}`);
    }
    logger.info(
      `Notifications restauration envoyées : ${results.length - failed}/${results.length}`,
    );
    return { sent: results.length - failed, total: results.length };
  },
};
