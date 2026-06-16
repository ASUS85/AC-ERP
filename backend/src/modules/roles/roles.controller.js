import { sendSuccess } from "../../utils/response.util.js";
import { rolesService } from "./roles.service.js";

export const rolesController = {
  async list(req, res, next) { try { const r = await rolesService.list(req.query); return sendSuccess(res, r.data, "Roles recuperes", r.meta); } catch (e) { next(e); } },
  async getById(req, res, next) { try { return sendSuccess(res, await rolesService.getById(req.params.id), "Role recupere"); } catch (e) { next(e); } },
  async create(req, res, next) { try { return sendSuccess(res, await rolesService.create(req.body), "Role cree", null, 201); } catch (e) { next(e); } },
  async update(req, res, next) { try { return sendSuccess(res, await rolesService.update(req.params.id, req.body), "Role mis a jour"); } catch (e) { next(e); } },
  async remove(req, res, next) { try { return sendSuccess(res, await rolesService.remove(req.params.id), "Role supprime"); } catch (e) { next(e); } },
  async permissions(req, res, next) { try { return sendSuccess(res, await rolesService.getPermissions(req.params.id), "Permissions recuperees"); } catch (e) { next(e); } },
  async setPermissions(req, res, next) { try { return sendSuccess(res, await rolesService.setPermissions(req.params.id, req.body.permissionIds), "Permissions mises a jour"); } catch (e) { next(e); } },
};

