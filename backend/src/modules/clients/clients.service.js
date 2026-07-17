import { ApiError } from "../../utils/response.util.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";
import { clientsRepository } from "./clients.repository.js";
import { parametresRepository } from "../parametres/parametres.repository.js";
import { buildClientsPdf } from "../../services/client-document.service.js";

export const clientsService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);

    const where = {
      // Exclure les clients archivés par défaut
      statut: {
        not: "ARCHIVE",
      },
      ...(query.search
        ? {
            OR: [
              { nom: { contains: query.search } },
              { email: { contains: query.search } },
              { codeClient: { contains: query.search } },
            ],
          }
        : {}),
      ...(query.statut ? { statut: query.statut } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.ville ? { ville: query.ville } : {}),
    };

    const [data, total] = await Promise.all([
      clientsRepository.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      clientsRepository.count(where),
    ]);

    return {
      data,
      meta: buildMeta(total, page, limit),
    };
  },

  async getById(id) {
    const client = await clientsRepository.findById(id);

    if (!client) {
      throw new ApiError(404, "NOT_FOUND", "Client introuvable");
    }

    return client;
  },

  async create(data) {
    const codeClient =
      data.codeClient ||
      `CLI-${String((await clientsRepository.countAll()) + 1).padStart(4, "0")}`;

    return clientsRepository.create({
      ...data,
      codeClient,
    });
  },

  async update(id, data) {
    await this.getById(id);
    return clientsRepository.update(id, data);
  },

  async remove(id) {
    await this.getById(id);
    // Archivage plutôt que suppression physique
    return clientsRepository.update(id, {
      statut: "ARCHIVE",
    });
  },

  async historique(id) {
    const client = await clientsRepository.historique(id);

    if (!client) {
      throw new ApiError(404, "NOT_FOUND", "Client introuvable");
    }
    return client;
  },

  async exportPdf(query = {}) {
    const where = {
      statut: { not: "ARCHIVE" },
      ...(query.search
        ? {
            OR: [
              { nom: { contains: query.search } },
              { email: { contains: query.search } },
              { codeClient: { contains: query.search } },
            ],
          }
        : {}),
      ...(query.statut ? { statut: query.statut } : {}),
      ...(query.ville ? { ville: query.ville } : {}),
    };

    const [clients, entreprise] = await Promise.all([
      clientsRepository.findMany({ where, orderBy: { nom: "asc" } }),
      parametresRepository.entreprise(),
    ]);

    return {
      filename: `clients-${new Date().toISOString().slice(0, 10)}.pdf`,
      buffer: await buildClientsPdf(clients, entreprise),
    };
  },
};
