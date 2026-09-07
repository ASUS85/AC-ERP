import prisma from "../../config/database.js";

const include = { permissions: { include: { permission: true } } };

export const rolesRepository = {
  findMany(args = {}) {
    return prisma.role.findMany({ ...args, include });
  },
  count(where = {}) {
    return prisma.role.count({ where });
  },
  findById(id) {
    return prisma.role.findUnique({ where: { id }, include });
  },
  create(data) {
    return prisma.role.create({ data, include });
  },
  update(id, data) {
    return prisma.role.update({ where: { id }, data, include });
  },
  delete(id) {
    return prisma.role.delete({ where: { id } });
  },
  listPermissions() {
    return prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { action: "asc" }],
    });
  },
  replacePermissions(idRole, permissionIds) {
    return prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { idRole } });
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((idPermission) => ({
            idRole,
            idPermission,
          })),
          skipDuplicates: true,
        });
      }
    });
  },
};
