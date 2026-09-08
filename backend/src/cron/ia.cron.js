import cron from "node-cron";
import { buildForecasts } from "../modules/ia/ia.service.js";
import {
  byPermission,
  notifyUsers,
} from "../events/handlers/notification.helpers.js";
import logger from "../utils/logger.js";

export function startIaCron() {
  cron.schedule(
    "30 2 * * *",
    async () => {
      try {
        const result = await buildForecasts();
        for (const alerte of result.nouvellesAlertes || []) {
          await notifyUsers(byPermission("ia", "rapport"), {
            typeNotif: "RAPPORT_PRET",
            titre: "Alerte IA de stock",
            message: `${alerte.produit} risque une rupture dans environ ${alerte.joursAvantRupture} jour(s).`,
            entityType: "ia_stock",
            entityId: alerte.idProduit,
          });
        }
        logger.info(
          `CRON IA termine : ${result.nouvellesAlertes?.length || 0} nouvelle(s) alerte(s)`,
        );
      } catch (error) {
        logger.error("CRON IA echoue", { message: error.message });
      }
    },
    { timezone: "Africa/Douala" },
  );
  logger.info("CRON IA planifie (previsions et alertes chaque nuit a 2h30)");
}
