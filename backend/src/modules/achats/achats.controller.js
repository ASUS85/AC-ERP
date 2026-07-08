import { sendSuccess } from "../../utils/response.util.js";
import { achatsService } from "./achats.service.js";

function supplierResponseHtml(title, message) {
  return `<!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { background:#f4f6f9; color:#0f172a; font-family:Arial,sans-serif; margin:0; padding:40px 16px; }
      main { background:#fff; border:1px solid #e5e7eb; border-radius:10px; margin:0 auto; max-width:560px; padding:28px; text-align:center; }
      h1 { font-size:22px; margin:0 0 12px; }
      p { color:#475569; line-height:1.6; margin:0; }
    </style>
  </head>
  <body><main><h1>${title}</h1><p>${message}</p></main></body>
  </html>`;
}

export const achatsController = {
  async getDemandes(req, res, next) {
    try {
      return sendSuccess(
        res,
        await achatsService.getDemandes(req.query),
        "Demandes recuperees",
      );
    } catch (e) {
      next(e);
    }
  },
  async createDemande(req, res, next) {
    try {
      return sendSuccess(
        res,
        await achatsService.createDemande(req.body, { user: req.user }),
        "Demande creee",
        null,
        201,
      );
    } catch (e) {
      next(e);
    }
  },
  async getDemande(req, res, next) {
    try {
      return sendSuccess(
        res,
        await achatsService.getDemande(req.params.id),
        "Demande recuperee",
      );
    } catch (e) {
      next(e);
    }
  },
  async validerDemande(req, res, next) {
    try {
      return sendSuccess(
        res,
        await achatsService.validerDemande(req.params.id, { user: req.user }),
        "Demande validée",
      );
    } catch (e) {
      next(e);
    }
  },
  async getBonsCommande(req, res, next) {
    try {
      return sendSuccess(
        res,
        await achatsService.getBonsCommande(req.query),
        "BCF recuperés",
      );
    } catch (e) {
      next(e);
    }
  },
  async createBonCommande(req, res, next) {
    try {
      return sendSuccess(
        res,
        await achatsService.createBonCommande(req.body, { user: req.user }),
        "BCF cree",
        null,
        201,
      );
    } catch (e) {
      next(e);
    }
  },
  async getBonCommande(req, res, next) {
    try {
      return sendSuccess(
        res,
        await achatsService.getBonCommande(req.params.id),
        "BCF recuperé",
      );
    } catch (e) {
      next(e);
    }
  },
  async envoyerBonCommande(req, res, next) {
    try {
      return sendSuccess(
        res,
        await achatsService.envoyerBonCommande(req.params.id),
        "BCF envoyé",
      );
    } catch (e) {
      next(e);
    }
  },
  async fournisseurValider(req, res, next) {
    try {
      const result = await achatsService.reponseFournisseur(
        req.query.token,
        "accept",
      );
      if (result.action === "already_processed") {
        return res
          .type("html")
          .send(
            supplierResponseHtml(
              "Commande déja traitée",
              `Le bon de commande ${result.bonCommande.numeroBcf} a deja été traité. Aucune nouvelle action n'a été effectuée.`,
            ),
          );
      }
      return res
        .type("html")
        .send(
          supplierResponseHtml(
            "Commande validée",
            `Le bon de commande ${result.bonCommande.numeroBcf} a été validé. Merci pour votre confirmation.`,
          ),
        );
    } catch (e) {
      next(e);
    }
  },
  async fournisseurRefuser(req, res, next) {
    try {
      const result = await achatsService.reponseFournisseur(
        req.query.token,
        "reject",
      );
      if (result.action === "already_processed") {
        return res
          .type("html")
          .send(
            supplierResponseHtml(
              "Commande déjà traitée",
              `Le bon de commande ${result.bonCommande.numeroBcf} a déja été traité. Aucune nouvelle action n'a été effectuée.`,
            ),
          );
      }
      return res
        .type("html")
        .send(
          supplierResponseHtml(
            "Commande refusée",
            `Le bon de commande ${result.bonCommande.numeroBcf} a été refusé. Notre équipe achats en tiendra compte.`,
          ),
        );
    } catch (e) {
      next(e);
    }
  },
  async fournisseurTelecharger(req, res, next) {
    try {
      const pdf = await achatsService.telechargerBonCommandePublic(
        req.query.token,
      );
      res.type("application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${pdf.filename}"`,
      );
      return res.send(pdf.buffer);
    } catch (e) {
      next(e);
    }
  },
  async reception(req, res, next) {
    try {
      return sendSuccess(
        res,
        await achatsService.reception(req.params.id, req.body, {
          user: req.user,
        }),
        "Reception enregistree",
      );
    } catch (e) {
      next(e);
    }
  },
};
