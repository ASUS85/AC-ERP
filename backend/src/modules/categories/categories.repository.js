import { createRepository } from "../_shared/repository.factory.js";
import prisma from "../../config/database.js";

export const categoriesRepository = {
  ...createRepository("categorie", { parent: true, enfants: true }),
  findTree() {
    return prisma.categorie.findMany({
      where: { idCategorieParent: null },
      include: { enfants: { include: { enfants: true } } },
      orderBy: { nom: "asc" },
    });
  },
  countChildren(id) { return prisma.categorie.count({ where: { idCategorieParent: id } }); },
  countProducts(id) { return prisma.produit.count({ where: { idCategorie: id } }); },
};

