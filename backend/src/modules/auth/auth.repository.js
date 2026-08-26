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
  createSession(data) {
    return prisma.session.create({ data });
  },
  findSession(id) {
    return prisma.session.findUnique({ where: { id } });
  },
  touchSession(id) {
    return prisma.session.update({ where: { id }, data: { lastSeenAt: new Date() } });
  },
  deleteSession(id) {
    return prisma.session.delete({ where: { id } });
  },
  deleteSessionsByUser(userId) {
    return prisma.session.deleteMany({ where: { userId } });
  },
  deleteOtherSessions(userId, sessionId) {
    return prisma.session.deleteMany({
      where: { userId, id: { not: sessionId } },
    });
  },
  listSessions(userId) {
    return prisma.session.findMany({
      where: { userId },
      select: { id: true, createdAt: true, lastSeenAt: true, userAgent: true, ipAddress: true },
      orderBy: { lastSeenAt: "desc" },
    });
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
