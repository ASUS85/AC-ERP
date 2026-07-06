import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import prisma from "../../config/database.js";
import { ApiError } from "../../utils/response.util.js";
import { BCRYPT_ROUNDS } from "../../config/constants.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";
import { sendWelcomeEmail } from "../../services/email.service.js";
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

export const usersService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = query.search
      ? {
          OR: [
            { nom: { contains: query.search } },
            { prenom: { contains: query.search } },
            { email: { contains: query.search } },
          ],
        }
      : {};

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
  async getById(id) {
    const user = await usersRepository.findById(id);
    if (!user) throw new ApiError(404, "NOT_FOUND", "Utilisateur introuvable");
    return user;
  },
  async create(data) {
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
    if (role.isSystemRole) {
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
      sendWelcomeEmail(user.email, user.nom, motDePasseTemp).catch(() => {});
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
  async update(id, data) {
    await this.getById(id);
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
    if (role.isSystemRole) {
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
  async remove(id) {
    await this.getById(id);
    return usersRepository.update(id, { statut: "INACTIF" });
  },
  async debloquer(id) {
    await this.getById(id);
    return usersRepository.update(id, {
      failedAttempts: 0,
      lockedUntil: null,
      statut: "ACTIF",
    });
  },
};
