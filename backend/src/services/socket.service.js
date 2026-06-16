import { Server } from "socket.io";
import logger from "../utils/logger.js";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;
    if (userId) socket.join(`user:${userId}`);
    logger.info(`Socket connecte ${socket.id}`);
    socket.on("disconnect", () => logger.info(`Socket deconnecte ${socket.id}`));
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io non initialise");
  return io;
}

export function emitToUser(userId, event, data) {
  if (io) io.to(`user:${userId}`).emit(event, data);
}

export function emitToAll(event, data) {
  if (io) io.emit(event, data);
}

