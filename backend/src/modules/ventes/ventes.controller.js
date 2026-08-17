import { sendSuccess } from "../../utils/response.util.js";
import { ventesService } from "./ventes.service.js";

export const ventesController = {
  async telechargerDevisPublic(req, res, next) {
    try {
      const file = await ventesService.telechargerDevisPublic(req.query.token);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
      return res.send(file.buffer);
    } catch (e) { next(e); }
  },
  async getDevis(req, res, next) { try { return sendSuccess(res, await ventesService.getDevis(req.query), "Devis recuperes"); } catch (e) { next(e); } },
  async createDevis(req, res, next) { try { return sendSuccess(res, await ventesService.createDevis(req.body, { user: req.user }), "Devis cree", null, 201); } catch (e) { next(e); } },
  async getDevisById(req, res, next) { try { return sendSuccess(res, await ventesService.getDevisById(req.params.id), "Devis recupere"); } catch (e) { next(e); } },
  async envoyerDevis(req, res, next) { try { return sendSuccess(res, await ventesService.envoyerDevis(req.params.id), "Devis envoye"); } catch (e) { next(e); } },
  async convertirDevis(req, res, next) { try { return sendSuccess(res, await ventesService.convertirDevis(req.params.id, { user: req.user }), "Devis converti"); } catch (e) { next(e); } },
  async getCommandes(req, res, next) { try { return sendSuccess(res, await ventesService.getCommandes(req.query), "Commandes recuperees"); } catch (e) { next(e); } },
  async createCommande(req, res, next) { try { return sendSuccess(res, await ventesService.createCommande(req.body, { user: req.user }), "Commande creee", null, 201); } catch (e) { next(e); } },
  async getCommande(req, res, next) { try { return sendSuccess(res, await ventesService.getCommande(req.params.id), "Commande recuperee"); } catch (e) { next(e); } },
  async confirmerCommande(req, res, next) { try { return sendSuccess(res, await ventesService.confirmerCommande(req.params.id), "Commande confirmee"); } catch (e) { next(e); } },
  async creerLivraison(req, res, next) { try { return sendSuccess(res, await ventesService.creerLivraison(req.params.id, req.body, { user: req.user }), "Livraison creee"); } catch (e) { next(e); } },
  async livraisons(req, res, next) { try { return sendSuccess(res, await ventesService.livraisons(req.params.id), "Livraisons recuperees"); } catch (e) { next(e); } },
  async createVenteDirecte(req, res, next) { try { return sendSuccess(res, await ventesService.createVenteDirecte(req.body, { user: req.user }), "Vente facturee", null, 201); } catch (e) { next(e); } },
};
