import dayjs from "dayjs";
import { ApiError } from "../../utils/response.util.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";
import { generateNumeroAvoir, generateNumeroFacture } from "../../services/numero.service.js";
import { facturesRepository } from "./factures.repository.js";

export const facturesService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = query.statut ? { statut: query.statut } : {};
    const [data, total] = await Promise.all([
      facturesRepository.findMany({ where, skip: offset, take: limit, orderBy: { createdAt: "desc" } }),
      facturesRepository.count(where),
    ]);
    return { data, meta: buildMeta(total, page, limit) };
  },
  async getById(id) {
    const facture = await facturesRepository.findById(id);
    if (!facture) throw new ApiError(404, "NOT_FOUND", "Facture introuvable");
    return facture;
  },
  async create(data, ctx) {
    return facturesRepository.create({
      numeroFacture: await generateNumeroFacture(),
      typeFacture: data.typeFacture || "VENTE",
      idClient: data.idClient,
      idFournisseur: data.idFournisseur,
      idBl: data.idBl,
      idUtilisateur: ctx.user.userId,
      dateEcheance: data.dateEcheance ? new Date(data.dateEcheance) : dayjs().add(30, "day").toDate(),
      totalHt: data.totalHt || 0,
      totalTva: data.totalTva || 0,
      totalTtc: data.totalTtc || 0,
      mentionsLegales: data.mentionsLegales,
      lignes: { create: data.lignes || [] },
    });
  },
  pdf(id) {
    return this.getById(id).then((f) => Buffer.from(`<h1>Facture ${f.numeroFacture}</h1><p>Total TTC: ${f.totalTtc}</p>`));
  },
  envoyer(id) { return this.getById(id).then((f) => ({ envoye: true, facture: f.numeroFacture })); },
  async avoir(id, data, ctx) {
    const facture = await this.getById(id);
    return facturesRepository.createAvoir({
      numeroAvoir: await generateNumeroAvoir(),
      idFacture: id,
      idUtilisateur: ctx.user.userId,
      motif: data.motif || "Avoir facture",
      totalHt: data.totalHt || facture.totalHt,
      totalTtc: data.totalTtc || facture.totalTtc,
      lignes: { create: data.lignes || [] },
    });
  },
  impayees() {
    return facturesRepository.findMany({ where: { statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "EN_RETARD"] } }, orderBy: { dateEcheance: "asc" } });
  },
};

