import prisma from "../../config/database.js";

export const stocksRepository = {
  findMany(args = {}) { return prisma.stock.findMany({ ...args, include: { produit: { include: { categorie: true } } } }); },
  count(where = {}) { return prisma.stock.count({ where }); },
  alertes() {
    return prisma.stock.findMany({
      where: { produit: { statut: "ACTIF" } },
      include: { produit: true },
    });
  },
  mouvements(args = {}) {
    return prisma.mouvementStock.findMany({ ...args, include: { produit: true, utilisateur: true } });
  },
  countMouvements(where = {}) { return prisma.mouvementStock.count({ where }); },
  async ajuster({ idProduit, quantite, motif, userId }) {
    return prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({ where: { idProduit }, include: { produit: true } });
      if (!stock) throw new Error("Stock introuvable");
      const stockApres = stock.stockActuel + quantite;
      const updated = await tx.stock.update({ where: { idProduit }, data: { stockActuel: stockApres } });
      const mouvement = await tx.mouvementStock.create({
        data: {
          idProduit,
          idUtilisateur: userId,
          typeMouvement: quantite >= 0 ? "AJUSTEMENT_POS" : "AJUSTEMENT_NEG",
          quantite: Math.abs(quantite),
          stockAvant: stock.stockActuel,
          stockApres,
          motif,
        },
      });
      return { stock: updated, mouvement };
    });
  },
  inventaires(args = {}) { return prisma.inventaire.findMany({ ...args, include: { lignes: true } }); },
  inventaireById(id) { return prisma.inventaire.findUnique({ where: { id }, include: { lignes: { include: { produit: true } } } }); },
  createInventaire(userId) {
    return prisma.$transaction(async (tx) => {
      const stocks = await tx.stock.findMany();
      return tx.inventaire.create({
        data: {
          idUtilisateurCreateur: userId,
          lignes: { create: stocks.map((s) => ({ idProduit: s.idProduit, stockTheorique: s.stockActuel })) },
        },
        include: { lignes: true },
      });
    });
  },
  validerInventaire(id, userId) {
    return prisma.inventaire.update({
      where: { id },
      data: { statut: "VALIDE", dateFin: new Date(), idUtilisateurValidateur: userId },
      include: { lignes: true },
    });
  },
};

