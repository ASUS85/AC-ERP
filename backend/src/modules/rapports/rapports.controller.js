import { sendSuccess } from "../../utils/response.util.js";
import { rapportsService } from "./rapports.service.js";

function respond(res, data, format) {
  if (format === "excel") return res.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet").send(data);
  if (format === "pdf") return res.type("application/pdf").send(data);
  return sendSuccess(res, data, "Rapport genere");
}

export const rapportsController = {
  async ventes(req, res, next) { try { return respond(res, await rapportsService.ventes(req.query), req.query.format); } catch (e) { next(e); } },
  async achats(req, res, next) { try { return respond(res, await rapportsService.achats(req.query), req.query.format); } catch (e) { next(e); } },
  async stocks(req, res, next) { try { return respond(res, await rapportsService.stocks(req.query), req.query.format); } catch (e) { next(e); } },
  async balanceClients(req, res, next) { try { return respond(res, await rapportsService.balanceClients(req.query), req.query.format); } catch (e) { next(e); } },
  async balanceFournisseurs(req, res, next) { try { return respond(res, await rapportsService.balanceFournisseurs(req.query), req.query.format); } catch (e) { next(e); } },
};

