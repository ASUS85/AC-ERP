import { generateNumeroBCF, generateNumeroDA } from "../../services/numero.service.js";
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
  envoyerBonCommande(id) { return achatsRepository.updateBcf(id, { statut: "ENVOYE" }); },
  reception(id, data, ctx) { return achatsRepository.createReception(id, ctx.user.userId, data.lignes || []); },
};

