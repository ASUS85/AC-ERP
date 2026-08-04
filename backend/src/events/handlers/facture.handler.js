import emitter from "../emitter.js";
import { byPermission, notifyUsers } from "./notification.helpers.js";

const TITLES = {
  CREATE: "Nouvelle facture creee",
  SEND: "Facture envoyee",
  CREDIT_NOTE: "Avoir facture cree",
};

const messageFor = (data) => {
  if (data.action === "SEND") {
    return `La facture ${data.numeroFacture || "-"} a ete envoyee au destinataire.`;
  }
  if (data.action === "CREDIT_NOTE") {
    return `Un avoir a ete cree sur la facture ${data.numeroFacture || "-"}.`;
  }
  return `La facture ${data.numeroFacture || "-"} a ete creee.`;
};

emitter.on("facture.crud", (data) => {
  notifyUsers(byPermission("factures", "lire"), {
    typeNotif: "NOUVELLE_COMMANDE",
    titre: TITLES[data.action] || "Mise a jour facture",
    message: messageFor(data),
    entityType: "facture",
    entityId: data.idFacture,
  });
});
