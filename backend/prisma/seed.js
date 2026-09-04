import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Insertion des données initiales...");

  // Créer les rôles système et métier
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { nomRole: "SUPER_ADMIN" },
      update: { isSystemRole: true, description: "Accès total au système" },
      create: {
        nomRole: "SUPER_ADMIN",
        description: "Accès total au système",
        isSystemRole: true,
      },
    }),
    prisma.role.upsert({
      where: { nomRole: "ADMIN" },
      update: { isSystemRole: true, description: "Gestion des données métier" },
      create: {
        nomRole: "ADMIN",
        description: "Gestion des données métier",
        isSystemRole: true,
      },
    }),
    prisma.role.upsert({
      where: { nomRole: "COMMERCIAL" },
      update: {
        isSystemRole: false,
        description: "Gestion des ventes et clients",
      },
      create: {
        nomRole: "COMMERCIAL",
        description: "Gestion des ventes et clients",
        isSystemRole: false,
      },
    }),
    prisma.role.upsert({
      where: { nomRole: "ACHETEUR" },
      update: { isSystemRole: false, description: "Gestion des achats" },
      create: {
        nomRole: "ACHETEUR",
        description: "Gestion des achats",
        isSystemRole: false,
      },
    }),
    prisma.role.upsert({
      where: { nomRole: "GESTIONNAIRE_STOCK" },
      update: { isSystemRole: false, description: "Gestion des stocks" },
      create: {
        nomRole: "GESTIONNAIRE_STOCK",
        description: "Gestion des stocks",
        isSystemRole: false,
      },
    }),
    prisma.role.upsert({
      where: { nomRole: "COMPTABLE" },
      update: { isSystemRole: false, description: "Gestion financière" },
      create: {
        nomRole: "COMPTABLE",
        description: "Gestion financière",
        isSystemRole: false,
      },
    }),
    prisma.role.upsert({
      where: { nomRole: "DIRECTEUR" },
      update: {
        isSystemRole: false,
        description: "Consultation tableau de bord",
      },
      create: {
        nomRole: "DIRECTEUR",
        description: "Consultation tableau de bord",
        isSystemRole: false,
      },
    }),
  ]);

  console.log(`✅ ${roles.length} rôles créés`);

  // Créer les permissions
  const permissionsData = [
    { module: "users", action: "lire" },
    { module: "users", action: "creer" },
    { module: "users", action: "modifier" },
    { module: "users", action: "supprimer" },
    { module: "roles", action: "lire" },
    { module: "roles", action: "creer" },
    { module: "roles", action: "modifier" },
    { module: "categories", action: "lire" },
    { module: "categories", action: "creer" },
    { module: "categories", action: "modifier" },
    { module: "categories", action: "supprimer" },
    { module: "produits", action: "lire" },
    { module: "produits", action: "creer" },
    { module: "produits", action: "modifier" },
    { module: "produits", action: "supprimer" },
    { module: "clients", action: "lire" },
    { module: "clients", action: "creer" },
    { module: "clients", action: "modifier" },
    { module: "fournisseurs", action: "lire" },
    { module: "fournisseurs", action: "creer" },
    { module: "fournisseurs", action: "modifier" },
    { module: "stocks", action: "lire" },
    { module: "stocks", action: "ajuster" },
    { module: "stocks", action: "inventaire" },
    { module: "achats", action: "lire" },
    { module: "achats", action: "creer" },
    { module: "achats", action: "valider" },
    { module: "achats", action: "receptionner" },
    { module: "ventes", action: "lire" },
    { module: "ventes", action: "creer" },
    { module: "ventes", action: "valider" },
    { module: "ventes", action: "livrer" },
    { module: "factures", action: "lire" },
    { module: "factures", action: "creer" },
    { module: "factures", action: "avoir" },
    { module: "factures", action: "envoyer" },
    { module: "paiements", action: "lire" },
    { module: "paiements", action: "creer" },
    { module: "rapports", action: "lire" },
    { module: "rapports", action: "exporter" },
    { module: "dashboard", action: "lire" },
    { module: "ia", action: "lire" },
    { module: "ia", action: "chat" },
    { module: "ia", action: "rapport" },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { module_action: { module: perm.module, action: perm.action } },
      update: {},
      create: perm,
    });
  }

  console.log(`✅ ${permissionsData.length} permissions créées`);

  const permissions = await prisma.permission.findMany();
  const permissionByKey = new Map(
    permissions.map((permission) => [
      `${permission.module}:${permission.action}`,
      permission,
    ]),
  );
  const roleByName = new Map(roles.map((role) => [role.nomRole, role]));

  const rolePermissions = {
    SUPER_ADMIN: permissionsData.map(
      (permission) => `${permission.module}:${permission.action}`,
    ),
    ADMIN: permissionsData.map(
      (permission) => `${permission.module}:${permission.action}`,
    ),
    COMMERCIAL: [
      "dashboard:lire",
      "categories:lire",
      "produits:lire",
      "clients:lire",
      "clients:creer",
      "clients:modifier",
      "ventes:lire",
      "ventes:creer",
      "ventes:valider",
      "ventes:livrer",
      "factures:lire",
      "factures:envoyer",
      "paiements:lire",
      "rapports:lire",
      "ia:lire",
      "ia:chat",
    ],
    ACHETEUR: [
      "dashboard:lire",
      "categories:lire",
      "produits:lire",
      "fournisseurs:lire",
      "fournisseurs:creer",
      "fournisseurs:modifier",
      "stocks:lire",
      "achats:lire",
      "achats:creer",
      "achats:valider",
      "achats:receptionner",
      "rapports:lire",
    ],
    GESTIONNAIRE_STOCK: [
      "dashboard:lire",
      "categories:lire",
      "produits:lire",
      "stocks:lire",
      "stocks:ajuster",
      "stocks:inventaire",
      "achats:lire",
      "achats:receptionner",
      "ventes:lire",
      "ventes:livrer",
      "rapports:lire",
    ],
    COMPTABLE: [
      "dashboard:lire",
      "clients:lire",
      "fournisseurs:lire",
      "factures:lire",
      "factures:creer",
      "factures:avoir",
      "factures:envoyer",
      "paiements:lire",
      "paiements:creer",
      "rapports:lire",
      "rapports:exporter",
    ],
    DIRECTEUR: [
      "dashboard:lire",
      "categories:lire",
      "produits:lire",
      "clients:lire",
      "fournisseurs:lire",
      "stocks:lire",
      "achats:lire",
      "ventes:lire",
      "factures:lire",
      "paiements:lire",
      "rapports:lire",
      "rapports:exporter",
      "ia:lire",
      "ia:chat",
      "ia:rapport",
    ],
  };

  for (const [roleName, permissionKeys] of Object.entries(rolePermissions)) {
    const role = roleByName.get(roleName);
    if (!role) continue;

    await prisma.rolePermission.deleteMany({ where: { idRole: role.id } });

    const links = permissionKeys
      .map((key) => permissionByKey.get(key))
      .filter(Boolean)
      .map((permission) => ({
        idRole: role.id,
        idPermission: permission.id,
      }));

    if (links.length > 0) {
      await prisma.rolePermission.createMany({
        data: links,
        skipDuplicates: true,
      });
    }
  }

  console.log("✅ Permissions associées aux rôles");

  // Créer le compte Super Admin
  const superAdminRole = await prisma.role.findUnique({
    where: { nomRole: "SUPER_ADMIN" },
  });
  const hash = await bcrypt.hash("Admin@1234", 12);

  await prisma.utilisateur.upsert({
    where: { email: "armandchristian85@gmail.com" },
    update: {
      nom: "Admin",
      prenom: "Système",
      passwordHash: hash,
      statut: "ACTIF",
      failedAttempts: 0,
      lockedUntil: null,
      idRole: superAdminRole.id,
    },
    create: {
      nom: "Admin",
      prenom: "Système",
      email: "armandchristian85@gmail.com",
      passwordHash: hash,
      statut: "ACTIF",
      idRole: superAdminRole.id,
    },
  });

  console.log(
    "✅ Compte admin créé : armandchristian85@gmail.com / Admin@1234",
  );

  const defaultUserPassword = "User@1234";
  const defaultUserHash = await bcrypt.hash(defaultUserPassword, 12);
  const usersData = [
    {
      nom: "Armando",
      prenom: "Christiano",
      email: "armandchristian41@gmail.com",
      role: "ADMIN",
      telephone: "+237690000001",
    },
    {
      nom: "Benali",
      prenom: "Karim",
      email: "k.benali@acerp.fr",
      role: "COMMERCIAL",
      telephone: "+237690000002",
    },
    {
      nom: "Haddad",
      prenom: "Nadia",
      email: "n.haddad@acerp.fr",
      role: "ACHETEUR",
      telephone: "+237690000003",
    },
    {
      nom: "Lefevre",
      prenom: "Marc",
      email: "m.lefevre@acerp.fr",
      role: "GESTIONNAIRE_STOCK",
      telephone: "+237690000004",
    },
    {
      nom: "Dubois",
      prenom: "Léa",
      email: "l.dubois@acerp.fr",
      role: "COMPTABLE",
      telephone: "+237690000005",
    },
    {
      nom: "Kamdem",
      prenom: "Claire",
      email: "c.kamdem@acerp.fr",
      role: "DIRECTEUR",
      telephone: "+237690000006",
    },
  ];

  for (const user of usersData) {
    const role = roleByName.get(user.role);
    await prisma.utilisateur.upsert({
      where: { email: user.email },
      update: {
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        passwordHash: defaultUserHash,
        statut: "ACTIF",
        failedAttempts: 0,
        lockedUntil: null,
        idRole: role.id,
      },
      create: {
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        passwordHash: defaultUserHash,
        statut: "ACTIF",
        idRole: role.id,
      },
    });
  }

  console.log(
    `✅ ${usersData.length} utilisateurs métiers créés : mot de passe ${defaultUserPassword}`,
  );
  console.log("\n🎉 Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
