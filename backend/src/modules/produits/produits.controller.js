import { createCrudController } from "../_shared/controller.factory.js";
import { produitsService } from "./produits.service.js";

export const produitsController = createCrudController(
  produitsService,
  "Produit",
);
