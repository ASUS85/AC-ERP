import prisma from "../../config/database.js";

export const iaRepository = {
  createConversation(userId, titre) {
    return prisma.conversationIa.create({
      data: {
        idUtilisateur: userId,
        titre: titre?.slice(0, 255) || "Nouvelle conversation",
      },
    });
  },
  findConversations(userId) {
    return prisma.conversationIa.findMany({
      where: { idUtilisateur: userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { messages: true } } },
    });
  },
  findConversationById(id) {
    return prisma.conversationIa.findUnique({ where: { id } });
  },
  updateConversationTitle(id, titre) {
    return prisma.conversationIa.update({
      where: { id },
      data: { titre: titre.slice(0, 255) },
    });
  },
  deleteConversation(id) {
    return prisma.conversationIa.delete({ where: { id } });
  },
  createMessages(messages) {
    return prisma.messageIa.createMany({ data: messages });
  },
  findMessages(idConversation) {
    return prisma.messageIa.findMany({
      where: { idConversation },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  },
  createRapport(data) {
    return prisma.rapportIa.create({ data });
  },
  findRapports(userId) {
    return prisma.rapportIa.findMany({
      where: { idUtilisateur: userId },
      orderBy: { createdAt: "desc" },
    });
  },
  findRapportById(id) {
    return prisma.rapportIa.findUnique({ where: { id } });
  },
  async savePrevision(data) {
    const periode = new Date(data.periode);
    const periodeNormalisee = new Date(
      Date.UTC(
        periode.getUTCFullYear(),
        periode.getUTCMonth(),
        periode.getUTCDate(),
      ),
    );
    const where = {
      idProduit_periode: {
        idProduit: data.idProduit,
        periode: periodeNormalisee,
      },
    };
    const payload = { ...data, periode: periodeNormalisee };
    try {
      return await prisma.previsionVente.upsert({
        where,
        update: payload,
        create: payload,
      });
    } catch (error) {
      if (error?.code !== "P2002") throw error;
      return prisma.previsionVente.update({ where, data: payload });
    }
  },
  saveAlerteRupture(data) {
    return prisma.alerteRupture.create({ data });
  },
  findAlerteActiveByProduit(idProduit) {
    return prisma.alerteRupture.findFirst({
      where: { idProduit, resolue: false },
      orderBy: { createdAt: "desc" },
    });
  },
  findAlertesActives() {
    return prisma.alerteRupture.findMany({
      where: { resolue: false },
      orderBy: { joursAvantRupture: "asc" },
      include: { produit: true },
    });
  },

  // Compatibilite avec les anciens appels du module.
  previsions(args = {}) {
    return prisma.previsionVente.findMany({
      ...args,
      include: { produit: true },
    });
  },
  alertesRupture() {
    return this.findAlertesActives();
  },
  conversations(userId) {
    return this.findConversations(userId);
  },
  rapports(userId) {
    return this.findRapports(userId);
  },
};
