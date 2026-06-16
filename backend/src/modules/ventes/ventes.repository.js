import prisma from "../../config/database.js";

export const ventesRepository = {
  devis(args = {}) { return prisma.devis.findMany({ ...args, include: { client: true, lignes: true } }); },
  devisById(id) { return prisma.devis.findUnique({ where: { id }, include: { client: true, lignes: true } }); },
  createDevis(data) { return prisma.devis.create({ data, include: { lignes: true } }); },
  updateDevis(id, data) { return prisma.devis.update({ where: { id }, data, include: { lignes: true } }); },
  commandes(args = {}) { return prisma.bonCommandeClient.findMany({ ...args, include: { client: true, lignes: true } }); },
  commandeById(id) { return prisma.bonCommandeClient.findUnique({ where: { id }, include: { client: true, lignes: true } }); },
  createCommande(data) { return prisma.bonCommandeClient.create({ data, include: { lignes: true } }); },
  updateCommande(id, data) { return prisma.bonCommandeClient.update({ where: { id }, data, include: { lignes: true } }); },
  livraisons(idBcc) { return prisma.bonLivraison.findMany({ where: { idBcc }, include: { lignes: true } }); },
  createLivraison(idBcc, userId, lignes) {
    return prisma.$transaction(async (tx) => {
      const bl = await tx.bonLivraison.create({
        data: {
          numeroBl: `BL-${Date.now()}`,
          idBcc,
          idUtilisateur: userId,
          lignes: { create: lignes },
        },
        include: { lignes: true },
      });
      for (const ligne of lignes) {
        const stock = await tx.stock.update({
          where: { idProduit: ligne.idProduit },
          data: { stockActuel: { decrement: ligne.quantiteLivree }, stockReserve: { decrement: ligne.quantiteLivree } },
          include: { produit: true },
        });
        await tx.mouvementStock.create({
          data: {
            idProduit: ligne.idProduit,
            idUtilisateur: userId,
            typeMouvement: "SORTIE_VENTE",
            quantite: ligne.quantiteLivree,
            stockAvant: stock.stockActuel + ligne.quantiteLivree,
            stockApres: stock.stockActuel,
            referenceDoc: bl.numeroBl,
          },
        });
      }
      return bl;
    });
  },
};

