import { createCrudService } from "../_shared/service.factory.js";
import { ApiError } from "../../utils/response.util.js";
import { fournisseursRepository } from "./fournisseurs.repository.js";
import { parametresRepository } from "../parametres/parametres.repository.js";
import { sendPartnershipWelcomeEmail } from "../../services/email.service.js";
import logger from "../../utils/logger.js";

const crudService = createCrudService(fournisseursRepository, {
  buildWhere: (query) => ({
    isActive: true,
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
    ...(query.ville ? { ville: { contains: query.ville } } : {}),
  }),
  beforeCreate: async (data) => ({
    ...data,
    codeFournisseur:
      data.codeFournisseur ||
      `FOUR-${String((await fournisseursRepository.countAll()) + 1).padStart(4, "0")}`,
  }),
  softDeleteData: { isActive: false, statut: "INACTIF" },
});

export const fournisseursService = {
  ...crudService,
  async getById(id) {
    const fournisseur = await fournisseursRepository.findById(id);
    if (!fournisseur) {
      throw new ApiError(404, "NOT_FOUND", "Fournisseur introuvable");
    }
    return fournisseur;
  },
  async create(data, context = {}) {
    const fournisseur = await crudService.create(data, context);

    if (fournisseur.email) {
      try {
        const entreprise = await parametresRepository.entreprise();
        await sendPartnershipWelcomeEmail(
          fournisseur.email,
          fournisseur.raisonSociale,
          entreprise.raisonSociale,
          "fournisseur",
        );
      } catch (error) {
        logger.error("Echec email de bienvenue fournisseur", {
          fournisseurId: fournisseur.id,
          code: error.code,
        });
      }
    }

    return fournisseur;
  },
};
