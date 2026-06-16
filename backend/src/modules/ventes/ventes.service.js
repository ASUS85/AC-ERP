import dayjs from "dayjs";
import { ApiError } from "../../utils/response.util.js";
import { generateNumeroBCC, generateNumeroDevis, generateNumeroBL } from "../../services/numero.service.js";
import emitter from "../../events/emitter.js";
import { ventesRepository } from "./ventes.repository.js";

function lineAmounts(l) {
  const montantHt = Number(l.quantite) * Number(l.prixUnitaireHt) * (1 - Number(l.remise || 0) / 100);
  const montantTva = montantHt * (Number(l.tauxTva || 18) / 100);
  return { ...l, montantHt, montantTva, montantTtc: montantHt + montantTva };
}

function totals(lignes = []) {
  return lignes.reduce((a, l) => ({ totalHt: a.totalHt + l.montantHt, totalTva: a.totalTva + l.montantTva, totalTtc: a.totalTtc + l.montantTtc }), { totalHt: 0, totalTva: 0, totalTtc: 0 });
}

export const ventesService = {
  getDevis() { return ventesRepository.devis({ orderBy: { createdAt: "desc" } }); },
  getDevisById(id) { return ventesRepository.devisById(id); },
  async createDevis(data, ctx) {
    const lignes = (data.lignes || []).map(lineAmounts);
    return ventesRepository.createDevis({
      numeroDevis: await generateNumeroDevis(),
      idClient: data.idClient,
      idUtilisateur: ctx.user.userId,
      dateValidite: data.dateValidite ? new Date(data.dateValidite) : dayjs().add(30, "day").toDate(),
      conditions: data.conditions,
      ...totals(lignes),
      lignes: { create: lignes },
    });
  },
  envoyerDevis(id) { return ventesRepository.updateDevis(id, { statut: "ENVOYE" }); },
  async convertirDevis(id, ctx) {
    const devis = await ventesRepository.devisById(id);
    if (!devis) throw new ApiError(404, "NOT_FOUND", "Devis introuvable");
    const lignes = devis.lignes.map((l) => ({ idProduit: l.idProduit, designation: l.designation, quantite: l.quantite, prixUnitaireHt: l.prixUnitaireHt, remise: l.remise, tauxTva: l.tauxTva, montantHt: l.montantHt, montantTva: l.montantTva, montantTtc: l.montantTtc }));
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
  getCommandes() { return ventesRepository.commandes({ orderBy: { createdAt: "desc" } }); },
  getCommande(id) { return ventesRepository.commandeById(id); },
  async createCommande(data, ctx) {
    const lignes = (data.lignes || []).map(lineAmounts);
    return ventesRepository.createCommande({ numeroBcc: await generateNumeroBCC(), idClient: data.idClient, idUtilisateur: ctx.user.userId, ...totals(lignes), lignes: { create: lignes } });
  },
  async confirmerCommande(id) {
    const commande = await ventesRepository.updateCommande(id, { statut: "CONFIRME" });
    emitter.emit("commande.confirmee", { idCommande: id });
    return commande;
  },
  async creerLivraison(id, data, ctx) {
    const lignes = (data.lignes || []).map((l) => ({ ...l }));
    const livraison = await ventesRepository.createLivraison(id, ctx.user.userId, lignes);
    livraison.numeroBl = livraison.numeroBl || (await generateNumeroBL());
    return livraison;
  },
  livraisons(id) { return ventesRepository.livraisons(id); },
};

