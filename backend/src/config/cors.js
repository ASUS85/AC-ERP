const allowedOrigins = new Set(
  ["http://localhost:5173", process.env.FRONTEND_URL].filter(Boolean),
);

const corsConfig = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origine CORS non autorisee"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

export default corsConfig;

