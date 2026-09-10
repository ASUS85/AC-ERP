import { sendSuccess } from "../../utils/response.util.js";
import { createCrudController } from "../_shared/controller.factory.js";
import { paiementsService } from "./paiements.service.js";

export const paiementsController = createCrudController(
  paiementsService,
  "Paiement",
);

paiementsController.kpis = async (req, res, next) => {
  try {
    return sendSuccess(
      res,
      await paiementsService.getKpis(),
      "KPI paiements recuperes",
    );
  } catch (error) {
    next(error);
  }
};
