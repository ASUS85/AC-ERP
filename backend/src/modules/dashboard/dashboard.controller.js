import { sendSuccess } from "../../utils/response.util.js";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  async overview(_req, res, next) {
    try {
      return sendSuccess(
        res,
        await dashboardService.overview(),
        "Dashboard recupere",
      );
    } catch (error) {
      next(error);
    }
  },

  async kpis(_req, res, next) {
    try {
      return sendSuccess(res, await dashboardService.kpis(), "KPIs recuperes");
    } catch (error) {
      next(error);
    }
  },

  async evolutionVentes(req, res, next) {
    try {
      return sendSuccess(
        res,
        await dashboardService.evolutionVentes(
          Number(req.query.annee) || undefined,
        ),
        "Evolution des ventes recuperee",
      );
    } catch (error) {
      next(error);
    }
  },

  async topProduits(_req, res, next) {
    try {
      return sendSuccess(
        res,
        await dashboardService.topProduits(),
        "Top produits recupere",
      );
    } catch (error) {
      next(error);
    }
  },

  async topClients(_req, res, next) {
    try {
      return sendSuccess(
        res,
        await dashboardService.topClients(),
        "Top clients recupere",
      );
    } catch (error) {
      next(error);
    }
  },

  async repartitionCategories(_req, res, next) {
    try {
      return sendSuccess(
        res,
        await dashboardService.repartitionCategories(),
        "Repartition categories recuperee",
      );
    } catch (error) {
      next(error);
    }
  },

  async statistiquesGlobales(_req, res, next) {
    try {
      return sendSuccess(
        res,
        await dashboardService.statistiquesGlobales(),
        "Statistiques globales recuperees",
      );
    } catch (error) {
      next(error);
    }
  },

  async exportPdf(_req, res, next) {
    try {
      const pdf = await dashboardService.exportPdf();
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
