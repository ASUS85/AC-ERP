import emitter from "../emitter.js";
import { byPermission, notifyUsers } from "./notification.helpers.js";

emitter.on("paiement.recu", (data) => {
  notifyUsers({ OR: [byPermission("ventes", "lire"), byPermission("factures", "lire")] }, {
    typeNotif: "PAIEMENT_RECU",
    titre: "Paiement recu",
    message: "Un paiement a ete enregistre",
    entityType: "paiement",
    entityId: data.idPaiement,
  });
});

emitter.on("facture.en_retard", (data) => {
  notifyUsers(byPermission("factures", "lire"), {
    typeNotif: "FACTURE_ECHEANCE",
    titre: "Facture en retard",
    message: "Une facture a depasse sa date d'echeance",
    entityType: "facture",
    entityId: data.idFacture,
  });
});

