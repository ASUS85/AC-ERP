import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { ApiError } from "../../utils/response.util.js";
import { BCRYPT_ROUNDS } from "../../config/constants.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";
import { sendWelcomeEmail } from "../../services/email.service.js";
import { usersRepository } from "./users.repository.js";

export const usersService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = query.search
      ? { OR: [{ nom: { contains: query.search } }, { prenom: { contains: query.search } }, { email: { contains: query.search } }] }
      : {};
    const [data, total] = await Promise.all([
      usersRepository.findMany({ where, skip: offset, take: limit, orderBy: { createdAt: "desc" } }),
      usersRepository.count(where),
    ]);
    return { data, meta: buildMeta(total, page, limit) };
  },
  async getById(id) {
    const user = await usersRepository.findById(id);
    if (!user) throw new ApiError(404, "NOT_FOUND", "Utilisateur introuvable");
    return user;
  },
  async create(data) {
    const motDePasseTemp = data.motDePasseTemp || randomUUID().slice(0, 12);
    const passwordHash = await bcrypt.hash(motDePasseTemp, BCRYPT_ROUNDS);
    const user = await usersRepository.create({ ...data, passwordHash });
    sendWelcomeEmail(user.email, user.nom, motDePasseTemp).catch(() => {});
    return user;
  },
  async update(id, data) {
    await this.getById(id);
    const { passwordHash, motDePasseTemp, ...safeData } = data;
    return usersRepository.update(id, safeData);
  },
  async remove(id) {
    await this.getById(id);
    return usersRepository.update(id, { statut: "INACTIF" });
  },
  async debloquer(id) {
    await this.getById(id);
    return usersRepository.update(id, { failedAttempts: 0, lockedUntil: null, statut: "ACTIF" });
  },
};

