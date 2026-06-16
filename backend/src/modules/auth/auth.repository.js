import prisma from "../../config/database.js";

const userInclude = {
  role: {
    include: {
      permissions: { include: { permission: true } },
    },
  },
};

export const authRepository = {
  findUserByEmail(email) {
    return prisma.utilisateur.findUnique({ where: { email }, include: userInclude });
  },
  findUserById(id) {
    return prisma.utilisateur.findUnique({ where: { id }, include: userInclude });
  },
  updateUser(id, data) {
    return prisma.utilisateur.update({ where: { id }, data, include: userInclude });
  },
  createRefreshToken(data) {
    return prisma.refreshToken.create({ data });
  },
  findRefreshToken(token) {
    return prisma.refreshToken.findUnique({ where: { token } });
  },
  revokeRefreshToken(token) {
    return prisma.refreshToken.update({ where: { token }, data: { isRevoked: true } });
  },
};

