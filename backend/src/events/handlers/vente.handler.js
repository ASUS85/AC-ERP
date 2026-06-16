import emitter from "../emitter.js";
import { byPermission, notifyUsers } from "./notification.helpers.js";

emitter.on("commande.confirmee", (data) => {
  notifyUsers(byPermission("stocks", "lire"), {
    typeNotif: "NOUVELLE_COMMANDE",
    titre: "Commande confirmee",
    message: "Une commande client doit etre preparee",
    entityType: "commande",
    entityId: data.idCommande,
  });
});

emitter.on("devis.expire", (data) => {
  notifyUsers(byPermission("ventes", "lire"), {
    typeNotif: "DEVIS_EXPIRE",
    titre: "Devis expire",
    message: "Un devis est arrive a expiration",
    entityType: "devis",
    entityId: data.idDevis,
  });
});

