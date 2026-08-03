import prisma from "../../config/database.js";
import { ApiError } from "../../utils/response.util.js";

const VALID_MOUVEMENT_TYPES = [
  "ENTREE_ACHAT",
  "SORTIE_VENTE",
  "AJUSTEMENT_POS",
  "AJUSTEMENT_NEG",
  "RETOUR_CLIENT",
  "RETOUR_FOURNISSEUR",
];

export const stocksRepository = {
  findMany(args = {}) {
    return prisma.stock.findMany({
      ...args,
      include: { produit: { include: { categorie: true } } },
    });
  },
  count(where = {}) {
    return prisma.stock.count({ where });
  },
  alertes() {
    return prisma.stock.findMany({
      where: { produit: { statut: "ACTIF" } },
      include: { produit: true },
    });
  },
  mouvements(args = {}) {
    const safeTypeWhere = { typeMouvement: { in: VALID_MOUVEMENT_TYPES } };
    const where = args.where
      ? { AND: [safeTypeWhere, args.where] }
      : safeTypeWhere;
    return prisma.mouvementStock.findMany({
      ...args,
      where,
      include: { produit: true },
    });
  },
  countMouvements(where = {}) {
    const safeTypeWhere = { typeMouvement: { in: VALID_MOUVEMENT_TYPES } };
    const safeWhere = Object.keys(where).length
      ? { AND: [safeTypeWhere, where] }
      : safeTypeWhere;
    return prisma.mouvementStock.count({ where: safeWhere });
  },
  async ajuster({ idProduit, quantite, motif, userId }) {
    return prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({
        where: { idProduit },
        include: { produit: true },
      });
      if (!stock)
        throw new ApiError(404, "STOCK_NOT_FOUND", "Stock introuvable");
      const stockApres = stock.stockActuel + quantite;
      const updated = await tx.stock.update({
        where: { idProduit },
        data: { stockActuel: stockApres },
      });
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
  inventaires(args = {}) {
    return prisma.inventaire.findMany({ ...args, include: { lignes: true } });
  },
  inventaireById(id) {
    return prisma.inventaire.findUnique({
      where: { id },
      include: { lignes: { include: { produit: true } } },
    });
  },
  findInventaireEnCours() {
    return prisma.inventaire.findFirst({
      where: { statut: "EN_COURS" },
      orderBy: { createdAt: "desc" },
    });
  },
  createInventaire(userId) {
    return prisma.$transaction(async (tx) => {
      const stocks = await tx.stock.findMany();
      return tx.inventaire.create({
        data: {
          idUtilisateurCreateur: userId,
          lignes: {
            create: stocks.map((s) => ({
              idProduit: s.idProduit,
              stockTheorique: s.stockActuel,
            })),
          },
        },
        include: { lignes: true },
      });
    });
  },
  validerInventaire(id, userId) {
    return prisma.inventaire.update({
      where: { id },
      data: {
        statut: "VALIDE",
        dateFin: new Date(),
        idUtilisateurValidateur: userId,
      },
      include: { lignes: true },
    });
  },
};
