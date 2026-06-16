import prisma from "../../config/database.js";

const include = { client: true, fournisseur: true, lignes: true, paiements: true, bonLivraison: { include: { lignes: true } } };

export const facturesRepository = {
  findMany(args = {}) { return prisma.facture.findMany({ ...args, include }); },
  count(where = {}) { return prisma.facture.count({ where }); },
  findById(id) { return prisma.facture.findUnique({ where: { id }, include }); },
  create(data) { return prisma.facture.create({ data, include }); },
  update(id, data) { return prisma.facture.update({ where: { id }, data, include }); },
  createAvoir(data) { return prisma.avoir.create({ data, include: { lignes: true, facture: true } }); },
};

