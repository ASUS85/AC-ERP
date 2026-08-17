import dayjs from "dayjs";
import { ApiError } from "../../utils/response.util.js";
import {
  generateNumeroBCC,
  generateNumeroDevis,
  generateNumeroBL,
  generateNumeroFacture,
} from "../../services/numero.service.js";
import emitter from "../../events/emitter.js";
import { sendDevisEmail } from "../../services/email.service.js";
import { buildDevisPdf } from "../../services/devis-document.service.js";
import {
  publicApiBaseUrl,
  signDevisClientToken,
  verifyDevisClientToken,
} from "../../services/public-link.service.js";
import { parametresRepository } from "../parametres/parametres.repository.js";
import { ventesRepository } from "./ventes.repository.js";

function lineAmounts(l) {
  const montantHt =
    Number(l.quantite) *
    Number(l.prixUnitaireHt) *
    (1 - Number(l.remise || 0) / 100);
  const montantTva = montantHt * (Number(l.tauxTva || 18) / 100);
  return { ...l, montantHt, montantTva, montantTtc: montantHt + montantTva };
}

function totals(lignes = []) {
  return lignes.reduce(
    (a, l) => ({
      totalHt: a.totalHt + l.montantHt,
      totalTva: a.totalTva + l.montantTva,
      totalTtc: a.totalTtc + l.montantTtc,
    }),
    { totalHt: 0, totalTva: 0, totalTtc: 0 },
  );
}

const CLIENT_TYPES = new Set(["ENREGISTRE", "OCCASIONNEL"]);
const PAYMENT_MODES = new Set([
  "ESPECES",
  "CHEQUE",
  "VIREMENT",
  "MOBILE_MONEY",
  "CARTE",
  "COMPENSATION",
]);

const OCCASIONAL_INFO_MARKER = "[[OCCASIONNEL_INFO]]";

function requirePositiveNumber(value, code, message) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw new ApiError(400, code, message);
  }
  return number;
}

export const ventesService = {
  getDevis() {
    return ventesRepository.devis({ orderBy: { createdAt: "desc" } });
  },
  getDevisById(id) {
    return ventesRepository.devisById(id);
  },
  async createDevis(data, ctx) {
    const lignes = (data.lignes || []).map(lineAmounts);
    return ventesRepository.createDevis({
      numeroDevis: await generateNumeroDevis(),
      idClient: data.idClient,
      idUtilisateur: ctx.user.userId,
      dateValidite: data.dateValidite
        ? new Date(data.dateValidite)
        : dayjs().add(30, "day").toDate(),
      conditions: data.conditions,
      ...totals(lignes),
      lignes: { create: lignes },
    });
  },
  async envoyerDevis(id) {
    const devis = await ventesRepository.devisById(id);
    if (!devis) throw new ApiError(404, "NOT_FOUND", "Devis introuvable");
    if (!devis.client?.email)
      throw new ApiError(
        400,
        "CLIENT_EMAIL_REQUIRED",
        "Le client n'a pas d'adresse email",
      );

    const token = signDevisClientToken(id);
    const downloadUrl = `${publicApiBaseUrl()}/ventes/public/devis/telecharger?token=${encodeURIComponent(token)}`;
    await sendDevisEmail(
      devis.client.email,
      devis.client.nom,
      devis,
      downloadUrl,
    );
    return ventesRepository.updateDevis(id, { statut: "ENVOYE" });
  },
  async telechargerDevisPublic(token) {
    let payload;
    try {
      payload = verifyDevisClientToken(token);
    } catch {
      throw new ApiError(
        400,
        "INVALID_PUBLIC_LINK",
        "Lien de telechargement invalide ou expire",
      );
    }
    const devis = await ventesRepository.devisById(payload.idDevis);
    if (!devis) throw new ApiError(404, "NOT_FOUND", "Devis introuvable");
    const entreprise = await parametresRepository.entreprise();
    return {
      filename: `${devis.numeroDevis}.pdf`,
      buffer: await buildDevisPdf(devis, entreprise),
    };
  },
  async convertirDevis(id, ctx) {
    const devis = await ventesRepository.devisById(id);
    if (!devis) throw new ApiError(404, "NOT_FOUND", "Devis introuvable");
    const lignes = devis.lignes.map((l) => ({
      idProduit: l.idProduit,
      designation: l.designation,
      quantite: l.quantite,
      prixUnitaireHt: l.prixUnitaireHt,
      remise: l.remise,
      tauxTva: l.tauxTva,
      montantHt: l.montantHt,
      montantTva: l.montantTva,
      montantTtc: l.montantTtc,
    }));
    const commande = await ventesRepository.createCommande({
      numeroBcc: await generateNumeroBCC(),
      idClient: devis.idClient,
      idUtilisateur: ctx.user.userId,
      idDevis: devis.id,
      totalHt: devis.totalHt,
      totalTva: devis.totalTva,
      totalTtc: devis.totalTtc,
      lignes: { create: lignes },
    });
    await ventesRepository.updateDevis(id, { statut: "CONVERTI" });
    return commande;
  },
  getCommandes() {
    return ventesRepository.commandes({ orderBy: { createdAt: "desc" } });
  },
  getCommande(id) {
    return ventesRepository.commandeById(id);
  },
  async createCommande(data, ctx) {
    const lignes = (data.lignes || []).map(lineAmounts);
    return ventesRepository.createCommande({
      numeroBcc: await generateNumeroBCC(),
      idClient: data.idClient,
      idUtilisateur: ctx.user.userId,
      ...totals(lignes),
      lignes: { create: lignes },
    });
  },
  async confirmerCommande(id) {
    const commande = await ventesRepository.updateCommande(id, {
      statut: "CONFIRME",
    });
    emitter.emit("commande.confirmee", { idCommande: id });
    return commande;
  },
  async creerLivraison(id, data, ctx) {
    const lignes = (data.lignes || []).map((l) => ({ ...l }));
    const livraison = await ventesRepository.createLivraison(
      id,
      ctx.user.userId,
      lignes,
    );
    livraison.numeroBl = livraison.numeroBl || (await generateNumeroBL());
    return livraison;
  },
  livraisons(id) {
    return ventesRepository.livraisons(id);
  },
  async createVenteDirecte(data, ctx) {
    const clientOccasionnelInfo = {
      nom: String(data.clientOccasionnelInfo?.nom || "").trim(),
      prenom: String(data.clientOccasionnelInfo?.prenom || "").trim(),
      sexe: String(data.clientOccasionnelInfo?.sexe || "").trim(),
      numeroCni: String(data.clientOccasionnelInfo?.numeroCni || "").trim(),
      telephone: String(data.clientOccasionnelInfo?.telephone || "").trim(),
    };
    const hasOccasionnelInfo = Object.values(clientOccasionnelInfo).some(
      (value) => value.length > 0,
    );

    const typeClient = data.typeClient || "OCCASIONNEL";
    if (!CLIENT_TYPES.has(typeClient)) {
      throw new ApiError(
        400,
        "INVALID_CLIENT_TYPE",
        "Le type de client est invalide",
      );
    }

    let idClient = null;
    if (typeClient === "ENREGISTRE") {
      if (!data.idClient) {
        throw new ApiError(
          400,
          "CLIENT_REQUIRED",
          "Le client est obligatoire pour une vente a client enregistre",
        );
      }
      const client = await ventesRepository.clientById(data.idClient);
      if (!client)
        throw new ApiError(404, "CLIENT_NOT_FOUND", "Client introuvable");
      idClient = data.idClient;
    }

    const requestedLines = Array.isArray(data.lignes) ? data.lignes : [];
    if (requestedLines.length === 0) {
      throw new ApiError(
        400,
        "SALE_LINES_REQUIRED",
        "La vente doit contenir au moins une ligne",
      );
    }

    const productIds = [
      ...new Set(requestedLines.map((line) => line.idProduit).filter(Boolean)),
    ];
    if (productIds.length !== requestedLines.length) {
      throw new ApiError(
        400,
        "PRODUCT_REQUIRED",
        "Chaque ligne de vente doit etre associee a un produit",
      );
    }

    const products = await ventesRepository.produitsByIds(productIds);
    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    const lignes = requestedLines.map((line) => {
      const product = productById.get(line.idProduit);
      if (!product) {
        throw new ApiError(404, "PRODUCT_NOT_FOUND", "Produit introuvable");
      }
      if (product.statut && product.statut !== "ACTIF") {
        throw new ApiError(
          400,
          "PRODUCT_NOT_ACTIVE",
          `${product.designation} n'est pas actif`,
        );
      }

      const quantite = Math.trunc(
        requirePositiveNumber(
          line.quantite,
          "INVALID_QUANTITY",
          `Quantite invalide pour ${product.designation}`,
        ),
      );
      const remise = Math.max(0, Number(line.remise || 0));
      const tauxTva = Number.isFinite(Number(line.tauxTva))
        ? Number(line.tauxTva)
        : Number(product.tauxTva || 0);
      return lineAmounts({
        idProduit: product.id,
        designation: product.designation,
        quantite,
        prixUnitaireHt: Number(product.prixVenteHt || 0),
        remise,
        tauxTva,
      });
    });

    const total = totals(lignes);
    const paidAmount = Number(data.paiement?.montant || 0);
    let paiement = null;
    if (paidAmount > 0) {
      const modePaiement = data.paiement?.modePaiement || "ESPECES";
      if (!PAYMENT_MODES.has(modePaiement)) {
        throw new ApiError(
          400,
          "INVALID_PAYMENT_MODE",
          "Le mode de paiement est invalide",
        );
      }
      if (paidAmount > total.totalTtc) {
        throw new ApiError(
          400,
          "PAYMENT_TOO_HIGH",
          "Le montant paye ne peut pas depasser le total TTC",
        );
      }
      paiement = {
        montant: paidAmount,
        modePaiement,
        reference: data.paiement?.reference || null,
        notes: data.paiement?.notes || "Paiement vente directe",
      };
    }

    const baseMentionLegale =
      data.mentionsLegales ||
      (idClient
        ? "Facture generee depuis une vente directe"
        : "Facture generee pour client occasionnel");

    const mentionAvecInfosOccasionnelles =
      !idClient && hasOccasionnelInfo
        ? `${baseMentionLegale}\n${OCCASIONAL_INFO_MARKER}${JSON.stringify(clientOccasionnelInfo)}`
        : baseMentionLegale;

    const facture = {
      numeroFacture: await generateNumeroFacture(),
      typeFacture: "VENTE",
      idClient,
      idUtilisateur: ctx.user.userId,
      dateEcheance: data.dateEcheance
        ? new Date(data.dateEcheance)
        : dayjs()
            .add(idClient ? 30 : 0, "day")
            .toDate(),
      statut: paiement && paidAmount >= total.totalTtc ? "SOLDEE" : "EMISE",
      ...total,
      montantPaye: paiement ? paidAmount : 0,
      mentionsLegales: mentionAvecInfosOccasionnelles,
    };

    const created = await ventesRepository.createVenteDirecteFacturee({
      facture,
      lignes,
      paiement,
      userId: ctx.user.userId,
    });

    emitter.emit("facture.crud", {
      action: "CREATE",
      idFacture: created.id,
      numeroFacture: created.numeroFacture,
    });
    emitter.emit("vente.directe", {
      idFacture: created.id,
      numeroFacture: created.numeroFacture,
      idClient,
      totalTtc: created.totalTtc,
    });

    return created;
  },
};
