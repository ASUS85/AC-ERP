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
    if (inventaire.lignes.some((ligne) => ligne.stockReel === null)) {
      throw new ApiError(
        400,
        "INVENTORY_COUNT_INCOMPLETE",
        "Saisissez le stock physique pour chaque ligne avant validation",
      );
    }
    const validated = await stocksRepository.validerInventaire(
      id,
      context.user.userId,
    );
    const ecarts = validated.lignes.filter(
      (ligne) => ligne.stockReel !== ligne.stockTheorique,
    ).length;
    emitter.emit("stock.inventaireValide", {
      idInventaire: validated.id,
      reference: `#${validated.id.slice(0, 8)}`,
      ecarts,
    });
    return validated;
  },
  async enregistrerComptageInventaire(id, lignes) {
    const inventaire = await stocksRepository.inventaireById(id);
    if (!inventaire) {
      throw new ApiError(404, "NOT_FOUND", "Inventaire introuvable");
    }
    if (inventaire.statut !== "EN_COURS") {
      throw new ApiError(
        409,
        "BUSINESS_RULE_VIOLATION",
        "Cet inventaire ne peut plus etre modifie",
      );
    }
    if (!Array.isArray(lignes) || !lignes.length) {
      throw new ApiError(400, "INVALID_COUNTS", "Aucun comptage fourni");
    }
    const ids = new Set();
    const normalizedLines = lignes.map((ligne) => {
      const stockReel = Number(ligne.stockReel);
      if (
        !ligne.id ||
        ids.has(ligne.id) ||
        !Number.isInteger(stockReel) ||
        stockReel < 0
      ) {
        throw new ApiError(400, "INVALID_COUNTS", "Comptage physique invalide");
      }
      ids.add(ligne.id);
      return { id: ligne.id, stockReel };
    });
    return stocksRepository.enregistrerComptageInventaire(id, normalizedLines);
  },
  async rafraichirInventaire(id) {
    const inventaire = await stocksRepository.inventaireById(id);
    if (!inventaire) {
      throw new ApiError(404, "NOT_FOUND", "Inventaire introuvable");
    }
    if (inventaire.statut !== "EN_COURS") {
      throw new ApiError(
        409,
        "BUSINESS_RULE_VIOLATION",
        "Seul un inventaire en cours peut etre actualise",
      );
    }
    return stocksRepository.rafraichirInventaire(id);
  },
  async annulerInventaire(id) {
    const inventaire = await stocksRepository.inventaireById(id);
    if (!inventaire) {
      throw new ApiError(404, "NOT_FOUND", "Inventaire introuvable");
    }
    if (inventaire.statut !== "EN_COURS") {
      throw new ApiError(
        409,
        "BUSINESS_RULE_VIOLATION",
        "Cet inventaire ne peut pas etre annule",
      );
    }
    return stocksRepository.annulerInventaire(id);
  },
};
