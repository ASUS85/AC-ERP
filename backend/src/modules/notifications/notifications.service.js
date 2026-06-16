import { notificationsRepository } from "./notifications.repository.js";

export const notificationsService = {
  list(userId, query) {
    const where = query.isLue === undefined ? {} : { isLue: query.isLue === "true" || query.isLue === true };
    return notificationsRepository.findForUser(userId, where);
  },
  lire(id, userId) { return notificationsRepository.markRead(id, userId); },
  toutLire(userId) { return notificationsRepository.markAllRead(userId); },
};

