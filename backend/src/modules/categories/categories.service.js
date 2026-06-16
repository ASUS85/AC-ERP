import { ApiError } from "../../utils/response.util.js";
import { generateSlug } from "../../utils/slug.util.js";
import { createCrudService } from "../_shared/service.factory.js";
import { categoriesRepository } from "./categories.repository.js";

export const categoriesService = {
  ...createCrudService(categoriesRepository, {
    buildWhere: (query) => ({
      ...(query.search ? { nom: { contains: query.search } } : {}),
      ...(query.statut ? { statut: query.statut } : {}),
    }),
    beforeCreate: async (data) => ({ ...data, slug: data.slug || generateSlug(data.nom) }),
    beforeUpdate: async (_id, data) => ({ ...data, ...(data.nom && !data.slug ? { slug: generateSlug(data.nom) } : {}) }),
    beforeDelete: async (category) => {
      const [children, products] = await Promise.all([
        categoriesRepository.countChildren(category.id),
        categoriesRepository.countProducts(category.id),
      ]);
      if (children || products) {
        throw new ApiError(400, "CATEGORY_NOT_EMPTY", "Categorie liee a des produits ou sous-categories");
      }
    },
  }),
  arbre() {
    return categoriesRepository.findTree();
  },
};

