import "dotenv/config";
import app from "./app.js";
import prisma, { connectDB } from "./config/database.js";
import { initSocket } from "./services/socket.service.js";
import { initCrons } from "./cron/index.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  await connectDB();
  logger.info("Base de donnees connectee");

  const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Serveur demarre port ${PORT}`);
  });

  initSocket(server);
  initCrons();

  const shutdown = async () => {
    logger.info("Arret du serveur");
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

bootstrap().catch(async (error) => {
  logger.error(error.message, { stack: error.stack });
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
