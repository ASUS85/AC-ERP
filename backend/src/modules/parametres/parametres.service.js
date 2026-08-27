import { ApiError } from "../../utils/response.util.js";
import { authRepository } from "../auth/auth.repository.js";
import { parametresRepository } from "./parametres.repository.js";

const companyFields = [
  "raisonSociale",
  "numeroFiscal",
  "adresse",
  "telephone",
  "email",
  "devise",
  "fuseauHoraire",
  "logo",
  "lienPlateformeEchange",
];
const systemFields = [
  "notificationsEmail",
  "alertesIa",
  "facturationAutomatique",
];

const pick = (source, fields) =>
  Object.fromEntries(
    fields
      .filter((field) => source[field] !== undefined)
      .map((field) => [field, source[field]]),
  );

async function roleName(userId) {
  const user = await authRepository.findUserById(userId);
  return user?.role?.nomRole;
}

export const parametresService = {
  entreprise: () => parametresRepository.entreprise(),
  updateEntreprise: (body) =>
    parametresRepository.updateEntreprise(pick(body, companyFields)),
  systeme: () => parametresRepository.systeme(),
  updateSysteme: (body) =>
    parametresRepository.updateSysteme(pick(body, systemFields)),
  async maintenance(userId, active) {
    const role = await roleName(userId);
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      throw new ApiError(
        403,
        "ADMIN_REQUIRED",
        "Seul l'administrateur peut gérer le mode maintenance",
      );
    }
    return parametresRepository.updateSysteme({
      modeMaintenance: Boolean(active),
    });
  },
  journal(query) {
    const where = {};
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }
    return parametresRepository.audits(where);
  },
};
