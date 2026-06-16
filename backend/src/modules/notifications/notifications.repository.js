import prisma from "../../config/database.js";

export const notificationsRepository = {
  findForUser(idUtilisateur, where = {}) {
    return prisma.notification.findMany({ where: { idUtilisateur, ...where }, orderBy: { createdAt: "desc" } });
  },
  markRead(id, idUtilisateur) {
    return prisma.notification.updateMany({ where: { id, idUtilisateur }, data: { isLue: true } });
  },
  markAllRead(idUtilisateur) {
    return prisma.notification.updateMany({ where: { idUtilisateur, isLue: false }, data: { isLue: true } });
  },
};
