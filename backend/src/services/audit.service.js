import prisma from "../config/database.js";
import logger from "../utils/logger.js";

export async function logAction({ userId, action, module, entityId, oldValues, newValues, ipAddress, userAgent }) {
  try {
    await prisma.auditLog.create({
      data: {
        idUtilisateur: userId || null,
        action,
        module,
        entityId,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    logger.warn(`Audit ignore: ${error.message}`);
  }
}

