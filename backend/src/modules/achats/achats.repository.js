import prisma from "../../config/database.js";
import { ApiError } from "../../utils/response.util.js";

export const achatsRepository = {
  demandes(args = {}) {
    return prisma.demandeAchat.findMany({
      ...args,
      include: { lignes: { include: { produit: true } }, createur: true },
    });
  },
  demande(id) {
    return prisma.demandeAchat.findUnique({
      where: { id },
      include: { lignes: true },
    });
  },
  createDemande(data) {
    return prisma.demandeAchat.create({ data, include: { lignes: true } });
  },
  updateDemande(id, data) {
    return prisma.demandeAchat.update({
      where: { id },
      data,
      include: { lignes: true },
    });
  },
  bcf(args = {}) {
    return prisma.bonCommandeFournisseur.findMany({
      ...args,
      include: { fournisseur: true, lignes: { include: { produit: true } } },
    });
  },
  bcfById(id) {
    return prisma.bonCommandeFournisseur.findUnique({
      where: { id },
      include: { fournisseur: true, lignes: { include: { produit: true } } },
    });
  },
  createBcf(data) {
    return prisma.bonCommandeFournisseur.create({
      data,
      include: { lignes: true },
    });
  },
  updateBcf(id, data) {
    return prisma.bonCommandeFournisseur.update({
      where: { id },
      data,
      include: { lignes: true },
    });
  },
  createFactureAchat(data) {
    return prisma.facture.create({
      data,
      include: {
        fournisseur: true,
        lignes: true,
        paiements: true,
      },
    });
  },
  facturesImporteesBcf(idBcf) {
    return prisma.facture.findMany({
      where: {
        typeFacture: "ACHAT",
        mentionsLegales: {
          contains: `[BCF_IMPORT] idBcf=${idBcf};`,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        fournisseur: true,
        lignes: true,
        paiements: true,
      },
    });
  },
  createReception(idBcf, userId, lignes) {
    return prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        "SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci",
      );

      const bonCommande = await tx.bonCommandeFournisseur.findUnique({
        where: { id: idBcf },
        include: { lignes: true },
      });
      if (!bonCommande) {
        throw new ApiError(404, "NOT_FOUND", "BCF introuvable");
      }

      const reception = await tx.receptionMarchandise.create({
        data: {
          idBcf,
          idUtilisateur: userId,
          statut: "CONFORME",
          lignes: {
            create: lignes.map((l) => ({
              idLigneBcf: l.idLigneBcf,
              quantiteRecue: l.quantiteRecue,
              conforme: l.conforme ?? true,
            })),
          },
        },
        include: { lignes: true },
      });
      for (const ligne of lignes) {
        const ligneCourante = bonCommande.lignes.find(
          (l) => l.id === ligne.idLigneBcf,
        );
        if (!ligneCourante) {
          throw new ApiError(
            400,
            "INVALID_LINE",
            "Ligne de bon de commande invalide",
          );
        }
        const restant =
          Number(ligneCourante.quantiteCommandee) -
          Number(ligneCourante.quantiteRecue);
        if (ligne.quantiteRecue <= 0) {
          throw new ApiError(
            400,
            "INVALID_QUANTITY",
            "La quantite recue doit etre superieure a zero",
          );
        }
        if (ligne.quantiteRecue > restant) {
          throw new ApiError(
            400,
            "RECEPTION_QUANTITY_EXCEEDS_REMAINING",
            "La quantite recue depasse la quantite restante a recevoir",
          );
        }

        const ligneBcf = await tx.ligneBcf.update({
          where: { id: ligne.idLigneBcf },
          data: { quantiteRecue: { increment: ligne.quantiteRecue } },
        });
        const stock = await tx.stock.upsert({
          where: { idProduit: ligneBcf.idProduit },
          create: {
            idProduit: ligneBcf.idProduit,
            stockActuel: ligne.quantiteRecue,
          },
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

      const lignesBcf = await tx.ligneBcf.findMany({
        where: { idBcf },
        select: { quantiteCommandee: true, quantiteRecue: true },
      });

      const allReceived =
        lignesBcf.length > 0 &&
        lignesBcf.every(
          (ligne) =>
            Number(ligne.quantiteRecue) >= Number(ligne.quantiteCommandee),
        );
      const someReceived = lignesBcf.some(
        (ligne) => Number(ligne.quantiteRecue) > 0,
      );

      const statutBcf = allReceived
        ? "RECU_TOTAL"
        : someReceived
          ? "RECU_PARTIEL"
          : "ENVOYE";

      await tx.bonCommandeFournisseur.update({
        where: { id: idBcf },
        data: { statut: statutBcf },
      });

      return {
        reception,
        statut: statutBcf,
        produitsRecus: lignes.length,
      };
    });
  },
};
