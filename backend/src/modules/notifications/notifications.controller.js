import { sendSuccess } from "../../utils/response.util.js";
import { notificationsService } from "./notifications.service.js";

export const notificationsController = {
  async list(req, res, next) { try { return sendSuccess(res, await notificationsService.list(req.user.userId, req.query), "Notifications recuperees"); } catch (e) { next(e); } },
  async lire(req, res, next) { try { return sendSuccess(res, await notificationsService.lire(req.params.id, req.user.userId), "Notification lue"); } catch (e) { next(e); } },
  async toutLire(req, res, next) { try { return sendSuccess(res, await notificationsService.toutLire(req.user.userId), "Notifications lues"); } catch (e) { next(e); } },
};

