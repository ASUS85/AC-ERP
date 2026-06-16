import prisma from "../../config/database.js";

export const iaRepository = {
  previsions(args = {}) { return prisma.previsionVente.findMany({ ...args, include: { produit: true } }); },
  alertesRupture() { return prisma.alerteRupture.findMany({ where: { resolue: false }, include: { produit: true } }); },
  conversations(idUtilisateur) { return prisma.conversationIa.findMany({ where: { idUtilisateur }, include: { messages: true }, orderBy: { createdAt: "desc" } }); },
  createConversationMessage(idUtilisateur, message, answer, idConversation) {
    return prisma.$transaction(async (tx) => {
      const conversation = idConversation
        ? await tx.conversationIa.findUnique({ where: { id: idConversation } })
        : await tx.conversationIa.create({ data: { idUtilisateur, titre: message.slice(0, 80) } });
      await tx.messageIa.create({ data: { idConversation: conversation.id, role: "user", contenu: message } });
      return tx.messageIa.create({ data: { idConversation: conversation.id, role: "assistant", contenu: answer } });
    });
  },
  rapports(idUtilisateur) { return prisma.rapportIa.findMany({ where: { idUtilisateur }, orderBy: { createdAt: "desc" } }); },
  createRapportJob(idUtilisateur, typeRapport, periode) {
    return prisma.rapportIa.create({ data: { idUtilisateur, typeRapport, periode, contenu: "Generation en file d'attente" } });
  },
};

