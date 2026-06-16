import { sendSuccess } from "../../utils/response.util.js";
import { paiementsService } from "./paiements.service.js";

export const paiementsController = {
  async list(req, res, next) { try { const r = await paiementsService.list(req.query); return sendSuccess(res, r.data, "Paiements recuperes", r.meta); } catch (e) { next(e); } },
  async create(req, res, next) { try { return sendSuccess(res, await paiementsService.create(req.body, { user: req.user }), "Paiement cree", null, 201); } catch (e) { next(e); } },
  async getById(req, res, next) { try { return sendSuccess(res, await paiementsService.getById(req.params.id), "Paiement recupere"); } catch (e) { next(e); } },
};

