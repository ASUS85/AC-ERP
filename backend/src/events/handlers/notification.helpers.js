import prisma from "../../config/database.js";
import logger from "../../utils/logger.js";
import { emitToUser } from "../../services/socket.service.js";

export async function notifyUsers(where, payload) {
  try {
    const users = await prisma.utilisateur.findMany({ where, select: { id: true } });
    await Promise.all(
      users.map(async (user) => {
        const notification = await prisma.notification.create({
          data: {
            idUtilisateur: user.id,
            typeNotif: payload.typeNotif,
            titre: payload.titre,
            message: payload.message,
            entityType: payload.entityType,
            entityId: payload.entityId,
          },
        });
        emitToUser(user.id, "notification", notification);
      }),
    );
  } catch (error) {
    logger.warn(`Notification event ignore: ${error.message}`);
  }
}

export const byPermission = (module, action) => ({
  role: {
    permissions: {
      some: {
        permission: { module, action },
      },
    },
  },
});

