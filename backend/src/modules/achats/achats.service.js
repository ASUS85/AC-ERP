import { generateNumeroBCF, generateNumeroDA } from "../../services/numero.service.js";
import { sendBonCommandeFournisseurEmail } from "../../services/email.service.js";
import { buildBcfPdf } from "../../services/bcf-document.service.js";
import { publicApiBaseUrl, signBcfSupplierToken, verifyBcfSupplierToken } from "../../services/public-link.service.js";
import { ApiError } from "../../utils/response.util.js";
import { parametresRepository } from "../parametres/parametres.repository.js";
import { achatsRepository } from "./achats.repository.js";

function totals(lignes = []) {
  return lignes.reduce((acc, l) => {
    const ht = Number(l.quantiteCommandee || l.quantite || 0) * Number(l.prixUnitaireHt || 0) * (1 - Number(l.remise || 0) / 100);
    const tva = ht * (Number(l.tauxTva || 18) / 100);
    acc.totalHt += ht; acc.totalTva += tva; acc.totalTtc += ht + tva;
    return acc;
  }, { totalHt: 0, totalTva: 0, totalTtc: 0 });
}

export const achatsService = {
  getDemandes() { return achatsRepository.demandes({ orderBy: { createdAt: "desc" } }); },
  getDemande(id) { return achatsRepository.demande(id); },
  async createDemande(data, ctx) {
    return achatsRepository.createDemande({
      numeroDa: await generateNumeroDA(),
      idUtilisateurCreateur: ctx.user.userId,
      justification: data.justification,
      lignes: { create: data.lignes || [] },
    });
  },
  validerDemande(id, ctx) { return achatsRepository.updateDemande(id, { statut: "VALIDEE", dateValidation: new Date(), idUtilisateurValidateur: ctx.user.userId }); },
  getBonsCommande() { return achatsRepository.bcf({ orderBy: { createdAt: "desc" } }); },
  getBonCommande(id) { return achatsRepository.bcfById(id); },
  async createBonCommande(data, ctx) {
    const t = totals(data.lignes);
    return achatsRepository.createBcf({
      numeroBcf: await generateNumeroBCF(),
      idFournisseur: data.idFournisseur,
      idUtilisateur: ctx.user.userId,
      idDa: data.idDa,
      dateLivraisonPrevue: data.dateLivraisonPrevue ? new Date(data.dateLivraisonPrevue) : null,
      ...t,
      lignes: { create: (data.lignes || []).map((l) => ({ ...l, montantHt: Number(l.quantiteCommandee) * Number(l.prixUnitaireHt) * (1 - Number(l.remise || 0) / 100) })) },
    });
  },
  async envoyerBonCommande(id) {
    const bonCommande = await achatsRepository.bcfById(id);
    if (!bonCommande) throw new ApiError(404, "NOT_FOUND", "BCF introuvable");
    if (!bonCommande.fournisseur?.email) {
      throw new ApiError(400, "SUPPLIER_EMAIL_REQUIRED", "Le fournisseur n'a pas d'adresse email");
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
      links
    );

    return achatsRepository.updateBcf(id, { statut: "ENVOYE" });
  },
  async reponseFournisseur(token, action) {
    let payload;
    try {
      payload = verifyBcfSupplierToken(token, action);
    } catch {
      throw new ApiError(400, "INVALID_PUBLIC_LINK", "Lien de confirmation invalide ou expire");
    }

    const bonCommande = await achatsRepository.bcfById(payload.idBcf);
    if (!bonCommande) throw new ApiError(404, "NOT_FOUND", "BCF introuvable");
    if (["RECU_PARTIEL", "RECU_TOTAL"].includes(bonCommande.statut)) {
      throw new ApiError(409, "BCF_ALREADY_RECEIVED", "Ce BCF a deja fait l'objet d'une reception marchandise");
    }

    if (bonCommande.statut !== "ENVOYE") {
      return { action: "already_processed", bonCommande };
    }

    if (action === "accept") {
      const updated = await achatsRepository.updateBcf(payload.idBcf, { statut: "VALIDE" });
      return { action: "accepted", bonCommande: updated };
    }

    const updated = await achatsRepository.updateBcf(payload.idBcf, { statut: "ANNULE" });
    return { action: "rejected", bonCommande: updated };
  },
  async telechargerBonCommandePublic(token) {
    let payload;
    try {
      payload = verifyBcfSupplierToken(token, "download");
    } catch {
      throw new ApiError(400, "INVALID_PUBLIC_LINK", "Lien de telechargement invalide ou expire");
    }

    const bonCommande = await achatsRepository.bcfById(payload.idBcf);
    if (!bonCommande) throw new ApiError(404, "NOT_FOUND", "BCF introuvable");
    const entreprise = await parametresRepository.entreprise();
    return {
      filename: `${bonCommande.numeroBcf}.pdf`,
      buffer: await buildBcfPdf(bonCommande, entreprise),
    };
  },
  reception(id, data, ctx) { return achatsRepository.createReception(id, ctx.user.userId, data.lignes || []); },
};
