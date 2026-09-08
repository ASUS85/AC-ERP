import { createRepository } from "../_shared/repository.factory.js";
import prisma from "../../config/database.js";
import { ApiError } from "../../utils/response.util.js";

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
  async archiveWithProducts(id) {
    const products = await prisma.produit.findMany({
      where: { idCategorie: id, isActive: true },
      select: { id: true, stock: { select: { stockActuel: true } } },
    });
    const hasStock = products.some(
      (product) => Number(product.stock?.stockActuel || 0) > 0,
    );
    if (hasStock) {
      throw new ApiError(
        400,
        "CATEGORY_PRODUCTS_IN_STOCK",
        "Impossible d'archiver cette categorie : des produits ont encore du stock",
      );
    }
    return prisma
      .$transaction([
        prisma.produit.updateMany({
          where: { idCategorie: id, isActive: true },
          data: { isActive: false, statut: "ARCHIVE" },
        }),
        prisma.categorie.update({
          where: { id },
          data: { isActive: false, statut: "INACTIF" },
          include: { parent: true, enfants: true },
        }),
      ])
      .then(([, category]) => category);
  },
};
