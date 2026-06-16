import { sendSuccess } from "../../utils/response.util.js";
import { stocksService } from "./stocks.service.js";

export const stocksController = {
  async list(req, res, next) { try { const r = await stocksService.list(req.query); return sendSuccess(res, r.data, "Stocks recuperes", r.meta); } catch (e) { next(e); } },
  async alertes(req, res, next) { try { return sendSuccess(res, await stocksService.alertes(req.query), "Alertes stock recuperees"); } catch (e) { next(e); } },
  async mouvements(req, res, next) { try { const r = await stocksService.mouvements(req.query); return sendSuccess(res, r.data, "Mouvements recuperes", r.meta); } catch (e) { next(e); } },
  async ajustement(req, res, next) { try { return sendSuccess(res, await stocksService.ajustement(req.body, { user: req.user }), "Stock ajuste", null, 201); } catch (e) { next(e); } },
  async inventaires(req, res, next) { try { return sendSuccess(res, await stocksService.inventaires(req.query), "Inventaires recuperes"); } catch (e) { next(e); } },
  async createInventaire(req, res, next) { try { return sendSuccess(res, await stocksService.createInventaire(req.body, { user: req.user }), "Inventaire cree", null, 201); } catch (e) { next(e); } },
  async inventaireById(req, res, next) { try { return sendSuccess(res, await stocksService.inventaireById(req.params.id), "Inventaire recupere"); } catch (e) { next(e); } },
  async validerInventaire(req, res, next) { try { return sendSuccess(res, await stocksService.validerInventaire(req.params.id, { user: req.user }), "Inventaire valide"); } catch (e) { next(e); } },
};

