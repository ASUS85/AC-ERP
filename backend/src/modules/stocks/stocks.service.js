import { ApiError } from "../../utils/response.util.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";
import emitter from "../../events/emitter.js";
import { stocksRepository } from "./stocks.repository.js";

export const stocksService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const [data, total] = await Promise.all([
      stocksRepository.findMany({ skip: offset, take: limit }),
      stocksRepository.count(),
    ]);
    return { data, meta: buildMeta(total, page, limit) };
  },
  async alertes() {
    const stocks = await stocksRepository.alertes();
    return stocks.filter(
      (s) => s.stockActuel - s.stockReserve <= s.produit.stockMinimum,
    );
  },
  async mouvements(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query?.date) {
      const selectedDate = new Date(query.date);
      if (!Number.isNaN(selectedDate.getTime())) {
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        where.createdAt = { gte: start, lt: end };
      }
    }
    const [data, total] = await Promise.all([
      stocksRepository.mouvements({
        skip: offset,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
      }),
      stocksRepository.countMouvements(where),
    ]);
    return { data, meta: buildMeta(total, page, limit) };
  },
  async ajustement(data, context) {
    const quantite = Number(data.quantite);
    if (!quantite)
      throw new ApiError(400, "INVALID_QUANTITY", "Quantite invalide");
    const result = await stocksRepository.ajuster({
      ...data,
      quantite,
      userId: context.user.userId,
    });
    if (result.stock.stockActuel <= 0)
      emitter.emit("stock.rupture", { idProduit: data.idProduit });
    return result;
  },
  inventaires(query) {
    return stocksRepository.inventaires({ orderBy: { createdAt: "desc" } });
  },
  inventaireById(id) {
    return stocksRepository.inventaireById(id);
  },
  async createInventaire(_data, context) {
    const inventaireEnCours = await stocksRepository.findInventaireEnCours();
    if (inventaireEnCours) {
      throw new ApiError(
        409,
        "BUSINESS_RULE_VIOLATION",
        "Un inventaire est deja en cours",
      );
    }
    return stocksRepository.createInventaire(context.user.userId);
  },
  async validerInventaire(id, context) {
    const inventaire = await stocksRepository.inventaireById(id);
    if (!inventaire) {
      throw new ApiError(404, "NOT_FOUND", "Inventaire introuvable");
    }
    if (inventaire.statut !== "EN_COURS") {
      throw new ApiError(
        409,
        "BUSINESS_RULE_VIOLATION",
        "Cet inventaire ne peut pas etre valide",
      );
    }
    return stocksRepository.validerInventaire(id, context.user.userId);
  },
};
