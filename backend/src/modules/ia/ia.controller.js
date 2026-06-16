import { sendSuccess } from "../../utils/response.util.js";
import { iaService } from "./ia.service.js";

export const iaController = {
  async previsionsVentes(req, res, next) { try { return sendSuccess(res, await iaService.previsionsVentes(req.query), "Previsions recuperees"); } catch (e) { next(e); } },
  async alertesRupture(_req, res, next) { try { return sendSuccess(res, await iaService.alertesRupture(), "Alertes rupture recuperees"); } catch (e) { next(e); } },
  async chat(req, res, next) { try { return sendSuccess(res, await iaService.chat(req.body.message, req.body.idConversation, { user: req.user }), "Message traite"); } catch (e) { next(e); } },
  async conversations(req, res, next) { try { return sendSuccess(res, await iaService.conversations({ user: req.user }), "Conversations recuperees"); } catch (e) { next(e); } },
  async rapports(req, res, next) { try { return sendSuccess(res, await iaService.rapports({ user: req.user }), "Rapports IA recuperes"); } catch (e) { next(e); } },
  async rapportAuto(req, res, next) { try { return sendSuccess(res, await iaService.rapportAuto(req.body, { user: req.user }), "Rapport programme", null, 202); } catch (e) { next(e); } },
};

