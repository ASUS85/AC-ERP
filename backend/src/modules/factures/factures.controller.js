import { sendSuccess } from "../../utils/response.util.js";
import { facturesService } from "./factures.service.js";

export const facturesController = {
  async list(req, res, next) { try { const r = await facturesService.list(req.query); return sendSuccess(res, r.data, "Factures recuperees", r.meta); } catch (e) { next(e); } },
  async create(req, res, next) { try { return sendSuccess(res, await facturesService.create(req.body, { user: req.user }), "Facture creee", null, 201); } catch (e) { next(e); } },
  async getById(req, res, next) { try { return sendSuccess(res, await facturesService.getById(req.params.id), "Facture recuperee"); } catch (e) { next(e); } },
  async pdf(req, res, next) { try { const pdf = await facturesService.pdf(req.params.id); res.type("application/pdf"); return res.send(pdf); } catch (e) { next(e); } },
  async envoyer(req, res, next) { try { return sendSuccess(res, await facturesService.envoyer(req.params.id), "Facture envoyee"); } catch (e) { next(e); } },
  async avoir(req, res, next) { try { return sendSuccess(res, await facturesService.avoir(req.params.id, req.body, { user: req.user }), "Avoir cree"); } catch (e) { next(e); } },
  async impayees(req, res, next) { try { return sendSuccess(res, await facturesService.impayees(req.query), "Factures impayees recuperees"); } catch (e) { next(e); } },
};

