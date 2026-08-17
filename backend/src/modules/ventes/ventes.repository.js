import prisma from "../../config/database.js";
import { ApiError } from "../../utils/response.util.js";

export const ventesRepository = {
  devis(args = {}) {
    return prisma.devis.findMany({
      ...args,
      include: { client: true, lignes: true },
    });
  },
  devisById(id) {
    return prisma.devis.findUnique({
      where: { id },
      include: { client: true, lignes: { include: { produit: true } } },
    });
  },
  createDevis(data) {
    return prisma.devis.create({ data, include: { lignes: true } });
  },
  updateDevis(id, data) {
    return prisma.devis.update({
      where: { id },
      data,
      include: { lignes: true },
    });
  },
  commandes(args = {}) {
    return prisma.bonCommandeClient.findMany({
      ...args,
      include: { client: true, lignes: true },
    });
  },
  commandeById(id) {
    return prisma.bonCommandeClient.findUnique({
      where: { id },
      include: { client: true, lignes: true },
    });
  },
  createCommande(data) {
    return prisma.bonCommandeClient.create({ data, include: { lignes: true } });
  },
  clientById(id) {
    return prisma.client.findUnique({ where: { id } });
  },
  produitsByIds(ids) {
    return prisma.produit.findMany({
      where: { id: { in: ids } },
      include: { stock: true },
    });
  },
  updateCommande(id, data) {
    return prisma.bonCommandeClient.update({
      where: { id },
      data,
      include: { lignes: true },
    });
  },
  livraisons(idBcc) {
    return prisma.bonLivraison.findMany({
      where: { idBcc },
      include: { lignes: true },
    });
  },
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
          data: {
            stockActuel: { decrement: ligne.quantiteLivree },
            stockReserve: { decrement: ligne.quantiteLivree },
          },
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
  createVenteDirecteFacturee({
    facture,
    lignes,
    paiement,
    userId,
  }) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.facture.create({
        data: {
          ...facture,
          lignes: { create: lignes },
        },
        include: {
          client: true,
          fournisseur: true,
          lignes: true,
          paiements: true,
          bonLivraison: { include: { lignes: true } },
        },
      });

      for (const ligne of lignes) {
        if (!ligne.idProduit) continue;

        const stockAvant = await tx.stock.findUnique({
          where: { idProduit: ligne.idProduit },
        });
        if (!stockAvant) {
          throw new ApiError(404, "STOCK_NOT_FOUND", "Stock introuvable");
        }

        const updated = await tx.stock.updateMany({
          where: {
            idProduit: ligne.idProduit,
            stockActuel: { gte: ligne.quantite },
          },
          data: {
            stockActuel: { decrement: ligne.quantite },
          },
        });

        if (updated.count !== 1) {
          throw new ApiError(
            400,
            "INSUFFICIENT_STOCK",
            `Stock insuffisant pour ${ligne.designation}`,
          );
        }

        const stockApres = await tx.stock.findUnique({
          where: { idProduit: ligne.idProduit },
        });

        await tx.mouvementStock.create({
          data: {
            idProduit: ligne.idProduit,
            idUtilisateur: userId,
            typeMouvement: "SORTIE_VENTE",
            quantite: ligne.quantite,
            stockAvant: stockAvant.stockActuel,
            stockApres: stockApres.stockActuel,
            referenceDoc: created.numeroFacture,
            motif: "Vente directe facturee",
          },
        });
      }

      if (!paiement) {
        return tx.facture.findUnique({
          where: { id: created.id },
          include: {
            client: true,
            fournisseur: true,
            lignes: true,
            paiements: true,
            bonLivraison: { include: { lignes: true } },
          },
        });
      }

      await tx.paiement.create({
        data: {
          ...paiement,
          idFacture: created.id,
          idUtilisateur: userId,
        },
      });

      const montantPaye = Number(paiement.montant);
      const totalTtc = Number(created.totalTtc);
      const statut =
        montantPaye >= totalTtc
          ? "SOLDEE"
          : montantPaye > 0
            ? "PARTIELLEMENT_PAYEE"
            : created.statut;

      return tx.facture.update({
        where: { id: created.id },
        data: { montantPaye, statut },
        include: {
          client: true,
          fournisseur: true,
          lignes: true,
          paiements: true,
          bonLivraison: { include: { lignes: true } },
        },
      });
    });
  },
};
