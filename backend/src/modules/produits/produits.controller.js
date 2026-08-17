import { createCrudController } from "../_shared/controller.factory.js";
import { ApiError, sendSuccess } from "../../utils/response.util.js";
import { produitsService } from "./produits.service.js";

export const produitsController = {
  ...createCrudController(produitsService, "Produit"),
  async uploadPhoto(req, res, next) {
    try {
      if (!req.file) {
        throw new ApiError(400, "PHOTO_REQUIRED", "Aucun fichier photo fourni");
      }
      return sendSuccess(
        res,
        { photo: `/uploads/${req.file.filename}` },
        "Photo produit importee",
      );
    } catch (error) {
      next(error);
    }
  },
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
