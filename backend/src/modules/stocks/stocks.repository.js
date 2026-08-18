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
    return prisma.inventaire.findMany({
      ...args,
      include: {
        lignes: true,
        createur: { select: { nom: true, prenom: true } },
        validateur: { select: { nom: true, prenom: true } },
      },
    });
  },
  inventaireById(id) {
    return prisma.inventaire.findUnique({
      where: { id },
      include: {
        lignes: { include: { produit: true } },
        createur: { select: { nom: true, prenom: true } },
        validateur: { select: { nom: true, prenom: true } },
      },
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
    return prisma.$transaction(async (tx) => {
      const inventaire = await tx.inventaire.findUnique({
        where: { id },
        include: { lignes: true },
      });
      if (!inventaire) return null;
      if (inventaire.statut !== "EN_COURS") {
        throw new ApiError(
          409,
          "BUSINESS_RULE_VIOLATION",
          "Cet inventaire ne peut pas etre valide",
        );
      }

      for (const ligne of inventaire.lignes) {
        const ecart = ligne.stockReel - ligne.stockTheorique;
        if (!ecart) continue;
        const stock = await tx.stock.findUnique({
          where: { idProduit: ligne.idProduit },
        });
        if (!stock) {
          throw new ApiError(404, "STOCK_NOT_FOUND", "Stock introuvable");
        }
        const stockApres = stock.stockActuel + ecart;
        await tx.stock.update({
          where: { idProduit: ligne.idProduit },
          data: { stockActuel: stockApres },
        });
        await tx.mouvementStock.create({
          data: {
            idProduit: ligne.idProduit,
            idUtilisateur: userId,
            typeMouvement: ecart > 0 ? "AJUSTEMENT_POS" : "AJUSTEMENT_NEG",
            quantite: Math.abs(ecart),
            stockAvant: stock.stockActuel,
            stockApres,
            referenceDoc: `INV-${id.slice(0, 8)}`,
            motif: "Ajustement issu de la validation d'inventaire",
          },
        });
      }

      return tx.inventaire.update({
        where: { id },
        data: {
          statut: "VALIDE",
          dateFin: new Date(),
          idUtilisateurValidateur: userId,
        },
        include: { lignes: { include: { produit: true } } },
      });
    });
  },
  async enregistrerComptageInventaire(id, lignes) {
    return prisma.$transaction(async (tx) => {
      for (const ligne of lignes) {
        const updated = await tx.ligneInventaire.updateMany({
          where: { id: ligne.id, idInventaire: id },
          data: { stockReel: ligne.stockReel },
        });
        if (!updated.count) {
          throw new ApiError(
            404,
            "INVENTORY_LINE_NOT_FOUND",
            "Ligne d'inventaire introuvable",
          );
        }
      }
      return tx.inventaire.findUnique({
        where: { id },
        include: { lignes: { include: { produit: true } } },
      });
    });
  },
  async rafraichirInventaire(id) {
    return prisma.$transaction(async (tx) => {
      const stocks = await tx.stock.findMany();
      for (const stock of stocks) {
        await tx.ligneInventaire.updateMany({
          where: { idInventaire: id, idProduit: stock.idProduit },
          data: { stockTheorique: stock.stockActuel, stockReel: null },
        });
      }
      return tx.inventaire.findUnique({
        where: { id },
        include: { lignes: { include: { produit: true } } },
      });
    });
  },
  annulerInventaire(id) {
    return prisma.inventaire.update({
      where: { id },
      data: { statut: "ANNULE", dateFin: new Date() },
      include: { lignes: true },
    });
  },
};
