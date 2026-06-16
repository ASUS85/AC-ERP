import prisma from "../../config/database.js";

export const dashboardRepository = {
  async kpis() {
    const [clients, produits, factures, impayees] = await Promise.all([
      prisma.client.count(),
      prisma.produit.count({ where: { statut: "ACTIF" } }),
      prisma.facture.aggregate({ _sum: { totalTtc: true, montantPaye: true } }),
      prisma.facture.count({ where: { statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "EN_RETARD"] } } }),
    ]);
    return { clients, produits, chiffreAffaires: factures._sum.totalTtc || 0, montantPaye: factures._sum.montantPaye || 0, facturesImpayees: impayees };
  },
  evolutionVentes() {
    return prisma.facture.groupBy({ by: ["dateEmission"], _sum: { totalTtc: true }, orderBy: { dateEmission: "asc" } });
  },
  topProduits() {
    return prisma.ligneFacture.groupBy({ by: ["idProduit"], _sum: { quantite: true, montantTtc: true }, orderBy: { _sum: { montantTtc: "desc" } }, take: 10 });
  },
  topClients() {
    return prisma.facture.groupBy({ by: ["idClient"], _sum: { totalTtc: true }, orderBy: { _sum: { totalTtc: "desc" } }, take: 10 });
  },
  repartitionCategories() {
    return prisma.produit.groupBy({ by: ["idCategorie"], _count: { id: true } });
  },
};

