import prisma from "../../config/database.js";

const include = { permissions: { include: { permission: true } } };

export const rolesRepository = {
  findMany(args = {}) { return prisma.role.findMany({ ...args, include }); },
  count(where = {}) { return prisma.role.count({ where }); },
  findById(id) { return prisma.role.findUnique({ where: { id }, include }); },
  create(data) { return prisma.role.create({ data, include }); },
  update(id, data) { return prisma.role.update({ where: { id }, data, include }); },
  delete(id) { return prisma.role.delete({ where: { id } }); },
  replacePermissions(idRole, permissionIds) {
    return prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { idRole } }),
      ...permissionIds.map((idPermission) => prisma.rolePermission.create({ data: { idRole, idPermission } })),
    ]);
  },
};

