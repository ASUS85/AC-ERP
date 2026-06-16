import { sendSuccess } from "../../utils/response.util.js";
import { achatsService } from "./achats.service.js";

export const achatsController = {
  async getDemandes(req, res, next) { try { return sendSuccess(res, await achatsService.getDemandes(req.query), "Demandes recuperees"); } catch (e) { next(e); } },
  async createDemande(req, res, next) { try { return sendSuccess(res, await achatsService.createDemande(req.body, { user: req.user }), "Demande creee", null, 201); } catch (e) { next(e); } },
  async getDemande(req, res, next) { try { return sendSuccess(res, await achatsService.getDemande(req.params.id), "Demande recuperee"); } catch (e) { next(e); } },
  async validerDemande(req, res, next) { try { return sendSuccess(res, await achatsService.validerDemande(req.params.id, { user: req.user }), "Demande validee"); } catch (e) { next(e); } },
  async getBonsCommande(req, res, next) { try { return sendSuccess(res, await achatsService.getBonsCommande(req.query), "BCF recuperes"); } catch (e) { next(e); } },
  async createBonCommande(req, res, next) { try { return sendSuccess(res, await achatsService.createBonCommande(req.body, { user: req.user }), "BCF cree", null, 201); } catch (e) { next(e); } },
  async getBonCommande(req, res, next) { try { return sendSuccess(res, await achatsService.getBonCommande(req.params.id), "BCF recupere"); } catch (e) { next(e); } },
  async envoyerBonCommande(req, res, next) { try { return sendSuccess(res, await achatsService.envoyerBonCommande(req.params.id), "BCF envoye"); } catch (e) { next(e); } },
  async reception(req, res, next) { try { return sendSuccess(res, await achatsService.reception(req.params.id, req.body, { user: req.user }), "Reception enregistree"); } catch (e) { next(e); } },
};

