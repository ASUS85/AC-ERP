import { createCrudController } from "../_shared/controller.factory.js";
import { paiementsService } from "./paiements.service.js";

export const paiementsController = createCrudController(
  paiementsService,
  "Paiement",
);
