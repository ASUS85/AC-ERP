import { ApiError } from "../../utils/response.util.js";
import { generateSlug } from "../../utils/slug.util.js";
import { createCrudService } from "../_shared/service.factory.js";
import { categoriesRepository } from "./categories.repository.js";

export const categoriesService = {
  ...createCrudService(categoriesRepository, {
    buildWhere: (query) => ({
      isActive: true,
      ...(query.search ? { nom: { contains: query.search } } : {}),
      ...(query.statut ? { statut: query.statut } : {}),
    }),
    beforeCreate: async (data) => ({
      ...data,
      isActive: true,
      slug: data.slug || generateSlug(data.nom),
    }),
    beforeUpdate: async (_id, data) => ({
      ...data,
      ...(data.nom && !data.slug ? { slug: generateSlug(data.nom) } : {}),
    }),
    beforeDelete: async (category) => {
      const [children, products] = await Promise.all([
        categoriesRepository.countChildren(category.id),
        categoriesRepository.countProducts(category.id),
      ]);
      if (children || products) {
        throw new ApiError(
          400,
          "CATEGORY_NOT_EMPTY",
          "Categorie liee a des produits ou sous-categories",
        );
      }
    },
    softDeleteData: { isActive: false, statut: "INACTIF" },
  }),
  async remove(id) {
    const category = await this.getById(id);
    const children = await categoriesRepository.countChildren(category.id);
    if (children) {
      throw new ApiError(
        400,
        "CATEGORY_HAS_CHILDREN",
        "Impossible d'archiver cette categorie : elle contient des sous-categories",
      );
    }
    return categoriesRepository.archiveWithProducts(id);
  },
  arbre() {
    return categoriesRepository.findTree();
  },
};
