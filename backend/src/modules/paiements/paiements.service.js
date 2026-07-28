import { createCrudService } from "../_shared/service.factory.js";
import { paiementsRepository } from "./paiements.repository.js";

export const paiementsService = {
  // ── Liste avec tous les filtres ────────────────────────────
  async list(query) {
    // Filtre de recherche textuelle
    const searchFilter = query.search
      ? {
          OR: [
            { reference: { contains: query.search } },
            { modePaiement: { contains: query.search } },
          ],
        }
      : {};

    // Filtre par mode de paiement exact
    const modeFilter = query.modePaiement
      ? { modePaiement: query.modePaiement }
      : {};

    // Filtre par facture
    const factureFilter = query.idFacture ? { idFacture: query.idFacture } : {};

    // Filtre par date (même logique que notifications)
    const dateFilter = {};
    if (query.dateFrom || query.dateTo) {
      dateFilter.createdAt = {};
      if (query.dateFrom) dateFilter.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) dateFilter.createdAt.lte = new Date(query.dateTo);
    }

    // Assemblage du where final
    const where = {
      ...searchFilter,
      ...modeFilter,
      ...factureFilter,
      ...dateFilter,
    };

    const [data, total] = await Promise.all([
      paiementsRepository.findMany({
        where,
        skip: query.offset || 0,
        take: query.limit || 10,
        orderBy: { createdAt: "desc" },
      }),
      paiementsRepository.count({ where }),
    ]);
    return { data, total };
  },
};
