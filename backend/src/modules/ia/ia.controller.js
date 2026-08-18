import { sendSuccess } from "../../utils/response.util.js";
import { iaService } from "./ia.service.js";

export const iaController = {
  async chat(req, res, next) {
    try {
      return sendSuccess(
        res,
        await iaService.chat({
          message: req.body.message,
          idConversation: req.body.idConversation,
          userId: req.user.userId,
        }),
        "Message traite",
      );
    } catch (error) {
      next(error);
    }
  },
  async getConversations(req, res, next) {
    try {
      return sendSuccess(
        res,
        await iaService.getConversations(req.user.userId),
        "Conversations recuperees",
      );
    } catch (error) {
      next(error);
    }
  },
  async getConversationMessages(req, res, next) {
    try {
      return sendSuccess(
        res,
        await iaService.getConversationMessages(req.params.id, req.user.userId),
        "Messages recuperes",
      );
    } catch (error) {
      next(error);
    }
  },
  async renameConversation(req, res, next) {
    try {
      return sendSuccess(
        res,
        await iaService.renameConversation(
          req.params.id,
          req.body.titre,
          req.user.userId,
        ),
        "Conversation renommee",
      );
    } catch (error) {
      next(error);
    }
  },
  async deleteConversation(req, res, next) {
    try {
      await iaService.deleteConversation(req.params.id, req.user.userId);
      return sendSuccess(res, null, "Conversation supprimee");
    } catch (error) {
      next(error);
    }
  },
  async genererRapport(req, res, next) {
    try {
      return sendSuccess(
        res,
        await iaService.genererRapport({
          ...req.body,
          userId: req.user.userId,
        }),
        "Rapport genere",
        null,
        201,
      );
    } catch (error) {
      next(error);
    }
  },
  async getRapports(req, res, next) {
    try {
      return sendSuccess(
        res,
        await iaService.getRapports(req.user.userId),
        "Rapports recuperes",
      );
    } catch (error) {
      next(error);
    }
  },
  async telechargerRapportPdf(req, res, next) {
    try {
      const pdf = await iaService.telechargerRapportPdf(
        req.params.id,
        req.user.userId,
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${pdf.filename}"`,
      );
      return res.send(pdf.buffer);
    } catch (error) {
      next(error);
    }
  },
  async getPrevisions(req, res, next) {
    try {
      return sendSuccess(
        res,
        await iaService.getPrevisions(req.user.userId),
        "Previsions recuperees",
      );
    } catch (error) {
      next(error);
    }
  },
  async getAlertesRupture(_req, res, next) {
    try {
      return sendSuccess(
        res,
        await iaService.getAlertesRupture(),
        "Alertes rupture recuperees",
      );
    } catch (error) {
      next(error);
    }
  },

  // Compatibilite des noms utilises par la version precedente.
  previsionsVentes(req, res, next) {
    return this.getPrevisions(req, res, next);
  },
  alertesRupture(req, res, next) {
    return this.getAlertesRupture(req, res, next);
  },
  conversations(req, res, next) {
    return this.getConversations(req, res, next);
  },
  rapports(req, res, next) {
    return this.getRapports(req, res, next);
  },
  rapportAuto(req, res, next) {
    return this.genererRapport(req, res, next);
  },
};
