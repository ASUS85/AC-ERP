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
  revokeRefreshTokensByUser(idUtilisateur) {
    return prisma.refreshToken.updateMany({
      where: { idUtilisateur, isRevoked: false },
      data: { isRevoked: true },
    });
  },
  revokeOtherRefreshTokens(idUtilisateur, currentToken) {
    return prisma.refreshToken.updateMany({
      where: { idUtilisateur, isRevoked: false, ...(currentToken ? { token: { not: currentToken } } : {}) },
      data: { isRevoked: true },
    });
  },
  listRefreshTokens(idUtilisateur) {
    return prisma.refreshToken.findMany({
      where: { idUtilisateur, isRevoked: false, expiresAt: { gt: new Date() } },
      select: { id: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: "desc" },
    });
  },
  createPasswordResetToken(data) {
    return prisma.passwordResetToken.create({ data });
  },
  findPasswordResetToken(tokenHash) {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { utilisateur: { include: userInclude } },
    });
  },
  markPasswordResetTokenUsed(id) {
    return prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
  },
  deletePendingPasswordResetTokens(idUtilisateur) {
    return prisma.passwordResetToken.deleteMany({
      where: {
        idUtilisateur,
        usedAt: null,
      },
    });
  },
};
