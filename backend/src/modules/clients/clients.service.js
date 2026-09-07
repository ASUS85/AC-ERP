import { ApiError } from "../../utils/response.util.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";
import { clientsRepository } from "./clients.repository.js";
import { parametresRepository } from "../parametres/parametres.repository.js";
import { buildClientsPdf } from "../../services/client-document.service.js";
import { sendPartnershipWelcomeEmail } from "../../services/email.service.js";
import logger from "../../utils/logger.js";

export const clientsService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);

    const where = {
      isActive: true,
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

    const enrichedData = await Promise.all(
      data.map(async (client) => {
        const encoursActuel = await clientsRepository.getEncours(client.id);
        const plafondCredit = Number(client.plafondCredit || 0);
        return {
          ...client,
          encoursActuel,
          creditDisponible: Math.max(0, plafondCredit - encoursActuel),
        };
      }),
    );

    return {
      data: enrichedData,
      meta: buildMeta(total, page, limit),
    };
  },

  async getById(id) {
    const client = await clientsRepository.findById(id);

    if (!client) {
      throw new ApiError(404, "NOT_FOUND", "Client introuvable");
    }

    const encoursActuel = await clientsRepository.getEncours(client.id);
    const plafondCredit = Number(client.plafondCredit || 0);

    return {
      ...client,
      encoursActuel,
      creditDisponible: Math.max(0, plafondCredit - encoursActuel),
    };
  },

  async getEncours(id) {
    return clientsRepository.getEncours(id);
  },

  async create(data) {
    const codeClient =
      data.codeClient ||
      `CLI-${String((await clientsRepository.countAll()) + 1).padStart(4, "0")}`;

    const client = await clientsRepository.create({
      ...data,
      codeClient,
    });

    if (client.email) {
      try {
        const entreprise = await parametresRepository.entreprise();
        await sendPartnershipWelcomeEmail(
          client.email,
          client.nom,
          entreprise.raisonSociale,
          "client",
        );
      } catch (error) {
        logger.error("Echec email de bienvenue client", {
          clientId: client.id,
          code: error.code,
        });
      }
    }

    return client;
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
