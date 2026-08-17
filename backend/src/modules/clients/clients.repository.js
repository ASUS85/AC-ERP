import prisma from "../../config/database.js";

const include = {
  devis: true,
  bonsCommandeClients: true,
  factures: true,
};

export const clientsRepository = {
  findMany(args = {}) {
    return prisma.client.findMany({
      ...args,
      include,
    });
  },

  count(where = {}) {
    return prisma.client.count({
      where,
    });
  },

  countAll() {
    return prisma.client.count();
  },

  findById(id) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        devis: true,
        bonsCommandeClients: true,
        factures: {
          include: {
            paiements: true,
          },
        },
      },
    });
  },

  create(data) {
    return prisma.client.create({
      data,
      include,
    });
  },

  update(id, data) {
    return prisma.client.update({
      where: { id },
      data,
      include,
    });
  },

  historique(id) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        bonsCommandeClients: {
          include: {
            lignes: true,
          },
        },
        factures: {
          include: {
            paiements: true,
            lignes: true,
          },
        },
        devis: {
          include: {
            lignes: true,
          },
        },
      },
    });
  },

  async getEncours(idClient) {
    const factures = await prisma.facture.findMany({
      where: {
        idClient,
        typeFacture: "VENTE",
        statut: {
          notIn: ["SOLDEE", "ANNULEE", "BROUILLON"],
        },
      },
      select: {
        totalTtc: true,
        montantPaye: true,
      },
    });

    return factures.reduce((acc, f) => {
      const restant = Math.max(0, Number(f.totalTtc) - Number(f.montantPaye));
      return acc + restant;
    }, 0);
  },
};