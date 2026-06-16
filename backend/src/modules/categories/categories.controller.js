import { createCrudController } from "../_shared/controller.factory.js";
import { sendSuccess } from "../../utils/response.util.js";
import { categoriesService } from "./categories.service.js";

export const categoriesController = {
  ...createCrudController(categoriesService, "Categorie"),
  async arbre(_req, res, next) {
    try { return sendSuccess(res, await categoriesService.arbre(), "Arborescence recuperee"); } catch (e) { next(e); }
  },
};

