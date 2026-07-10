import prisma from "../../config/database.js";

const monthLabels = [
  "Jan",
  "Fev",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Aout",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const money = (value) =>
  new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0)) + " f";

const dateFr = (value) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

function invoiceStatusLabel(statut) {
  const labels = {
    EMISE: "Emise",
    PAYEE: "Payee",
    PARTIELLEMENT_PAYEE: "Partielle",
    EN_RETARD: "En retard",
    ANNULEE: "Annulee",
  };
  return labels[statut] || statut;
}

export const dashboardRepository = {
  async overview() {
    const [
      kpis,
      salesTrend,
      topProducts,
      stockSplit,
      alerts,
      recentSales,
      globalStats,
    ] = await Promise.all([
      this.kpis(),
      this.evolutionVentes(),
      this.topProduits(),
      this.repartitionCategories(),
      this.alertes(),
      this.dernieresVentes(),
      this.statistiquesGlobales(),
    ]);

    return {
      kpis,
      salesTrend,
      topProducts,
      stockSplit,
      alerts,
      recentSales,
      globalStats,
    };
  },

  async kpis() {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const endPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      currentSales,
      previousSales,
      payments,
      clients,
      products,
      stock,
      suppliers,
    ] = await Promise.all([
      prisma.facture.aggregate({
        where: { typeFacture: "VENTE", dateEmission: { gte: startMonth } },
        _sum: { totalTtc: true },
      }),
      prisma.facture.aggregate({
        where: {
          typeFacture: "VENTE",
          dateEmission: { gte: startPreviousMonth, lte: endPreviousMonth },
        },
        _sum: { totalTtc: true },
      }),
      prisma.paiement.aggregate({
        where: { datePaiement: { gte: startMonth } },
        _sum: { montant: true },
      }),
      prisma.client.count({ where: { statut: "ACTIF" } }),
      prisma.produit.count({ where: { statut: "ACTIF" } }),
      prisma.stock.aggregate({ _sum: { stockActuel: true } }),
      prisma.fournisseur.count({ where: { statut: "ACTIF" } }),
    ]);

    const currentAmount = Number(currentSales._sum.totalTtc || 0);
    const previousAmount = Number(previousSales._sum.totalTtc || 0);
    const delta =
      previousAmount > 0
        ? ((currentAmount - previousAmount) / previousAmount) * 100
        : 0;

    return [
      {
        label: "Chiffre d'affaires",
        value: money(currentAmount),
        delta: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} %`,
        up: delta >= 0,
        sub: "vs mois dernier",
        icon: "revenue",
      },
      {
        label: "Ventes",
        value: money(currentAmount),
        delta: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} %`,
        up: delta >= 0,
        sub: "ce mois",
        icon: "sales",
      },
      {
        label: "Clients",
        value: String(clients),
        sub: "actifs",
        icon: "customers",
      },
      {
        label: "Produits",
        value: String(products),
        sub: "references actives",
        icon: "products",
      },
      {
        label: "Stock",
        value: String(stock._sum.stockActuel || 0),
        sub: "unites disponibles",
        icon: "stock",
      },
      {
        label: "Fournisseurs",
        value: String(suppliers),
        sub: "actifs",
        icon: "suppliers",
      },
    ];
  },

  async evolutionVentes(annee = new Date().getFullYear()) {
    const start = new Date(annee, 0, 1);
    const end = new Date(annee, 11, 31, 23, 59, 59, 999);

    const factures = await prisma.facture.findMany({
      where: { dateEmission: { gte: start, lte: end } },
      select: { typeFacture: true, dateEmission: true, totalTtc: true },
    });

    const months = monthLabels.map((mois) => ({ mois, ventes: 0, achats: 0 }));

    for (const facture of factures) {
      const index = new Date(facture.dateEmission).getMonth();
      const amount = Number(facture.totalTtc || 0);
      if (facture.typeFacture === "VENTE") months[index].ventes += amount;
      if (facture.typeFacture === "ACHAT") months[index].achats += amount;
    }

    return months;
  },

  async topProduits() {
    const rows = await prisma.ligneFacture.groupBy({
      by: ["idProduit"],
      where: { idProduit: { not: null } },
      _sum: { quantite: true },
      orderBy: { _sum: { quantite: "desc" } },
      take: 5,
    });

    const products = await prisma.produit.findMany({
      where: { id: { in: rows.map((row) => row.idProduit).filter(Boolean) } },
      select: { id: true, designation: true },
    });

    const names = new Map(
      products.map((product) => [product.id, product.designation]),
    );

    return rows.map((row) => ({
      nom: names.get(row.idProduit) || "Produit inconnu",
      ventes: Number(row._sum.quantite || 0),
    }));
  },

  async topClients() {
    const rows = await prisma.facture.groupBy({
      by: ["idClient"],
      where: { idClient: { not: null }, typeFacture: "VENTE" },
      _sum: { totalTtc: true },
      orderBy: { _sum: { totalTtc: "desc" } },
      take: 5,
    });

    const clients = await prisma.client.findMany({
      where: { id: { in: rows.map((row) => row.idClient).filter(Boolean) } },
      select: { id: true, nom: true },
    });

    const names = new Map(clients.map((client) => [client.id, client.nom]));

    return rows.map((row) => ({
      client: names.get(row.idClient) || "Client inconnu",
      chiffreAffaires: Number(row._sum.totalTtc || 0),
    }));
  },

  async repartitionCategories() {
    const rows = await prisma.stock.findMany({
      include: { produit: { include: { categorie: true } } },
    });

    const totals = new Map();
    let totalStock = 0;

    for (const row of rows) {
      const name = row.produit.categorie.nom;
      const quantity = Number(row.stockActuel || 0);
      totalStock += quantity;
      totals.set(name, (totals.get(name) || 0) + quantity);
    }

    if (totalStock === 0) return [];

    return [...totals.entries()]
      .map(([name, quantity]) => ({
        name,
        value: Math.round((quantity / totalStock) * 100),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  },

  async statistiquesGlobales() {
    const now = new Date();
    const startYear = new Date(now.getFullYear(), 0, 1);
    const endYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const [
      ventesAnnee,
      achatsAnnee,
      ventesCount,
      achatsCount,
      paiementsAnnee,
      facturesImpayees,
      produitsActifs,
      clientsActifs,
      fournisseursActifs,
      stocks,
    ] = await Promise.all([
      prisma.facture.aggregate({
        where: {
          typeFacture: "VENTE",
          dateEmission: { gte: startYear, lte: endYear },
        },
        _sum: { totalTtc: true, totalHt: true },
      }),
      prisma.facture.aggregate({
        where: {
          typeFacture: "ACHAT",
          dateEmission: { gte: startYear, lte: endYear },
        },
        _sum: { totalTtc: true, totalHt: true },
      }),
      prisma.facture.count({
        where: {
          typeFacture: "VENTE",
          dateEmission: { gte: startYear, lte: endYear },
        },
      }),
      prisma.facture.count({
        where: {
          typeFacture: "ACHAT",
          dateEmission: { gte: startYear, lte: endYear },
        },
      }),
      prisma.paiement.aggregate({
        where: { datePaiement: { gte: startYear, lte: endYear } },
        _sum: { montant: true },
      }),
      prisma.facture.count({
        where: {
          statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "EN_RETARD"] },
        },
      }),
      prisma.produit.count({ where: { statut: "ACTIF" } }),
      prisma.client.count({ where: { statut: "ACTIF" } }),
      prisma.fournisseur.count({ where: { statut: "ACTIF" } }),
      prisma.stock.findMany({
        include: {
          produit: { select: { prixAchatHt: true, stockMinimum: true } },
        },
      }),
    ]);

    const totalVentes = Number(ventesAnnee._sum.totalTtc || 0);
    const totalAchats = Number(achatsAnnee._sum.totalTtc || 0);
    const valeurStock = stocks.reduce(
      (sum, stock) =>
        sum +
        Number(stock.stockActuel || 0) *
          Number(stock.produit?.prixAchatHt || 0),
      0,
    );
    const produitsSousSeuil = stocks.filter(
      (stock) =>
        Number(stock.stockActuel || 0) <=
        Number(stock.produit?.stockMinimum || 0),
    ).length;

    return {
      annee: now.getFullYear(),
      totalVentes,
      totalAchats,
      margeBrute: totalVentes - totalAchats,
      margeBrutePourcentage:
        totalVentes > 0 ? ((totalVentes - totalAchats) / totalVentes) * 100 : 0,
      nombreVentes: ventesCount,
      nombreAchats: achatsCount,
      panierMoyen: ventesCount > 0 ? totalVentes / ventesCount : 0,
      paiementsRecus: Number(paiementsAnnee._sum.montant || 0),
      facturesImpayees,
      valeurStock,
      produitsActifs,
      produitsSousSeuil,
      clientsActifs,
      fournisseursActifs,
    };
  },

  async alertes() {
    const [products, lateInvoices] = await Promise.all([
      prisma.produit.findMany({
        select: {
          stockMinimum: true,
          stock: { select: { stockActuel: true } },
        },
      }),
      prisma.facture.count({
        where: {
          statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "EN_RETARD"] },
        },
      }),
    ]);

    const lowStock = products.filter(
      (product) =>
        Number(product.stock?.stockActuel || 0) <=
        Number(product.stockMinimum || 0),
    ).length;

    const alerts = [];

    if (lowStock > 0) {
      alerts.push({
        type: "warning",
        title: "Stock faible",
        text: `${lowStock} produit${lowStock > 1 ? "s" : ""} sous le seuil minimum`,
        icon: "stock",
      });
    }

    if (lateInvoices > 0) {
      alerts.push({
        type: "destructive",
        title: "Factures a suivre",
        text: `${lateInvoices} facture${lateInvoices > 1 ? "s" : ""} en attente de paiement`,
        icon: "invoice",
      });
    }

    alerts.push({
      type: "info",
      title: "Analyse IA",
      text: "Les tendances du mois sont pretes a etre analysees",
      icon: "ai",
    });

    return alerts;
  },

  async dernieresVentes() {
    const factures = await prisma.facture.findMany({
      where: { typeFacture: "VENTE" },
      orderBy: { dateEmission: "desc" },
      take: 5,
      include: { client: true },
    });

    return factures.map((facture) => ({
      ref: facture.numeroFacture,
      client: facture.client?.nom || "Client inconnu",
      montant: Number(facture.totalTtc || 0),
      statut: invoiceStatusLabel(facture.statut),
      date: dateFr(facture.dateEmission),
    }));
  },
};
