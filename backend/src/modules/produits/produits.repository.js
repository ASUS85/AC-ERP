import prisma from "../../config/database.js";

const include = { categorie: true, stock: true };

export const produitsRepository = {
  findMany(args = {}) {
    return prisma.produit.findMany({ ...args, include });
  },
  count(where = {}) {
    return prisma.produit.count({ where });
  },
  findById(id) {
    return prisma.produit.findUnique({ where: { id }, include });
  },
  createWithStock(data, stockInitial, userId) {
    return prisma.$transaction(async (tx) => {
      const produit = await tx.produit.create({ data, include });
      const stock = await tx.stock.create({
        data: { idProduit: produit.id, stockActuel: stockInitial || 0 },
      });
      if (stockInitial > 0 && userId) {
        await tx.mouvementStock.create({
          data: {
            idProduit: produit.id,
            idUtilisateur: userId,
            typeMouvement: "AJUSTEMENT_POS",
            quantite: stockInitial,
            stockAvant: 0,
            stockApres: stockInitial,
            motif: "Stock initial",
          },
        });
      }
      return { ...produit, stock };
    });
  },
  update(id, data) {
    return prisma.produit.update({ where: { id }, data, include });
  },
};
