import prisma from "../../config/database.js";

// Exclut les factures brouillon/annulees des rapports ventes/achats
const STATUTS_EXCLUS = ["BROUILLON", "ANNULEE"];

export const rapportsRepository = {
  ventes(where) {
    return prisma.facture.findMany({
      where: {
        ...where,
        typeFacture: "VENTE",
        statut: { notIn: STATUTS_EXCLUS },
      },
      include: { client: true, lignes: true },
    });
  },
  achats(where) {
    return prisma.facture.findMany({
      where: {
        ...where,
        typeFacture: "ACHAT",
        statut: { notIn: STATUTS_EXCLUS },
      },
      include: { fournisseur: true, lignes: true },
    });
  },
  stocks() {
    return prisma.stock.findMany({ include: { produit: true } });
  },
  balanceClients() {
    return prisma.facture.groupBy({
      by: ["idClient"],
      _sum: { totalTtc: true, montantPaye: true },
    });
  },
  balanceFournisseurs() {
    return prisma.facture.groupBy({
      by: ["idFournisseur"],
      _sum: { totalTtc: true, montantPaye: true },
    });
  },
};
