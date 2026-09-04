import { sendSuccess } from "../../utils/response.util.js";
import { rolesService } from "./roles.service.js";

export const rolesController = {
  async list(req, res, next) {
    try {
      const r = await rolesService.list(req.query, req.user);
      return sendSuccess(res, r.data, "Roles recuperes", r.meta);
    } catch (e) {
      next(e);
    }
  },
  async getById(req, res, next) {
    try {
      return sendSuccess(
        res,
        await rolesService.getById(req.params.id, req.user),
        "Role recupere",
      );
    } catch (e) {
      next(e);
    }
  },
  async create(req, res, next) {
    try {
      return sendSuccess(
        res,
        await rolesService.create(req.body, req.user),
        "Role cree",
        null,
        201,
      );
    } catch (e) {
      next(e);
    }
  },
  async update(req, res, next) {
    try {
      return sendSuccess(
        res,
        await rolesService.update(req.params.id, req.body, req.user),
        "Role mis a jour",
      );
    } catch (e) {
      next(e);
    }
  },
  async remove(req, res, next) {
    try {
      return sendSuccess(
        res,
        await rolesService.remove(req.params.id, req.user),
        "Role supprime",
      );
    } catch (e) {
      next(e);
    }
  },
  async permissionsCatalog(req, res, next) {
    try {
      return sendSuccess(
        res,
        await rolesService.listPermissions(),
        "Permissions disponibles",
      );
    } catch (e) {
      next(e);
    }
  },
  async permissions(req, res, next) {
    try {
      return sendSuccess(
        res,
        await rolesService.getPermissions(req.params.id, req.user),
        "Permissions recuperees",
      );
    } catch (e) {
      next(e);
    }
  },
  async setPermissions(req, res, next) {
    try {
      return sendSuccess(
        res,
        await rolesService.setPermissions(
          req.params.id,
          req.body.permissionIds,
          req.user,
        ),
        "Permissions mises a jour",
      );
    } catch (e) {
      next(e);
    }
  },
};
