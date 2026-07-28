import prisma from "../../config/database.js";
import { createRepository } from "../_shared/repository.factory.js";

// Include par défaut pour les réponses enrichies
const defaultInclude = {
  facture: {
    select: {
      id:            true,
      numeroFacture: true,
      totalTtc:      true,
      montantPaye:   true,
      statut:        true,
    },
  },
  utilisateur: {
    select: {
      id:     true,
      nom:    true,
      prenom: true,
    },
  },
};

const base = createRepository("paiement", defaultInclude);

export const paiementsRepository = {
  ...base,
};