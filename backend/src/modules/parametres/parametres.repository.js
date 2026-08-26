import prisma from "../../config/database.js";

let initialized = false;

export async function ensureSettingsTables() {
  if (initialized) return;
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS parametres_entreprise (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    raison_sociale VARCHAR(255) NOT NULL DEFAULT 'AC ERP',
    numero_fiscal VARCHAR(100) NULL,
    adresse TEXT NULL,
    telephone VARCHAR(30) NULL,
    email VARCHAR(255) NULL,
    devise VARCHAR(10) NOT NULL DEFAULT 'XAF',
    fuseau_horaire VARCHAR(100) NOT NULL DEFAULT 'Africa/Douala',
    logo VARCHAR(500) NULL,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
  )`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS parametres_systeme (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    notifications_email BOOLEAN NOT NULL DEFAULT TRUE,
    alertes_ia BOOLEAN NOT NULL DEFAULT TRUE,
    facturation_automatique BOOLEAN NOT NULL DEFAULT TRUE,
    mode_maintenance BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
  )`);
  // Migration : colonne du lien vers la plateforme d'échange
  // (MySQL 8 ne supporte pas ADD COLUMN IF NOT EXISTS)
  const [linkCol] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'parametres_entreprise'
       AND COLUMN_NAME = 'lien_plateforme_echange'`,
  );
  if (Number(linkCol?.cnt) === 0) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE parametres_entreprise ADD COLUMN lien_plateforme_echange VARCHAR(500) NULL AFTER logo",
    );
  }

  await prisma.$executeRawUnsafe(
    "INSERT IGNORE INTO parametres_entreprise (id) VALUES ('default')",
  );
  await prisma.$executeRawUnsafe(
    "INSERT IGNORE INTO parametres_systeme (id) VALUES ('default')",
  );
  initialized = true;
}

const companyFromDb = (row) => ({
  id: row.id,
  raisonSociale: row.raison_sociale,
  numeroFiscal: row.numero_fiscal,
  adresse: row.adresse,
  telephone: row.telephone,
  email: row.email,
  devise: row.devise,
  fuseauHoraire: row.fuseau_horaire,
  logo: row.logo,
  lienPlateformeEchange: row.lien_plateforme_echange,
  updatedAt: normalizeDbDate(row.updated_at),
});
const systemFromDb = (row) => ({
  id: row.id,
  notificationsEmail: Boolean(row.notifications_email),
  alertesIa: Boolean(row.alertes_ia),
  facturationAutomatique: Boolean(row.facturation_automatique),
  modeMaintenance: Boolean(row.mode_maintenance),
  updatedAt: normalizeDbDate(row.updated_at),
});

function normalizeDbDate(value) {
  if (!value) return null;
  const raw = String(value);
  if (raw.startsWith("0000-00-00")) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export const parametresRepository = {
  async entreprise() {
    await ensureSettingsTables();
    const [row] =
      await prisma.$queryRawUnsafe(`SELECT id, raison_sociale, numero_fiscal, adresse, telephone, email, devise, fuseau_horaire, logo, lien_plateforme_echange,
      DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s.%f') AS updated_at
      FROM parametres_entreprise WHERE id = 'default'`);
    return companyFromDb(row);
  },
  async updateEntreprise(data) {
    await ensureSettingsTables();
    const current = await this.entreprise();
    const value = { ...current, ...data };
    await prisma.$executeRawUnsafe(
      "UPDATE parametres_entreprise SET raison_sociale=?, numero_fiscal=?, adresse=?, telephone=?, email=?, devise=?, fuseau_horaire=?, logo=?, lien_plateforme_echange=? WHERE id='default'",
      value.raisonSociale,
      value.numeroFiscal || null,
      value.adresse || null,
      value.telephone || null,
      value.email || null,
      value.devise,
      value.fuseauHoraire,
      value.logo || null,
      value.lienPlateformeEchange || null,
    );
    return this.entreprise();
  },
  async systeme() {
    await ensureSettingsTables();
    const [row] =
      await prisma.$queryRawUnsafe(`SELECT id, notifications_email, alertes_ia, facturation_automatique, mode_maintenance,
      DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s.%f') AS updated_at
      FROM parametres_systeme WHERE id = 'default'`);
    return systemFromDb(row);
  },
  async updateSysteme(data) {
    await ensureSettingsTables();
    const current = await this.systeme();
    const value = { ...current, ...data };
    await prisma.$executeRawUnsafe(
      "UPDATE parametres_systeme SET notifications_email=?, alertes_ia=?, facturation_automatique=?, mode_maintenance=? WHERE id='default'",
      value.notificationsEmail,
      value.alertesIa,
      value.facturationAutomatique,
      value.modeMaintenance,
    );
    return this.systeme();
  },
  audits(where) {
    return prisma.auditLog.findMany({
      where,
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 250,
    });
  },
};
