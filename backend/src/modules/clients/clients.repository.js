import prisma from "../../config/database.js";
import { createRepository } from "../_shared/repository.factory.js";

export const clientsRepository = {
  ...createRepository("client"),
  countAll() { return prisma.client.count(); },
  historique(id) {
    return prisma.client.findUnique({
      where: { id },
      include: { bonsCommandeClients: true, factures: { include: { paiements: true } }, devis: true },
    });
  },
};

