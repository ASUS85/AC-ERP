import prisma from "../../config/database.js";
import { ApiError } from "../../utils/response.util.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";
import emitter from "../../events/emitter.js";
import { paiementsRepository } from "./paiements.repository.js";

const VALID_PAYMENT_MODES = new Set([
  "ESPECES",
  "CHEQUE",
  "VIREMENT",
  "MOBILE_MONEY",
  "CARTE",
  "COMPENSATION",
]);

export const paiementsService = {
  // ── Liste avec filtres et pagination standard ───────────────
  async list(query = {}) {
    const { page, limit, offset } = getPagination(query);

    const searchFilter = query.search?.trim()
      ? {
        OR: [
          { reference: { contains: query.search.trim() } },
          { notes: { contains: query.search.trim() } },
          { facture: { numeroFacture: { contains: query.search.trim() } } },
          { facture: { client: { nom: { contains: query.search.trim() } } } },
          { utilisateur: { nom: { contains: query.search.trim() } } },
        ],
      }
      : {};

    const modeFilter = query.modePaiement
      ? { modePaiement: query.modePaiement }
      : {};

    const factureFilter = query.idFacture ? { idFacture: query.idFacture } : {};

    const dateFilter = {};
    if (query.dateFrom) {
      const startDate = new Date(query.dateFrom);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(query.dateFrom);
      endDate.setHours(23, 59, 59, 999);
      
      dateFilter.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    } else if (query.dateTo) {
      dateFilter.createdAt = { lte: new Date(query.dateTo) };
    }

    const where = {
      ...searchFilter,
      ...modeFilter,
      ...factureFilter,
      ...dateFilter,
    };

    const [data, total] = await Promise.all([
      paiementsRepository.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: query.sort === "asc" ? "asc" : "desc" },
      }),
      paiementsRepository.count(where),
    ]);

    return { data, meta: buildMeta(total, page, limit) };
  },

  async getById(id) {
    const paiement = await paiementsRepository.findById(id);
    if (!paiement) {
      throw new ApiError(404, "NOT_FOUND", "Paiement introuvable");
    }
    return paiement;
  },

  // ── Enregistrement d'un nouveau paiement avec recalcul transactionnel ─
  async create(data, ctx = {}) {
    if (!data.idFacture) {
      throw new ApiError(400, "INVOICE_REQUIRED", "L'identifiant de la facture est obligatoire");
    }

    const montant = Number(data.montant);
    if (!Number.isFinite(montant) || montant <= 0) {
      throw new ApiError(400, "INVALID_AMOUNT", "Le montant du paiement doit être supérieur à zéro");
    }

    const modePaiement = data.modePaiement || "ESPECES";
    if (!VALID_PAYMENT_MODES.has(modePaiement)) {
      throw new ApiError(400, "INVALID_PAYMENT_MODE", "Le mode de paiement est invalide");
    }

    return prisma.$transaction(async (tx) => {
      const facture = await tx.facture.findUnique({
        where: { id: data.idFacture },
        include: { paiements: true, client: true },
      });

      if (!facture) {
        throw new ApiError(404, "INVOICE_NOT_FOUND", "Facture introuvable");
      }

      if (facture.statut === "ANNULEE") {
        throw new ApiError(400, "INVOICE_CANCELLED", "Impossible d'enregistrer un paiement sur une facture annulée");
      }

      if (facture.statut === "SOLDEE") {
        throw new ApiError(400, "INVOICE_ALREADY_PAID", "Cette facture est déjà totalement soldée");
      }

      const dejaPaye = facture.paiements.reduce(
        (sum, p) => sum + Number(p.montant || 0),
        0,
      );
      const totalTtc = Number(facture.totalTtc || 0);
      const resteAPayer = Math.max(0, totalTtc - dejaPaye);

      if (montant > resteAPayer) {
        throw new ApiError(
          400,
          "PAYMENT_EXCEEDS_REMAINDER",
          `Le montant du paiement (${montant.toLocaleString("fr-FR")} FCFA) ne peut pas dépasser le reste à payer (${resteAPayer.toLocaleString("fr-FR")} FCFA).`,
        );
      }

      const paiementCree = await tx.paiement.create({
        data: {
          idFacture: data.idFacture,
          idUtilisateur: ctx.user?.userId || facture.idUtilisateur,
          montant,
          modePaiement,
          datePaiement: data.datePaiement ? new Date(data.datePaiement) : new Date(),
          reference: data.reference ? String(data.reference).trim() : null,
          notes: data.notes ? String(data.notes).trim() : null,
        },
        include: {
          utilisateur: {
            select: { id: true, nom: true, prenom: true },
          },
        },
      });

      const nouveauTotalPaye = dejaPaye + montant;
      const nouveauStatut =
        nouveauTotalPaye >= totalTtc
          ? "SOLDEE"
          : nouveauTotalPaye > 0
            ? "PARTIELLEMENT_PAYEE"
            : "EMISE";

      const factureMaj = await tx.facture.update({
        where: { id: data.idFacture },
        data: {
          montantPaye: nouveauTotalPaye,
          statut: nouveauStatut,
        },
        include: {
          client: true,
          paiements: true,
          lignes: true,
        },
      });

      emitter.emit("facture.crud", {
        action: "PAYMENT",
        idFacture: facture.id,
        numeroFacture: facture.numeroFacture,
      });

      emitter.emit("paiement.recu", {
        idPaiement: paiementCree.id,
        idFacture: facture.id,
        montant,
        idClient: facture.idClient,
      });

      return {
        paiement: paiementCree,
        facture: factureMaj,
        resteAPayer: Math.max(0, totalTtc - nouveauTotalPaye),
      };
    });
  },
};
