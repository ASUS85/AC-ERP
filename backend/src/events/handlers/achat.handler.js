import emitter from "../emitter.js";
import { byPermission, notifyUsers } from "./notification.helpers.js";

const TITLES = {
  CREATE: "Nouveau bon de commande fournisseur",
  SEND: "Bon de commande envoye au fournisseur",
  SUBMIT: "Bon de commande soumis",
  VALIDATE: "Bon de commande valide",
  BACK_TO_DRAFT: "Bon de commande retourne en brouillon",
  CANCEL: "Bon de commande annule",
  DUPLICATE: "Bon de commande duplique",
  SUPPLIER_ACCEPT: "Bon de commande confirme par le fournisseur",
  SUPPLIER_REJECT: "Bon de commande rejete par le fournisseur",
  RECEPTION: "Reception marchandise enregistree",
  CREATE_INVOICE_ACHAT: "Facture achat creee depuis BCF",
};

const messageFor = (data) => {
  if (data.action === "CREATE_INVOICE_ACHAT") {
    return `La facture ${data.numeroFacture || "-"} a ete creee depuis le BCF ${data.numeroBcf || "-"}.`;
  }
  if (data.action === "RECEPTION") {
    return `Reception enregistree sur le BCF ${data.numeroBcf || data.idBcf || "-"} (${data.produitsRecus || 0} ligne(s) recue(s)).`;
  }
  if (data.action === "DUPLICATE") {
    return `Le BCF ${data.sourceNumeroBcf || "-"} a ete duplique en ${data.numeroBcf || "-"}.`;
  }
  return `Action ${data.action} appliquee sur le BCF ${data.numeroBcf || data.idBcf || "-"}.`;
};

emitter.on("achat.bcf.crud", (data) => {
  notifyUsers(byPermission("achats", "lire"), {
    typeNotif: "NOUVELLE_COMMANDE",
    titre: TITLES[data.action] || "Mise a jour achat",
    message: messageFor(data),
    entityType: data.idFacture ? "facture" : "bon_commande_fournisseur",
    entityId: data.idFacture || data.idBcf,
  });

  if (data.action === "CREATE_INVOICE_ACHAT" && data.idFacture) {
    notifyUsers(byPermission("factures", "lire"), {
      typeNotif: "NOUVELLE_COMMANDE",
      titre: "Nouvelle facture achat",
      message: `La facture ${data.numeroFacture || "-"} est disponible.`,
      entityType: "facture",
      entityId: data.idFacture,
    });
  }
});
