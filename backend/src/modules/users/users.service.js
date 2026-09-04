import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import prisma from "../../config/database.js";
import { ApiError } from "../../utils/response.util.js";
import { BCRYPT_ROUNDS } from "../../config/constants.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";
import { sendWelcomeEmail } from "../../services/email.service.js";
import { parametresRepository } from "../parametres/parametres.repository.js";
import { usersRepository } from "./users.repository.js";

function normalizeUserPayload(data) {
  const { motDePasseTemp, passwordHash, ...rest } = data || {};
  return rest;
}

function buildUserErrors(data) {
  const errors = {};
  if (!String(data.nom || "").trim()) errors.nom = "Le nom est obligatoire";
  if (!String(data.prenom || "").trim())
    errors.prenom = "Le prénom est obligatoire";
  if (!String(data.email || "").trim())
    errors.email = "L’email est obligatoire";
  if (!String(data.idRole || "").trim())
    errors.idRole = "Le rôle est obligatoire";
  return errors;
}

async function resolveConnectedRole(userOrContext) {
  const user = userOrContext?.user || userOrContext;
  if (!user) return null;
  if (user.role?.nomRole) return user.role;
  if (user.nomRole) return user;

  const roleId = user.roleId || user.idRole || user.role?.id;
  if (roleId) {
    const role = await usersRepository.findRoleById(roleId);
    if (role) return role;
  }

  const userId = user.id || user.userId;
  if (userId) {
    const dbUser = await usersRepository.findById(userId);
    if (dbUser?.role) return dbUser.role;
  }

  return null;
}

function canAccessUser(connectedRole, targetUser) {
  if (!targetUser) return false;
  const targetRoleNom = targetUser.role?.nomRole;
  const targetIsSystem = targetUser.role?.isSystemRole;

  if (connectedRole?.nomRole === "SUPER_ADMIN") {
    return true;
  }

  if (connectedRole?.nomRole === "ADMIN") {
    return targetRoleNom !== "SUPER_ADMIN";
  }

  return (
    !targetIsSystem &&
    targetRoleNom !== "SUPER_ADMIN" &&
    targetRoleNom !== "ADMIN"
  );
}

function canAssignRole(connectedRole, targetRole) {
  if (!targetRole) return false;
  const targetRoleNom = targetRole.nomRole;
  const targetIsSystem = targetRole.isSystemRole;

  if (connectedRole?.nomRole === "SUPER_ADMIN") {
    return true;
  }

  if (connectedRole?.nomRole === "ADMIN") {
    return targetRoleNom !== "SUPER_ADMIN";
  }

  return (
    !targetIsSystem &&
    targetRoleNom !== "SUPER_ADMIN" &&
    targetRoleNom !== "ADMIN"
  );
}

export const usersService = {
  async list(query, currentUser) {
    const { page, limit, offset } = getPagination(query);
    const connectedRole = await resolveConnectedRole(currentUser);

    const conditions = [];

    if (query.search) {
      conditions.push({
        OR: [
          { nom: { contains: query.search } },
          { prenom: { contains: query.search } },
          { email: { contains: query.search } },
        ],
      });
    }

    if (connectedRole?.nomRole === "SUPER_ADMIN") {
    } else if (connectedRole?.nomRole === "ADMIN") {
      conditions.push({
        role: { nomRole: { not: "SUPER_ADMIN" } },
      });
    } else {
      conditions.push({
        role: {
          isSystemRole: false,
          nomRole: { notIn: ["SUPER_ADMIN", "ADMIN"] },
        },
      });
    }

    const where =
      conditions.length === 0
        ? {}
        : conditions.length === 1
          ? conditions[0]
          : { AND: conditions };

    const [data, total] = await Promise.all([
      usersRepository.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      usersRepository.count(where),
    ]);
    return { data, meta: buildMeta(total, page, limit) };
  },
  async getById(id, currentUser) {
    const user = await usersRepository.findById(id);
    if (!user) throw new ApiError(404, "NOT_FOUND", "Utilisateur introuvable");

    if (currentUser) {
      const connectedRole = await resolveConnectedRole(currentUser);
      if (!canAccessUser(connectedRole, user)) {
        throw new ApiError(404, "NOT_FOUND", "Utilisateur introuvable");
      }
    }

    return user;
  },
  async create(data, currentUser) {
    const errors = buildUserErrors(data);
    if (Object.keys(errors).length) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Veuillez corriger les champs obligatoires",
        errors,
      );
    }

    const existing = await usersRepository.findByEmail(
      String(data.email).trim().toLowerCase(),
    );
    if (existing)
      throw new ApiError(
        409,
        "DUPLICATE_EMAIL",
        "Cet email est déjà utilisé par un autre utilisateur",
        { email: "Cet email est déjà utilisé par un autre utilisateur" },
      );

    const role = await usersRepository.findRoleById(data.idRole);
    if (!role)
      throw new ApiError(
        400,
        "INVALID_ROLE",
        "Le rôle sélectionné est introuvable",
      );

    if (currentUser) {
      const connectedRole = await resolveConnectedRole(currentUser);
      if (!canAssignRole(connectedRole, role)) {
        throw new ApiError(
          403,
          "FORBIDDEN",
          "Vous n'avez pas l'autorisation d'assigner ce rôle",
        );
      }
    }

    if (role.nomRole === "SUPER_ADMIN") {
      const existingSystemAdmin = await prisma.utilisateur.count({
        where: { idRole: role.id },
      });
      if (existingSystemAdmin > 0) {
        throw new ApiError(
          400,
          "SYSTEM_ROLE_LIMIT",
          "Un seul utilisateur peut avoir ce rôle",
        );
      }
    }

    const motDePasseTemp = data.motDePasseTemp || randomUUID().slice(0, 12);
    const passwordHash = await bcrypt.hash(motDePasseTemp, BCRYPT_ROUNDS);
    const payload = {
      ...normalizeUserPayload(data),
      email: String(data.email).trim().toLowerCase(),
      nom: String(data.nom).trim(),
      prenom: String(data.prenom).trim(),
      telephone: data.telephone ? String(data.telephone).trim() : null,
      passwordHash,
      statut: data.statut || "ACTIF",
    };

    try {
      const user = await usersRepository.create(payload);
      // Inclut le lien vers la plateforme d'échange (paramètres entreprise)
      parametresRepository
        .entreprise()
        .then((entreprise) =>
          sendWelcomeEmail(
            user.email,
            user.nom,
            motDePasseTemp,
            entreprise?.lienPlateformeEchange || null,
          ),
        )
        .catch(() => {});
      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ApiError(
          409,
          "DUPLICATE_EMAIL",
          "Cet email est déjà utilisé par un autre utilisateur",
        );
      }
      throw error;
    }
  },
  async update(id, data, currentUser) {
    await this.getById(id, currentUser);
    const errors = buildUserErrors(data);
    if (Object.keys(errors).length) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Veuillez corriger les champs obligatoires",
        errors,
      );
    }

    const existing = await usersRepository.findByEmail(
      String(data.email).trim().toLowerCase(),
    );
    if (existing && existing.id !== id) {
      throw new ApiError(
        409,
        "DUPLICATE_EMAIL",
        "Cet email est déjà utilisé par un autre utilisateur",
        { email: "Cet email est déjà utilisé par un autre utilisateur" },
      );
    }

    const role = await usersRepository.findRoleById(data.idRole);
    if (!role)
      throw new ApiError(
        400,
        "INVALID_ROLE",
        "Le rôle sélectionné est introuvable",
      );

    if (currentUser) {
      const connectedRole = await resolveConnectedRole(currentUser);
      if (!canAssignRole(connectedRole, role)) {
        throw new ApiError(
          403,
          "FORBIDDEN",
          "Vous n'avez pas l'autorisation d'assigner ce rôle",
        );
      }
    }

    if (role.nomRole === "SUPER_ADMIN") {
      const existingSystemAdmin = await prisma.utilisateur.count({
        where: { idRole: role.id, id: { not: id } },
      });
      if (existingSystemAdmin > 0) {
        throw new ApiError(
          400,
          "SYSTEM_ROLE_LIMIT",
          "Un seul utilisateur peut avoir ce rôle",
        );
      }
    }

    const payload = {
      ...normalizeUserPayload(data),
      email: String(data.email).trim().toLowerCase(),
      nom: String(data.nom).trim(),
      prenom: String(data.prenom).trim(),
      telephone: data.telephone ? String(data.telephone).trim() : null,
      statut: data.statut || "ACTIF",
    };

    return usersRepository.update(id, payload);
  },
  async remove(id, currentUser) {
    await this.getById(id, currentUser);
    return usersRepository.update(id, { statut: "INACTIF" });
  },
  async debloquer(id, currentUser) {
    await this.getById(id, currentUser);
    return usersRepository.update(id, {
      failedAttempts: 0,
      lockedUntil: null,
      statut: "ACTIF",
    });
  },
};
