import prisma from "../../config/database.js";

export const paiementsRepository = {
  findMany(args = {}) { return prisma.paiement.findMany({ ...args, include: { facture: true, utilisateur: true } }); },
  count(where = {}) { return prisma.paiement.count({ where }); },
  findById(id) { return prisma.paiement.findUnique({ where: { id }, include: { facture: true } }); },
  create(data) {
    return prisma.$transaction(async (tx) => {
      const facture = await tx.facture.findUnique({ where: { id: data.idFacture } });
      const montant = Number(data.montant);
      const solde = Number(facture.totalTtc) - Number(facture.montantPaye);
      if (montant > solde) throw new Error("Montant superieur au solde restant");
      const paiement = await tx.paiement.create({ data });
      const nouveauPaye = Number(facture.montantPaye) + montant;
      await tx.facture.update({
        where: { id: data.idFacture },
        data: { montantPaye: nouveauPaye, statut: nouveauPaye >= Number(facture.totalTtc) ? "SOLDEE" : "PARTIELLEMENT_PAYEE" },
      });
      return paiement;
    });
  },
};

