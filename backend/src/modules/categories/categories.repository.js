import { createRepository } from "../_shared/repository.factory.js";
import prisma from "../../config/database.js";

export const categoriesRepository = {
  ...createRepository("categorie", { parent: true, enfants: true }),
  findById(id) {
    return prisma.categorie.findUnique({
      where: { id, isActive: true },
      include: { parent: true, enfants: true },
    });
  },
  findTree() {
    return prisma.categorie.findMany({
      where: { idCategorieParent: null, isActive: true },
      include: {
        enfants: {
          where: { isActive: true },
          include: { enfants: { where: { isActive: true } } },
        },
      },
      orderBy: { nom: "asc" },
    });
  },
  countChildren(id) {
    return prisma.categorie.count({ where: { idCategorieParent: id } });
  },
  countProducts(id) {
    return prisma.produit.count({ where: { idCategorie: id } });
  },
};
