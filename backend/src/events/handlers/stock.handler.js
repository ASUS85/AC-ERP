import emitter from "../emitter.js";
import { byPermission, notifyUsers } from "./notification.helpers.js";

emitter.on("stock.alerte", (data) => {
  notifyUsers(byPermission("stocks", "lire"), {
    typeNotif: "ALERTE_STOCK",
    titre: "Alerte stock",
    message: data.message || "Un produit atteint son seuil minimum",
    entityType: "produit",
    entityId: data.idProduit,
  });
});

emitter.on("stock.rupture", (data) => {
  notifyUsers(byPermission("stocks", "lire"), {
    typeNotif: "ALERTE_STOCK",
    titre: "Rupture stock critique",
    message: data.message || "Un produit est en rupture critique",
    entityType: "produit",
    entityId: data.idProduit,
  });
});

emitter.on("stock.inventaireValide", (data) => {
  notifyUsers(byPermission("stocks", "lire"), {
    typeNotif: "ALERTE_STOCK",
    titre: "Inventaire validé",
    message: `L'inventaire ${data.reference} a été validé${data.ecarts ? ` avec ${data.ecarts} écart(s) de stock ajusté(s)` : " sans écart"}.`,
    entityType: "inventaire",
    entityId: data.idInventaire,
  });
});
