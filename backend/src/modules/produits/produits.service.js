import { ApiError } from "../../utils/response.util.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";
import { generateSKU } from "../../services/numero.service.js";
import { produitsRepository } from "./produits.repository.js";

export const produitsService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {
      ...(query.search
        ? {
            OR: [
              { designation: { contains: query.search } },
              { reference: { contains: query.search } },
            ],
          }
        : {}),
      ...(query.categorieId ? { idCategorie: query.categorieId } : {}),
      ...(query.statut ? { statut: query.statut } : {}),
    };
    const [data, total] = await Promise.all([
      produitsRepository.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      produitsRepository.count(where),
    ]);
    return { data, meta: buildMeta(total, page, limit) };
  },
  async getById(id) {
    const produit = await produitsRepository.findById(id);
    if (!produit) throw new ApiError(404, "NOT_FOUND", "Produit introuvable");
    return produit;
  },
  async create(data, context) {
    const { stockInitial = 0, ...payload } = data;
    const reference = payload.reference || (await generateSKU());
    return produitsRepository.createWithStock(
      { ...payload, reference },
      Number(stockInitial),
      context.user?.userId,
    );
  },
  async update(id, data) {
    await this.getById(id);
    return produitsRepository.update(id, data);
  },
  async remove(id) {
    const produit = await this.getById(id);
    if ((produit.stock?.stockActuel || 0) > 0)
      throw new ApiError(
        400,
        "STOCK_NOT_EMPTY",
        "Impossible d'archiver un produit avec stock",
      );
    return produitsRepository.update(id, { statut: "ARCHIVE" });
  },
};
