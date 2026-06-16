import { createCrudController } from "../_shared/controller.factory.js";
import { sendSuccess } from "../../utils/response.util.js";
import { clientsService } from "./clients.service.js";

export const clientsController = {
  ...createCrudController(clientsService, "Client"),
  async historique(req, res, next) {
    try { return sendSuccess(res, await clientsService.historique(req.params.id), "Historique client recupere"); } catch (e) { next(e); }
  },
};

