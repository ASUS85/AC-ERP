import prisma from "../../config/database.js";

const include = { role: true };
const omitPassword = { passwordHash: false };

export const usersRepository = {
  findMany(args = {}) {
    return prisma.utilisateur.findMany({
      ...args,
      include,
      omit: omitPassword,
    });
  },
  count(where = {}) {
    return prisma.utilisateur.count({ where });
  },
  findById(id) {
    return prisma.utilisateur.findUnique({
      where: { id },
      include,
      omit: omitPassword,
    });
  },
  findByEmail(email) {
    return prisma.utilisateur.findUnique({
      where: { email },
      include,
      omit: omitPassword,
    });
  },
  findRawById(id) {
    return prisma.utilisateur.findUnique({ where: { id }, include });
  },
  findRoleById(id) {
    return prisma.role.findUnique({ where: { id } });
  },
  create(data) {
    return prisma.utilisateur.create({ data, include, omit: omitPassword });
  },
  update(id, data) {
    return prisma.utilisateur.update({
      where: { id },
      data,
      include,
      omit: omitPassword,
    });
  },
};
