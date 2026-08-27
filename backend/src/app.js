import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import corsConfig from "./config/cors.js";
import { setupSwagger } from "./config/swagger.js";
import { rateLimiter } from "./middlewares/rateLimiter.middleware.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import routes from "./modules/index.js";
import { maintenanceGuard } from "./middlewares/maintenance.middleware.js";
import { auditActivity } from "./middlewares/audit.middleware.js";
import "./events/index.js";

const app = express();
const uploadDir = process.env.UPLOAD_DIR || "./uploads";

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors(corsConfig));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(
  "/uploads",
  express.static(path.resolve(uploadDir), {
    maxAge: "1y",
    immutable: true,
  }),
);
app.use(rateLimiter);
app.use(maintenanceGuard);
app.use(auditActivity);

setupSwagger(app);

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION,
  });
});

app.use("/api/v1", routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
