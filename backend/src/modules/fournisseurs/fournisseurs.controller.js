import { createCrudController } from "../_shared/controller.factory.js";
import { fournisseursService } from "./fournisseurs.service.js";

export const fournisseursController = createCrudController(
  fournisseursService,
  "Fournisseur",
);
