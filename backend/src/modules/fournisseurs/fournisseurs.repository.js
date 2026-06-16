import prisma from "../../config/database.js";
import { createRepository } from "../_shared/repository.factory.js";

export const fournisseursRepository = {
  ...createRepository("fournisseur", { produits: { include: { produit: true } } }),
  countAll() { return prisma.fournisseur.count(); },
};

