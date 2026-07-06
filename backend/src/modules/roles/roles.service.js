import { ApiError } from "../../utils/response.util.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";
import { rolesRepository } from "./roles.repository.js";

export const rolesService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = query.search ? { nomRole: { contains: query.search } } : {};
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
  async getById(id) {
    const role = await rolesRepository.findById(id);
    if (!role) throw new ApiError(404, "NOT_FOUND", "Role introuvable");
    return role;
  },
  create(data) {
    return rolesRepository.create(data);
  },
  async update(id, data) {
    await this.getById(id);
    return rolesRepository.update(id, data);
  },
  async remove(id) {
    const role = await this.getById(id);
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
  async getPermissions(id) {
    return (await this.getById(id)).permissions;
  },
  async setPermissions(id, permissionIds) {
    await this.getById(id);
    await rolesRepository.replacePermissions(id, permissionIds || []);
    return this.getById(id);
  },
};
