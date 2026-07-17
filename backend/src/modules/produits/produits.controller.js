import { createCrudController } from "../_shared/controller.factory.js";
import { sendSuccess } from "../../utils/response.util.js";
import { produitsService } from "./produits.service.js";

export const produitsController = {
  ...createCrudController(produitsService, "Produit"),
  async exportPdf(req, res, next) {
    try {
      const pdf = await produitsService.exportPdf(req.query);
      res.type("application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${pdf.filename}"`,
      );
      return res.send(pdf.buffer);
    } catch (error) {
      next(error);
    }
  },
};
