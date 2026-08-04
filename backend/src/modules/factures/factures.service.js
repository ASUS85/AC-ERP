import dayjs from "dayjs";
import { ApiError } from "../../utils/response.util.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";
import {
  generateNumeroAvoir,
  generateNumeroFacture,
} from "../../services/numero.service.js";
import { sendFactureEmail } from "../../services/email.service.js";
import { buildFacturePdf } from "../../services/facture-document.service.js";
import { parametresRepository } from "../parametres/parametres.repository.js";
import emitter from "../../events/emitter.js";
import { facturesRepository } from "./factures.repository.js";

export const facturesService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = query.statut ? { statut: query.statut } : {};
    const [data, total] = await Promise.all([
      facturesRepository.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      facturesRepository.count(where),
    ]);
    return { data, meta: buildMeta(total, page, limit) };
  },

  async getById(id) {
    const facture = await facturesRepository.findById(id);
    if (!facture) throw new ApiError(404, "NOT_FOUND", "Facture introuvable");
    return facture;
  },

  async create(data, ctx) {
    const created = await facturesRepository.create({
      numeroFacture: await generateNumeroFacture(),
      typeFacture: data.typeFacture || "VENTE",
      idClient: data.idClient,
      idFournisseur: data.idFournisseur,
      idBl: data.idBl,
      idUtilisateur: ctx.user.userId,
      dateEcheance: data.dateEcheance
        ? new Date(data.dateEcheance)
        : dayjs().add(30, "day").toDate(),
      totalHt: data.totalHt || 0,
      totalTva: data.totalTva || 0,
      totalTtc: data.totalTtc || 0,
      mentionsLegales: data.mentionsLegales,
      lignes: { create: data.lignes || [] },
    });

    emitter.emit("facture.crud", {
      action: "CREATE",
      idFacture: created.id,
      numeroFacture: created.numeroFacture,
    });

    return created;
  },

  async pdf(id) {
    const facture = await this.getById(id);
    const entreprise = await parametresRepository.entreprise();
    return buildFacturePdf(facture, entreprise);
  },

  async envoyer(id) {
    const facture = await this.getById(id);
    const destinataireEmail =
      facture.client?.email || facture.fournisseur?.email || null;
    const destinataireNom =
      facture.client?.nom || facture.fournisseur?.raisonSociale || "Client";

    if (!destinataireEmail) {
      throw new ApiError(
        400,
        "INVOICE_RECIPIENT_EMAIL_REQUIRED",
        "Aucune adresse email disponible pour l'envoi de la facture",
      );
    }

    const entreprise = await parametresRepository.entreprise();
    const pdfBuffer = await buildFacturePdf(facture, entreprise);

    await sendFactureEmail(
      destinataireEmail,
      destinataireNom,
      facture.numeroFacture,
      pdfBuffer,
    );

    if (facture.statut === "BROUILLON") {
      await facturesRepository.update(facture.id, { statut: "EMISE" });
    }

    emitter.emit("facture.crud", {
      action: "SEND",
      idFacture: facture.id,
      numeroFacture: facture.numeroFacture,
    });

    return {
      envoye: true,
      facture: facture.numeroFacture,
      destinataire: destinataireEmail,
    };
  },

  async avoir(id, data, ctx) {
    const facture = await this.getById(id);

    const created = await facturesRepository.createAvoir({
      numeroAvoir: await generateNumeroAvoir(),
      idFacture: id,
      idUtilisateur: ctx.user.userId,
      motif: data.motif || "Avoir facture",
      totalHt: data.totalHt || facture.totalHt,
      totalTtc: data.totalTtc || facture.totalTtc,
      lignes: { create: data.lignes || [] },
    });

    emitter.emit("facture.crud", {
      action: "CREDIT_NOTE",
      idFacture: facture.id,
      numeroFacture: facture.numeroFacture,
    });

    return created;
  },

  impayees() {
    return facturesRepository.findMany({
      where: {
        statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "EN_RETARD"] },
      },
      orderBy: { dateEcheance: "asc" },
    });
  },
};
