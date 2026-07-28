import { createCrudService } from "../_shared/service.factory.js";
import { fournisseursRepository } from "./fournisseurs.repository.js";

export const fournisseursService = createCrudService(fournisseursRepository, {
  buildWhere: (query) => ({
    ...(query.search
      ? {
          OR: [
            { raisonSociale: { contains: query.search } },
            { email: { contains: query.search } },
            { codeFournisseur: { contains: query.search } },
          ],
        }
      : {}),
    ...(query.statut ? { statut: query.statut } : {}),
  }),
  beforeCreate: async (data) => ({
    ...data,
    codeFournisseur:
      data.codeFournisseur ||
      `FOUR-${String((await fournisseursRepository.countAll()) + 1).padStart(4, "0")}`,
  }),
});
