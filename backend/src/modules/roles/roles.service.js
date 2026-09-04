import prisma from "../../config/database.js";
import { ApiError } from "../../utils/response.util.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";
import { rolesRepository } from "./roles.repository.js";

async function resolveConnectedRole(userOrContext) {
  const user = userOrContext?.user || userOrContext;
  if (!user) return null;
  if (user.role?.nomRole) return user.role;
  if (user.nomRole) return user;

  const roleId = user.roleId || user.idRole || user.role?.id;
  if (roleId) {
    const role = await rolesRepository.findById(roleId);
    if (role) return role;
  }

  const userId = user.id || user.userId;
  if (userId) {
    const dbUser = await prisma.utilisateur.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (dbUser?.role) return dbUser.role;
  }

  return null;
}

function canAccessRole(connectedRole, targetRole) {
  if (!targetRole) return false;
  const targetRoleNom = targetRole.nomRole;
  const targetIsSystem = targetRole.isSystemRole;

  // SUPER_ADMIN : voit tous les rôles, y compris ADMIN et SUPER_ADMIN
  if (connectedRole?.nomRole === "SUPER_ADMIN") {
    return true;
  }

  // ADMIN : ne doit jamais voir le SUPER_ADMIN, mais peut voir et gérer ADMIN et les autres
  if (connectedRole?.nomRole === "ADMIN") {
    return targetRoleNom !== "SUPER_ADMIN";
  }

  // Les autres rôles : ne doivent jamais voir SUPER_ADMIN ni ADMIN (rôles système)
  return !targetIsSystem && targetRoleNom !== "SUPER_ADMIN" && targetRoleNom !== "ADMIN";
}

export const rolesService = {
  async list(query, currentUser) {
    const { page, limit, offset } = getPagination(query);
    const connectedRole = await resolveConnectedRole(currentUser);

    const conditions = [];

    if (query.search) {
      conditions.push({
        nomRole: { contains: query.search },
      });
    }

    if (connectedRole?.nomRole === "SUPER_ADMIN") {
      // SUPER_ADMIN voit tous les rôles sans restriction
    } else if (connectedRole?.nomRole === "ADMIN") {
      // ADMIN ne doit jamais voir le rôle SUPER_ADMIN
      conditions.push({
        nomRole: { not: "SUPER_ADMIN" },
      });
    } else {
      // Les autres rôles ne doivent jamais voir SUPER_ADMIN ni ADMIN
      conditions.push({
        isSystemRole: false,
        nomRole: { notIn: ["SUPER_ADMIN", "ADMIN"] },
      });
    }

    const where =
      conditions.length === 0
        ? {}
        : conditions.length === 1
        ? conditions[0]
        : { AND: conditions };

    const [data, total] = await Promise.all([
      rolesRepository.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      rolesRepository.count(where),
    ]);
    return { data, meta: buildMeta(total, page, limit) };
  },
  async getById(id, currentUser) {
    const role = await rolesRepository.findById(id);
    if (!role) throw new ApiError(404, "NOT_FOUND", "Role introuvable");

    if (currentUser) {
      const connectedRole = await resolveConnectedRole(currentUser);
      if (!canAccessRole(connectedRole, role)) {
        throw new ApiError(404, "NOT_FOUND", "Role introuvable");
      }
    }

    return role;
  },
  async create(data, currentUser) {
    if (!data?.nomRole?.trim()) {
      throw new ApiError(400, "VALIDATION_ERROR", "Le nom du rôle est obligatoire", {
        nomRole: "Le nom du rôle est obligatoire",
      });
    }

    const roleName = String(data.nomRole).trim().toUpperCase();

    if (currentUser) {
      const connectedRole = await resolveConnectedRole(currentUser);
      if (connectedRole?.nomRole !== "SUPER_ADMIN") {
        if (roleName === "SUPER_ADMIN" || data.isSystemRole) {
          throw new ApiError(
            403,
            "FORBIDDEN",
            "Vous n'avez pas l'autorisation de créer ce rôle",
          );
        }
        if (connectedRole?.nomRole !== "ADMIN" && roleName === "ADMIN") {
          throw new ApiError(
            403,
            "FORBIDDEN",
            "Vous n'avez pas l'autorisation de créer ce rôle",
          );
        }
      }
    }

    return rolesRepository.create(data);
  },
  async update(id, data, currentUser) {
    await this.getById(id, currentUser);

    if (currentUser) {
      const connectedRole = await resolveConnectedRole(currentUser);
      if (connectedRole?.nomRole !== "SUPER_ADMIN") {
        if (data.nomRole && String(data.nomRole).trim().toUpperCase() === "SUPER_ADMIN") {
          throw new ApiError(
            403,
            "FORBIDDEN",
            "Vous n'avez pas l'autorisation d'attribuer ce nom de rôle",
          );
        }
      }
    }

    return rolesRepository.update(id, data);
  },
  async remove(id, currentUser) {
    const role = await this.getById(id, currentUser);
    if (role.isSystemRole)
      throw new ApiError(
        400,
        "SYSTEM_ROLE",
        "Impossible de supprimer un role systeme",
      );
    return rolesRepository.delete(id);
  },
  async listPermissions() {
    return rolesRepository.listPermissions();
  },
  async getPermissions(id, currentUser) {
    return (await this.getById(id, currentUser)).permissions;
  },
  async setPermissions(id, permissionIds, currentUser) {
    await this.getById(id, currentUser);
    await rolesRepository.replacePermissions(id, permissionIds || []);
    return this.getById(id, currentUser);
  },
};
