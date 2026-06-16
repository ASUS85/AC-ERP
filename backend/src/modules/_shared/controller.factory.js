import { sendSuccess } from "../../utils/response.util.js";

export function createCrudController(service, label = "Ressource") {
  return {
    async list(req, res, next) {
      try {
        const result = await service.list(req.query);
        return sendSuccess(res, result.data, `${label}s recuperes`, result.meta);
      } catch (error) {
        next(error);
      }
    },
    async getById(req, res, next) {
      try {
        return sendSuccess(res, await service.getById(req.params.id), `${label} recuperee`);
      } catch (error) {
        next(error);
      }
    },
    async create(req, res, next) {
      try {
        return sendSuccess(res, await service.create(req.body, { user: req.user }), `${label} creee`, null, 201);
      } catch (error) {
        next(error);
      }
    },
    async update(req, res, next) {
      try {
        return sendSuccess(res, await service.update(req.params.id, req.body, { user: req.user }), `${label} mise a jour`);
      } catch (error) {
        next(error);
      }
    },
    async remove(req, res, next) {
      try {
        return sendSuccess(res, await service.remove(req.params.id, { user: req.user }), `${label} supprimee`);
      } catch (error) {
        next(error);
      }
    },
  };
}

