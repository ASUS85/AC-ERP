import { ApiError } from "../../utils/response.util.js";
import { createCrudService } from "../_shared/service.factory.js";
import { clientsRepository } from "./clients.repository.js";

export const clientsService = {
  ...createCrudService(clientsRepository, {
    buildWhere: (query) => ({
      ...(query.search ? { OR: [{ nom: { contains: query.search } }, { email: { contains: query.search } }, { codeClient: { contains: query.search } }] } : {}),
      ...(query.statut ? { statut: query.statut } : {}),
    }),
    beforeCreate: async (data) => ({
      ...data,
      codeClient: data.codeClient || `CLI-${String((await clientsRepository.countAll()) + 1).padStart(4, "0")}`,
    }),
  }),
  async historique(id) {
    const client = await clientsRepository.historique(id);
    if (!client) throw new ApiError(404, "NOT_FOUND", "Client introuvable");
    return client;
  },
};

