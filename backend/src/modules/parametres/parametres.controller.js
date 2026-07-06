import { sendSuccess } from "../../utils/response.util.js";
import { parametresService } from "./parametres.service.js";

const execute = (handler, message) => async (req, res, next) => {
  try { return sendSuccess(res, await handler(req), message); } catch (error) { next(error); }
};

export const parametresController = {
  entreprise: execute(() => parametresService.entreprise(), "Parametres entreprise recuperes"),
  updateEntreprise: execute((req) => parametresService.updateEntreprise(req.body), "Parametres entreprise modifies"),
  systeme: execute(() => parametresService.systeme(), "Parametres systeme recuperes"),
  updateSysteme: execute((req) => parametresService.updateSysteme(req.body), "Parametres systeme modifies"),
  maintenance: execute((req) => parametresService.maintenance(req.user.userId, req.body.active), "Mode maintenance modifie"),
  journal: execute((req) => parametresService.journal(req.query), "Journal recupere"),
};
