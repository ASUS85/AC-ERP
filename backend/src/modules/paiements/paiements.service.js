import { ApiError } from "../../utils/response.util.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";
import emitter from "../../events/emitter.js";
import { paiementsRepository } from "./paiements.repository.js";

export const paiementsService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const [data, total] = await Promise.all([
      paiementsRepository.findMany({ skip: offset, take: limit, orderBy: { createdAt: "desc" } }),
      paiementsRepository.count(),
    ]);
    return { data, meta: buildMeta(total, page, limit) };
  },
  async getById(id) {
    const paiement = await paiementsRepository.findById(id);
    if (!paiement) throw new ApiError(404, "NOT_FOUND", "Paiement introuvable");
    return paiement;
  },
  async create(data, ctx) {
    try {
      const paiement = await paiementsRepository.create({ ...data, idUtilisateur: ctx.user.userId });
      emitter.emit("paiement.recu", { idPaiement: paiement.id });
      return paiement;
    } catch (error) {
      if (error.message.includes("solde")) throw new ApiError(400, "PAYMENT_EXCEEDS_BALANCE", error.message);
      throw error;
    }
  },
};

