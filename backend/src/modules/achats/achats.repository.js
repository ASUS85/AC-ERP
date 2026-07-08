import prisma from "../../config/database.js";

export const achatsRepository = {
  demandes(args = {}) { return prisma.demandeAchat.findMany({ ...args, include: { lignes: { include: { produit: true } }, createur: true } }); },
  demande(id) { return prisma.demandeAchat.findUnique({ where: { id }, include: { lignes: true } }); },
  createDemande(data) { return prisma.demandeAchat.create({ data, include: { lignes: true } }); },
  updateDemande(id, data) { return prisma.demandeAchat.update({ where: { id }, data, include: { lignes: true } }); },
  bcf(args = {}) { return prisma.bonCommandeFournisseur.findMany({ ...args, include: { fournisseur: true, lignes: { include: { produit: true } } } }); },
  bcfById(id) { return prisma.bonCommandeFournisseur.findUnique({ where: { id }, include: { fournisseur: true, lignes: { include: { produit: true } } } }); },
  createBcf(data) { return prisma.bonCommandeFournisseur.create({ data, include: { lignes: true } }); },
  updateBcf(id, data) { return prisma.bonCommandeFournisseur.update({ where: { id }, data, include: { lignes: true } }); },
  createReception(idBcf, userId, lignes) {
    return prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci");
      const reception = await tx.receptionMarchandise.create({
        data: {
          idBcf,
          idUtilisateur: userId,
          statut: "CONFORME",
          lignes: { create: lignes.map((l) => ({ idLigneBcf: l.idLigneBcf, quantiteRecue: l.quantiteRecue, conforme: l.conforme ?? true })) },
        },
        include: { lignes: true },
      });
      for (const ligne of lignes) {
        const ligneBcf = await tx.ligneBcf.update({
          where: { id: ligne.idLigneBcf },
          data: { quantiteRecue: { increment: ligne.quantiteRecue } },
        });
        const stock = await tx.stock.upsert({
          where: { idProduit: ligneBcf.idProduit },
          create: { idProduit: ligneBcf.idProduit, stockActuel: ligne.quantiteRecue },
          update: { stockActuel: { increment: ligne.quantiteRecue } },
        });
        await tx.mouvementStock.create({
          data: {
            idProduit: ligneBcf.idProduit,
            idUtilisateur: userId,
            typeMouvement: "ENTREE_ACHAT",
            quantite: ligne.quantiteRecue,
            stockAvant: stock.stockActuel - ligne.quantiteRecue,
            stockApres: stock.stockActuel,
            referenceDoc: idBcf,
          },
        });
      }
      return reception;
    });
  },
};
