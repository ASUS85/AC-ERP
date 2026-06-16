import { sendSuccess } from "../../utils/response.util.js";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  async kpis(_req, res, next) { try { return sendSuccess(res, await dashboardService.kpis(), "KPIs recuperes"); } catch (e) { next(e); } },
  async evolutionVentes(_req, res, next) { try { return sendSuccess(res, await dashboardService.evolutionVentes(), "Evolution des ventes recuperee"); } catch (e) { next(e); } },
  async topProduits(_req, res, next) { try { return sendSuccess(res, await dashboardService.topProduits(), "Top produits recupere"); } catch (e) { next(e); } },
  async topClients(_req, res, next) { try { return sendSuccess(res, await dashboardService.topClients(), "Top clients recupere"); } catch (e) { next(e); } },
  async repartitionCategories(_req, res, next) { try { return sendSuccess(res, await dashboardService.repartitionCategories(), "Repartition categories recuperee"); } catch (e) { next(e); } },
};

