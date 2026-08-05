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
  getBonsCommande() {
    return achatsRepository.bcf({ orderBy: { createdAt: "desc" } });
  },
  getBonCommande(id) {
    return achatsRepository.bcfById(id);
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

    const lignesFacture = (bonCommande.lignes || [])
      .map((ligne) => {
        const quantite = Number(ligne.quantiteRecue || 0);
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
      .filter((l) => l.quantite > 0);

    if (lignesFacture.length === 0) {
      throw new ApiError(
        409,
        "INVOICE_LINES_EMPTY",
        "Impossible de creer une facture sans quantite recue",
      );
    }

    const totalHt = lignesFacture.reduce(
      (acc, l) => acc + Number(l.montantHt),
      0,
    );
    const totalTva = lignesFacture.reduce(
      (acc, l) => acc + Number(l.montantTva),
      0,
    );
    const totalTtc = lignesFacture.reduce(
      (acc, l) => acc + Number(l.montantTtc),
      0,
    );

    const now = new Date();
    const defaultEcheance = new Date(now);
    defaultEcheance.setDate(defaultEcheance.getDate() + 30);

    const createdInvoice = await achatsRepository.createFactureAchat({
      numeroFacture: await generateNumeroFacture(),
      typeFacture: "ACHAT",
      idFournisseur: bonCommande.idFournisseur,
      idUtilisateur: ctx.user.userId,
      dateEcheance: data?.dateEcheance
        ? new Date(data.dateEcheance)
        : defaultEcheance,
      totalHt,
      totalTva,
      totalTtc,
      mentionsLegales:
        data?.mentionsLegales ||
        `Facture generee depuis ${bonCommande.numeroBcf}`,
      lignes: { create: lignesFacture },
    });

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

    const lignesImportees =
      decision === "VALIDER" ? buildImportedInvoiceLines(bonCommande) : [];

    const totalHt =
      decision === "VALIDER"
        ? lignesImportees.reduce((acc, line) => acc + Number(line.montantHt), 0)
        : 0;
    const totalTva =
      decision === "VALIDER"
        ? lignesImportees.reduce(
            (acc, line) => acc + Number(line.montantTva),
            0,
          )
        : 0;
    const totalTtc =
      decision === "VALIDER"
        ? lignesImportees.reduce(
            (acc, line) => acc + Number(line.montantTtc),
            0,
          )
        : 0;

    const now = new Date();
    const defaultEcheance = new Date(now);
    defaultEcheance.setDate(defaultEcheance.getDate() + 30);

    const fileUrl = `/uploads/${file.filename}`;
    const mentionsLegales = [
      `[BCF_IMPORT] idBcf=${bonCommande.id};`,
      `Source BCF: ${bonCommande.numeroBcf}`,
      `Decision: ${decision}`,
      `Fichier URL: ${fileUrl}`,
      `Fichier nom: ${file.originalname || file.filename}`,
      `Fichier mime: ${file.mimetype || "-"}`,
      `Fichier taille: ${Number(file.size || 0)}`,
    ].join("\n");

    const createdInvoice = await achatsRepository.createFactureAchat({
      numeroFacture: await generateNumeroFacture(),
      typeFacture: "ACHAT",
      idFournisseur: bonCommande.idFournisseur,
      idUtilisateur: ctx.user.userId,
      dateEcheance: defaultEcheance,
      statut: decision === "VALIDER" ? "EMISE" : "ANNULEE",
      totalHt,
      totalTva,
      totalTtc,
      mentionsLegales,
      ...(lignesImportees.length > 0
        ? { lignes: { create: lignesImportees } }
        : {}),
    });

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
