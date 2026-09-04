import { sendSuccess } from "../../utils/response.util.js";
import { usersService } from "./users.service.js";

export const usersController = {
  async list(req, res, next) {
    try {
      const result = await usersService.list(req.query, req.user);
      return sendSuccess(res, result.data, "Utilisateurs recuperes", result.meta);
    } catch (error) { next(error); }
  },
  async getById(req, res, next) {
    try { return sendSuccess(res, await usersService.getById(req.params.id, req.user), "Utilisateur recupere"); } catch (error) { next(error); }
  },
  async create(req, res, next) {
    try { return sendSuccess(res, await usersService.create(req.body, req.user), "Utilisateur cree", null, 201); } catch (error) { next(error); }
  },
  async update(req, res, next) {
    try { return sendSuccess(res, await usersService.update(req.params.id, req.body, req.user), "Utilisateur mis a jour"); } catch (error) { next(error); }
  },
  async remove(req, res, next) {
    try { return sendSuccess(res, await usersService.remove(req.params.id, req.user), "Utilisateur desactive"); } catch (error) { next(error); }
  },
  async debloquer(req, res, next) {
    try { return sendSuccess(res, await usersService.debloquer(req.params.id, req.user), "Utilisateur debloque"); } catch (error) { next(error); }
  },
};

