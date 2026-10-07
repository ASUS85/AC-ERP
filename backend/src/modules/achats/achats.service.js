import {
  generateNumeroBCF,
  generateNumeroDA,
  generateNumeroFacture,
} from "../../services/numero.service.js";
import {
  sendBonCommandeAnnuleeEmail,
  sendBonCommandeFournisseurEmail,
} from "../../services/email.service.js";
import { buildBcfPdf } from "../../services/bcf-document.service.js";
import {
  publicApiBaseUrl,
  signBcfSupplierToken,
  verifyBcfSupplierToken,
} from "../../services/public-link.service.js";
import emitter from "../../events/emitter.js";
import { ApiError } from "../../utils/response.util.js";
import { parametresRepository } from "../parametres/parametres.repository.js";
import { achatsRepository } from "./achats.repository.js";

function totals(lignes = []) {
  return lignes.reduce(
    (acc, l) => {
      const ht =
        Number(l.quantiteCommandee || l.quantite || 0) *
        Number(l.prixUnitaireHt || 0) *
        (1 - Number(l.remise || 0) / 100);
      const tva = ht * (Number(l.tauxTva || 18) / 100);
      acc.totalHt += ht;
      acc.totalTva += tva;
      acc.totalTtc += ht + tva;
      return acc;
    },
    { totalHt: 0, totalTva: 0, totalTtc: 0 },
  );
}

const ALLOWED_TRANSITIONS = {
  SUBMIT: { from: ["BROUILLON"], to: "SOUMIS" },
  VALIDATE: { from: ["SOUMIS"], to: "VALIDE" },
  BACK_TO_DRAFT: { from: ["SOUMIS"], to: "BROUILLON" },
  CANCEL: { from: ["BROUILLON", "SOUMIS", "VALIDE", "ENVOYE"], to: "ANNULE" },
};

const ALLOWED_IMPORT_DECISIONS = new Set(["VALIDER", "REJETER"]);
const VALID_PAYMENT_MODES = new Set([
  "ESPECES",
  "CHEQUE",
  "VIREMENT",
  "MOBILE_MONEY",
  "CARTE",
  "COMPENSATION",
]);

function parseImportMetadata(mentionsLegales = "") {
  const lines = String(mentionsLegales)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const metadata = {};
  for (const line of lines) {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) continue;
    metadata[key.trim()] = rest.join(":").trim();
  }
  return metadata;
}

function parseReceptionIdsFromMetadata(metadata = {}) {
  const raw = metadata["Reception IDs"] || "";
  return String(raw)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function facturedReceptionIdsFromInvoices(invoices = []) {
  const ids = new Set();
  for (const invoice of invoices) {
    if (invoice.statut === "ANNULEE") continue;
    const metadata = parseImportMetadata(invoice.mentionsLegales || "");
    const decision = String(metadata.Decision || "VALIDER").toUpperCase();
    if (decision === "REJETER") continue;
    for (const receptionId of parseReceptionIdsFromMetadata(metadata)) {
      ids.add(receptionId);
    }
  }
  return ids;
}

function normalizeReceptionIdsInput(value) {
  if (Array.isArray(value)) {
    return value.map((id) => String(id).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return normalizeReceptionIdsInput(parsed);
    } catch {
      // Keep comma-separated form support for multipart forms.
    }
    return trimmed
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }
  return [];
}

function round2(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function buildImportedInvoiceLines(bonCommande) {
  const fromReceived = (bonCommande.lignes || [])
    .map((ligne) => {
      const quantite = Number(ligne.quantiteRecue || 0);
      if (quantite <= 0) return null;
      const prixUnitaire = Number(ligne.prixUnitaireHt || 0);
      const remise = Number(ligne.remise || 0);
      const montantHt = quantite * prixUnitaire * (1 - remise / 100);
      const tauxTva = Number(ligne.produit?.tauxTva || 18);
      const montantTva = montantHt * (tauxTva / 100);
      const montantTtc = montantHt + montantTva;
      return {
        idProduit: ligne.idProduit,
        designation: ligne.produit?.designation || "Produit",
        quantite,
        prixUnitaireHt: prixUnitaire,
        remise,
        tauxTva,
        montantHt,
        montantTva,
        montantTtc,
      };
    })
    .filter(Boolean);

  if (fromReceived.length > 0) return fromReceived;

  return (bonCommande.lignes || [])
    .map((ligne) => {
      const quantite = Number(ligne.quantiteCommandee || 0);
      if (quantite <= 0) return null;
      const prixUnitaire = Number(ligne.prixUnitaireHt || 0);
      const remise = Number(ligne.remise || 0);
      const montantHt = quantite * prixUnitaire * (1 - remise / 100);
      const tauxTva = Number(ligne.produit?.tauxTva || 18);
      const montantTva = montantHt * (tauxTva / 100);
      const montantTtc = montantHt + montantTva;
      return {
        idProduit: ligne.idProduit,
        designation: ligne.produit?.designation || "Produit",
        quantite,
        prixUnitaireHt: prixUnitaire,
        remise,
        tauxTva,
        montantHt,
        montantTva,
        montantTtc,
      };
    })
    .filter(Boolean);
}

function buildImportedInvoiceFromReceptions(bonCommande, receptionIds) {
  const selectedIds = new Set(receptionIds);
  const productLinesById = new Map(
    (bonCommande.lignes || []).map((ligne) => [ligne.id, ligne]),
  );

  const selectedReceptions = (bonCommande.receptions || []).filter((reception) =>
    selectedIds.has(reception.id),
  );

  const linesByProduct = new Map();
  for (const reception of selectedReceptions) {
    for (const receptionLine of reception.lignes || []) {
      const bcfLine = productLinesById.get(receptionLine.idLigneBcf);
      if (!bcfLine) continue;
      const key = bcfLine.idProduit;
      const quantity = Number(receptionLine.quantiteRecue || 0);
      if (quantity <= 0) continue;
      const previous = linesByProduct.get(key);
      if (previous) {
        previous.quantite += quantity;
        continue;
      }
      linesByProduct.set(key, {
        idProduit: bcfLine.idProduit,
        designation: bcfLine.produit?.designation || "Produit",
        quantite: quantity,
        prixUnitaireHt: Number(bcfLine.prixUnitaireHt || 0),
        remise: Number(bcfLine.remise || 0),
        tauxTva: Number(bcfLine.produit?.tauxTva || 18),
      });
    }
  }

  const lignes = Array.from(linesByProduct.values()).map((line) => {
    const brutHt = line.quantite * line.prixUnitaireHt;
    const montantRemise = brutHt * (line.remise / 100);
    const montantHt = brutHt - montantRemise;
    const montantTva = montantHt * (line.tauxTva / 100);
    const montantTtc = montantHt + montantTva;
    return {
      ...line,
      montantHt: round2(montantHt),
      montantTva: round2(montantTva),
      montantTtc: round2(montantTtc),
    };
  });

  return {
    lignes,
    totalHt: round2(lignes.reduce((acc, line) => acc + line.montantHt, 0)),
    totalTva: round2(lignes.reduce((acc, line) => acc + line.montantTva, 0)),
    totalTtc: round2(lignes.reduce((acc, line) => acc + line.montantTtc, 0)),
    totalRemise: round2(
      Array.from(linesByProduct.values()).reduce(
        (acc, line) =>
          acc + line.quantite * line.prixUnitaireHt * (line.remise / 100),
        0,
      ),
    ),
  };
}

function assertAmountMatches(label, expected, received) {
  if (received === undefined || received === null || received === "") {
    throw new ApiError(
      400,
      "SUPPLIER_INVOICE_AMOUNT_REQUIRED",
      `Le montant ${label} est obligatoire`,
    );
  }
  if (Math.abs(round2(expected) - round2(received)) > 0.01) {
    throw new ApiError(
      400,
      "SUPPLIER_INVOICE_AMOUNT_MISMATCH",
      `Le montant ${label} ne correspond pas aux receptions selectionnees`,
    );
  }
}

export const achatsService = {
  getDemandes() {
    return achatsRepository.demandes({ orderBy: { createdAt: "desc" } });
  },
  getDemande(id) {
    return achatsRepository.demande(id);
  },
  async createDemande(data, ctx) {
    return achatsRepository.createDemande({
      numeroDa: await generateNumeroDA(),
      idUtilisateurCreateur: ctx.user.userId,
      justification: data.justification,
      lignes: { create: data.lignes || [] },
    });
  },
  validerDemande(id, ctx) {
    return achatsRepository.updateDemande(id, {
      statut: "VALIDEE",
      dateValidation: new Date(),
      idUtilisateurValidateur: ctx.user.userId,
    });
  },
  async getBonsCommande() {
    const bonsCommande = await achatsRepository.bcf({
      orderBy: { createdAt: "desc" },
    });
    const counts = await achatsRepository.facturesImporteesCountsByBcfIds(
      bonsCommande.map((bonCommande) => bonCommande.id),
    );

    return bonsCommande.map((bonCommande) => ({
      ...bonCommande,
      facturesImporteesCount: counts.get(bonCommande.id) || 0,
    }));
  },
  getBonCommande(id) {
    return achatsRepository.bcfById(id).then(async (bonCommande) => {
      if (!bonCommande) return bonCommande;
      const factures = await achatsRepository.facturesImporteesBcf(id);
      const facturedIds = facturedReceptionIdsFromInvoices(factures);
      return {
        ...bonCommande,
        receptions: (bonCommande.receptions || []).map((reception) => ({
          ...reception,
          facturee: facturedIds.has(reception.id),
        })),
        facturesImporteesCount: factures.length,
      };
    });
  },
  async createBonCommande(data, ctx) {
    if (!data?.idFournisseur) {
      throw new ApiError(
        400,
        "BCF_SUPPLIER_REQUIRED",
        "Le fournisseur est obligatoire",
      );
    }
    if (!Array.isArray(data?.lignes) || data.lignes.length === 0) {
      throw new ApiError(
        400,
        "BCF_LINES_REQUIRED",
        "Au moins une ligne produit est requise",
      );
    }

    if (data?.dateLivraisonPrevue) {
      const livraison = new Date(data.dateLivraisonPrevue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(livraison.getTime()) || livraison <= today) {
        throw new ApiError(
          400,
          "BCF_DELIVERY_DATE_INVALID",
          "La date de livraison doit etre strictement posterieure a la date du jour",
        );
      }
    }

    const t = totals(data.lignes);
    const created = await achatsRepository.createBcf({
      numeroBcf: await generateNumeroBCF(),
      idFournisseur: data.idFournisseur,
      idUtilisateur: ctx.user.userId,
      idDa: data.idDa,
      dateLivraisonPrevue: data.dateLivraisonPrevue
        ? new Date(data.dateLivraisonPrevue)
        : null,
      ...t,
      lignes: {
        create: (data.lignes || []).map((l) => ({
          idProduit: l.idProduit,
          quantiteCommandee: Number(l.quantiteCommandee || l.quantite || 0),
          prixUnitaireHt: Number(l.prixUnitaireHt || 0),
          remise: Number(l.remise || 0),
          montantHt:
            Number(l.quantiteCommandee || l.quantite || 0) *
            Number(l.prixUnitaireHt || 0) *
            (1 - Number(l.remise || 0) / 100),
        })),
      },
    });

    emitter.emit("achat.bcf.crud", {
      action: "CREATE",
      idBcf: created.id,
      numeroBcf: created.numeroBcf,
    });

    return created;
  },
  async envoyerBonCommande(id) {
    const bonCommande = await achatsRepository.bcfById(id);
    if (!bonCommande) throw new ApiError(404, "NOT_FOUND", "BCF introuvable");
    if (!["VALIDE", "ENVOYE"].includes(bonCommande.statut)) {
      throw new ApiError(
        409,
        "INVALID_STATUS_TRANSITION",
        "Le BCF doit etre VALIDE ou ENVOYE pour etre envoye au fournisseur",
      );
    }
    if (["RECU_PARTIEL", "RECU_TOTAL", "ANNULE"].includes(bonCommande.statut)) {
      throw new ApiError(
        409,
        "INVALID_STATUS_TRANSITION",
        "Le BCF ne peut pas etre envoye dans son statut actuel",
      );
    }
    if (!bonCommande.fournisseur?.email) {
      throw new ApiError(
        400,
        "SUPPLIER_EMAIL_REQUIRED",
        "Le fournisseur n'a pas d'adresse email",
      );
    }

    const baseUrl = publicApiBaseUrl();
    const links = {
      acceptUrl: `${baseUrl}/achats/public/bons-commande/valider?token=${encodeURIComponent(signBcfSupplierToken(id, "accept"))}`,
      rejectUrl: `${baseUrl}/achats/public/bons-commande/refuser?token=${encodeURIComponent(signBcfSupplierToken(id, "reject"))}`,
      downloadUrl: `${baseUrl}/achats/public/bons-commande/telecharger?token=${encodeURIComponent(signBcfSupplierToken(id, "download"))}`,
    };

    await sendBonCommandeFournisseurEmail(
      bonCommande.fournisseur.email,
      bonCommande.fournisseur.raisonSociale,
      bonCommande,
      links,
    );

    const updated = await achatsRepository.updateBcf(id, { statut: "ENVOYE" });

    emitter.emit("achat.bcf.crud", {
      action: "SEND",
      idBcf: updated.id,
      numeroBcf: bonCommande.numeroBcf,
    });

    return updated;
  },
  async transitionBonCommande(id, action) {
    const transition = ALLOWED_TRANSITIONS[action];
    if (!transition) {
      throw new ApiError(
        400,
        "INVALID_ACTION",
        "Action de transition invalide",
      );
    }

    const bonCommande = await achatsRepository.bcfById(id);
    if (!bonCommande) throw new ApiError(404, "NOT_FOUND", "BCF introuvable");

    if (!transition.from.includes(bonCommande.statut)) {
      throw new ApiError(
        409,
        "INVALID_STATUS_TRANSITION",
        `Transition impossible depuis le statut ${bonCommande.statut}`,
      );
    }

    if (action === "CANCEL" && !bonCommande.fournisseur?.email) {
      throw new ApiError(
        400,
        "SUPPLIER_EMAIL_REQUIRED",
        "Le fournisseur n'a pas d'adresse email pour notifier l'annulation",
      );
    }

    const updated = await achatsRepository.updateBcf(id, {
      statut: transition.to,
    });

    if (action === "CANCEL" && bonCommande.fournisseur?.email) {
      await sendBonCommandeAnnuleeEmail(
        bonCommande.fournisseur.email,
        bonCommande.fournisseur.raisonSociale || "Fournisseur",
        bonCommande,
      );
    }

    emitter.emit("achat.bcf.crud", {
      action,
      idBcf: updated.id,
      numeroBcf: bonCommande.numeroBcf,
      statut: updated.statut,
    });

    return updated;
  },
  async dupliquerBonCommande(id, ctx) {
    const source = await achatsRepository.bcfById(id);
    if (!source) throw new ApiError(404, "NOT_FOUND", "BCF introuvable");

    const lignes = (source.lignes || []).map((l) => ({
      idProduit: l.idProduit,
      quantiteCommandee: Number(l.quantiteCommandee || 0),
      prixUnitaireHt: Number(l.prixUnitaireHt || 0),
      remise: Number(l.remise || 0),
      tauxTva: Number(l.produit?.tauxTva || 18),
    }));

    const t = totals(lignes);
    const duplicated = await achatsRepository.createBcf({
      numeroBcf: await generateNumeroBCF(),
      idFournisseur: source.idFournisseur,
      idUtilisateur: ctx.user.userId,
      idDa: source.idDa || undefined,
      dateLivraisonPrevue: source.dateLivraisonPrevue,
      notes: source.notes || undefined,
      ...t,
      lignes: {
        create: lignes.map((l) => ({
          idProduit: l.idProduit,
          quantiteCommandee: Number(l.quantiteCommandee || 0),
          prixUnitaireHt: Number(l.prixUnitaireHt || 0),
          remise: Number(l.remise || 0),
          montantHt:
            Number(l.quantiteCommandee || 0) *
            Number(l.prixUnitaireHt || 0) *
            (1 - Number(l.remise || 0) / 100),
        })),
      },
    });

    emitter.emit("achat.bcf.crud", {
      action: "DUPLICATE",
      idBcf: duplicated.id,
      numeroBcf: duplicated.numeroBcf,
      sourceNumeroBcf: source.numeroBcf,
    });

    return duplicated;
  },
  async reponseFournisseur(token, action) {
    let payload;
    try {
      payload = verifyBcfSupplierToken(token, action);
    } catch {
      throw new ApiError(
        400,
        "INVALID_PUBLIC_LINK",
        "Lien de confirmation invalide ou expire",
      );
    }

    const bonCommande = await achatsRepository.bcfById(payload.idBcf);
    if (!bonCommande) throw new ApiError(404, "NOT_FOUND", "BCF introuvable");
    if (["RECU_PARTIEL", "RECU_TOTAL"].includes(bonCommande.statut)) {
      throw new ApiError(
        409,
        "BCF_ALREADY_RECEIVED",
        "Ce BCF a deja fait l'objet d'une reception marchandise",
      );
    }

    if (bonCommande.statut !== "ENVOYE") {
      return { action: "already_processed", bonCommande };
    }

    if (action === "accept") {
      const updated = await achatsRepository.updateBcf(payload.idBcf, {
        statut: "CONFIRME",
      });

      emitter.emit("achat.bcf.crud", {
        action: "SUPPLIER_ACCEPT",
        idBcf: updated.id,
        numeroBcf: bonCommande.numeroBcf,
      });

      return { action: "accepted", bonCommande: updated };
    }

    const updated = await achatsRepository.updateBcf(payload.idBcf, {
      statut: "REJETE",
    });

    emitter.emit("achat.bcf.crud", {
      action: "SUPPLIER_REJECT",
      idBcf: updated.id,
      numeroBcf: bonCommande.numeroBcf,
    });

    return { action: "rejected", bonCommande: updated };
  },
  async telechargerBonCommandePublic(token) {
    let payload;
    try {
      payload = verifyBcfSupplierToken(token, "download");
    } catch {
      throw new ApiError(
        400,
        "INVALID_PUBLIC_LINK",
        "Lien de telechargement invalide ou expire",
      );
    }

    const bonCommande = await achatsRepository.bcfById(payload.idBcf);
    if (!bonCommande) throw new ApiError(404, "NOT_FOUND", "BCF introuvable");
    const entreprise = await parametresRepository.entreprise();
    return {
      filename: `${bonCommande.numeroBcf}.pdf`,
      buffer: await buildBcfPdf(bonCommande, entreprise),
    };
  },
  async telechargerBonCommandeInterne(id) {
    const bonCommande = await achatsRepository.bcfById(id);
    if (!bonCommande) throw new ApiError(404, "NOT_FOUND", "BCF introuvable");
    const entreprise = await parametresRepository.entreprise();
    return {
      filename: `${bonCommande.numeroBcf}.pdf`,
      buffer: await buildBcfPdf(bonCommande, entreprise),
    };
  },
  async creerFactureAchat(idBcf, data, ctx) {
    const bonCommande = await achatsRepository.bcfById(idBcf);
    if (!bonCommande) throw new ApiError(404, "NOT_FOUND", "BCF introuvable");

    if (!["RECU_PARTIEL", "RECU_TOTAL"].includes(bonCommande.statut)) {
      throw new ApiError(
        409,
        "INVALID_STATUS_FOR_INVOICE",
        "La facture achat ne peut etre creee que pour un BCF recu partiellement ou totalement",
      );
    }

    if (!bonCommande.idFournisseur) {
      throw new ApiError(400, "SUPPLIER_REQUIRED", "Fournisseur introuvable");
    }

    const receptionIds = normalizeReceptionIdsInput(data?.receptionIds);

    if (receptionIds.length === 0) {
      throw new ApiError(
        400,
        "RECEPTIONS_REQUIRED",
        "Selectionnez au moins une reception a facturer",
      );
    }

    const existingInvoices = await achatsRepository.facturesImporteesBcf(idBcf);
    const alreadyFacturedIds = facturedReceptionIdsFromInvoices(existingInvoices);
    const receptionsById = new Map(
      (bonCommande.receptions || []).map((reception) => [reception.id, reception]),
    );

    for (const receptionId of receptionIds) {
      if (!receptionsById.has(receptionId)) {
        throw new ApiError(
          400,
          "INVALID_RECEPTION",
          "Reception selectionnee invalide pour ce bon de commande",
        );
      }
      if (alreadyFacturedIds.has(receptionId)) {
        throw new ApiError(
          409,
          "RECEPTION_ALREADY_INVOICED",
          "Une reception selectionnee est deja entierement facturee",
        );
      }
    }

    const computedInvoice = buildImportedInvoiceFromReceptions(
      bonCommande,
      receptionIds,
    );
    const lignesFacture = computedInvoice.lignes;

    if (lignesFacture.length === 0) {
      throw new ApiError(
        409,
        "INVOICE_LINES_EMPTY",
        "Impossible de creer une facture sans quantite recue",
      );
    }

    assertAmountMatches("HT", computedInvoice.totalHt, data?.totalHt);
    assertAmountMatches("TVA", computedInvoice.totalTva, data?.totalTva);
    assertAmountMatches("TTC", computedInvoice.totalTtc, data?.totalTtc);
    assertAmountMatches("remise", computedInvoice.totalRemise, data?.totalRemise);

    const now = new Date();
    const defaultEcheance = new Date(now);
    defaultEcheance.setDate(defaultEcheance.getDate() + 30);

    const modePaiement = data?.modePaiement;
    if (!VALID_PAYMENT_MODES.has(modePaiement)) {
      throw new ApiError(
        400,
        "INVALID_PAYMENT_MODE",
        "Le moyen de paiement est obligatoire et invalide",
      );
    }

    const createdInvoice = await achatsRepository.createFactureAchat(
      {
        numeroFacture: await generateNumeroFacture(),
        typeFacture: "ACHAT",
        idFournisseur: bonCommande.idFournisseur,
        idUtilisateur: ctx.user.userId,
        dateEcheance: data?.dateEcheance
          ? new Date(data.dateEcheance)
          : defaultEcheance,
        totalHt: computedInvoice.totalHt,
        totalTva: computedInvoice.totalTva,
        totalTtc: computedInvoice.totalTtc,
        mentionsLegales: [
          `[BCF_IMPORT] idBcf=${bonCommande.id};`,
          `Source BCF: ${bonCommande.numeroBcf}`,
          "Decision: VALIDER",
          `Reception IDs: ${receptionIds.join(",")}`,
          data?.numeroFacture
            ? `Numero fournisseur: ${String(data.numeroFacture).trim()}`
            : "",
          data?.dateFacture ? `Date facture: ${data.dateFacture}` : "",
          data?.mentionsLegales || data?.observations
            ? `Observations: ${data.mentionsLegales || data.observations}`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
        lignes: { create: lignesFacture },
      },
      {
        idUtilisateur: ctx.user.userId,
        montant: computedInvoice.totalTtc,
        modePaiement,
      },
    );

    emitter.emit("achat.bcf.crud", {
      action: "CREATE_INVOICE_ACHAT",
      idBcf: bonCommande.id,
      numeroBcf: bonCommande.numeroBcf,
      idFacture: createdInvoice.id,
      numeroFacture: createdInvoice.numeroFacture,
    });

    return createdInvoice;
  },
  async importerFactureFournisseur(idBcf, file, body, ctx) {
    const bonCommande = await achatsRepository.bcfById(idBcf);
    if (!bonCommande) throw new ApiError(404, "NOT_FOUND", "BCF introuvable");

    if (!["RECU_PARTIEL", "RECU_TOTAL"].includes(bonCommande.statut)) {
      throw new ApiError(
        409,
        "INVALID_STATUS_FOR_IMPORT",
        "L'import de facture fournisseur est disponible uniquement pour un BCF recu partiellement ou totalement",
      );
    }

    if (!file) {
      throw new ApiError(
        400,
        "SUPPLIER_INVOICE_FILE_REQUIRED",
        "Le fichier de facture fournisseur est obligatoire",
      );
    }

    const decision = String(body?.decision || "").toUpperCase();
    if (!ALLOWED_IMPORT_DECISIONS.has(decision)) {
      throw new ApiError(
        400,
        "SUPPLIER_INVOICE_DECISION_INVALID",
        "La decision doit etre VALIDER ou REJETER",
      );
    }

    const modePaiement = String(body?.modePaiement || "").toUpperCase();
    if (decision === "VALIDER" && !VALID_PAYMENT_MODES.has(modePaiement)) {
      throw new ApiError(
        400,
        "INVALID_PAYMENT_MODE",
        "Le moyen de paiement est obligatoire et invalide",
      );
    }

    let receptionIds = [];
    let computedInvoice = {
      lignes: [],
      totalHt: 0,
      totalTva: 0,
      totalTtc: 0,
      totalRemise: 0,
    };

    if (decision === "VALIDER") {
      const existingInvoices = await achatsRepository.facturesImporteesBcf(idBcf);
      const alreadyFacturedIds = facturedReceptionIdsFromInvoices(existingInvoices);
      const receptionsById = new Map(
        (bonCommande.receptions || []).map((reception) => [
          reception.id,
          reception,
        ]),
      );
      receptionIds = normalizeReceptionIdsInput(body?.receptionIds);
      if (receptionIds.length === 0) {
        receptionIds = (bonCommande.receptions || [])
          .filter((reception) => !alreadyFacturedIds.has(reception.id))
          .map((reception) => reception.id);
      }
      if (receptionIds.length === 0) {
        throw new ApiError(
          400,
          "RECEPTIONS_REQUIRED",
          "Selectionnez au moins une reception a facturer",
        );
      }
      for (const receptionId of receptionIds) {
        if (!receptionsById.has(receptionId)) {
          throw new ApiError(
            400,
            "INVALID_RECEPTION",
            "Reception selectionnee invalide pour ce bon de commande",
          );
        }
        if (alreadyFacturedIds.has(receptionId)) {
          throw new ApiError(
            409,
            "RECEPTION_ALREADY_INVOICED",
            "Une reception selectionnee est deja entierement facturee",
          );
        }
      }
      computedInvoice = buildImportedInvoiceFromReceptions(
        bonCommande,
        receptionIds,
      );
      if (computedInvoice.lignes.length === 0) {
        throw new ApiError(
          409,
          "INVOICE_LINES_EMPTY",
          "Impossible de creer une facture sans quantite recue",
        );
      }
      if (body?.totalHt !== undefined) {
        assertAmountMatches("HT", computedInvoice.totalHt, body.totalHt);
      }
      if (body?.totalTva !== undefined) {
        assertAmountMatches("TVA", computedInvoice.totalTva, body.totalTva);
      }
      if (body?.totalTtc !== undefined) {
        assertAmountMatches("TTC", computedInvoice.totalTtc, body.totalTtc);
      }
      if (body?.totalRemise !== undefined) {
        assertAmountMatches(
          "remise",
          computedInvoice.totalRemise,
          body.totalRemise,
        );
      }
    }

    const now = new Date();
    const defaultEcheance = new Date(now);
    defaultEcheance.setDate(defaultEcheance.getDate() + 30);

    const fileUrl = `/uploads/${file.filename}`;
    const mentionsLegales = [
      `[BCF_IMPORT] idBcf=${bonCommande.id};`,
      `Source BCF: ${bonCommande.numeroBcf}`,
      `Decision: ${decision}`,
      receptionIds.length ? `Reception IDs: ${receptionIds.join(",")}` : "",
      `Fichier URL: ${fileUrl}`,
      `Fichier nom: ${file.originalname || file.filename}`,
      `Fichier mime: ${file.mimetype || "-"}`,
      `Fichier taille: ${Number(file.size || 0)}`,
    ]
      .filter(Boolean)
      .join("\n");

    const createdInvoice = await achatsRepository.createFactureAchat(
      {
        numeroFacture: await generateNumeroFacture(),
        typeFacture: "ACHAT",
        idFournisseur: bonCommande.idFournisseur,
        idUtilisateur: ctx.user.userId,
        dateEcheance: defaultEcheance,
        statut: decision === "VALIDER" ? "EMISE" : "ANNULEE",
        totalHt: computedInvoice.totalHt,
        totalTva: computedInvoice.totalTva,
        totalTtc: computedInvoice.totalTtc,
        mentionsLegales,
        ...(computedInvoice.lignes.length > 0
          ? { lignes: { create: computedInvoice.lignes } }
          : {}),
      },
      decision === "VALIDER"
        ? {
            idUtilisateur: ctx.user.userId,
            montant: computedInvoice.totalTtc,
            modePaiement,
          }
        : undefined,
    );

    emitter.emit("achat.bcf.crud", {
      action: "IMPORT_SUPPLIER_INVOICE",
      idBcf: bonCommande.id,
      numeroBcf: bonCommande.numeroBcf,
      decision,
      idFacture: createdInvoice.id,
      numeroFacture: createdInvoice.numeroFacture,
    });

    return {
      ...createdInvoice,
      decision,
      fileUrl,
      originalFilename: file.originalname || file.filename,
    };
  },
  async getFacturesImportees(idBcf) {
    const bonCommande = await achatsRepository.bcfById(idBcf);
    if (!bonCommande) throw new ApiError(404, "NOT_FOUND", "BCF introuvable");

    const rows = await achatsRepository.facturesImporteesBcf(idBcf);
    return rows.map((row) => {
      const metadata = parseImportMetadata(row.mentionsLegales || "");
      return {
        id: row.id,
        numeroFacture: row.numeroFacture,
        statut: row.statut,
        totalTtc: row.totalTtc,
        createdAt: row.createdAt,
        decision: metadata.Decision || "-",
        fileUrl: metadata["Fichier URL"] || null,
        originalFilename: metadata["Fichier nom"] || null,
      };
    });
  },
  async reception(id, data, ctx) {
    const reception = await achatsRepository.createReception(
      id,
      ctx.user.userId,
      data.lignes || [],
    );

    emitter.emit("achat.bcf.crud", {
      action: "RECEPTION",
      idBcf: id,
      statut: reception.statut,
      produitsRecus: reception.produitsRecus,
    });

    return reception;
  },
};
