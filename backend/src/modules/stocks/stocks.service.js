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
    return stocks.filter((s) => s.stockActuel - s.stockReserve <= s.produit.stockMinimum);
  },
  async mouvements(query) {
    const { page, limit, offset } = getPagination(query);
    const [data, total] = await Promise.all([
      stocksRepository.mouvements({ skip: offset, take: limit, orderBy: { createdAt: "desc" } }),
      stocksRepository.countMouvements(),
    ]);
    return { data, meta: buildMeta(total, page, limit) };
  },
  async ajustement(data, context) {
    const quantite = Number(data.quantite);
    if (!quantite) throw new ApiError(400, "INVALID_QUANTITY", "Quantite invalide");
    const result = await stocksRepository.ajuster({ ...data, quantite, userId: context.user.userId });
    if (result.stock.stockActuel <= 0) emitter.emit("stock.rupture", { idProduit: data.idProduit });
    return result;
  },
  inventaires(query) { return stocksRepository.inventaires({ orderBy: { createdAt: "desc" } }); },
  inventaireById(id) { return stocksRepository.inventaireById(id); },
  createInventaire(_data, context) { return stocksRepository.createInventaire(context.user.userId); },
  validerInventaire(id, context) { return stocksRepository.validerInventaire(id, context.user.userId); },
};

