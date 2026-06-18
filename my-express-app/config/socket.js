const { Server } = require("socket.io");

let io;
const userSockets = new Map(); // Map userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on("join", (userId) => {
      if (userId) {
        userSockets.set(userId, socket.id);
        console.log(`👤 User ${userId} attached to socket ${socket.id}`);
      }
    });

    socket.on("disconnect", () => {
      // Find and remove the user mapping
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`👋 User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

const getSocketId = (userId) => {
  return userSockets.get(userId.toString());
};

module.exports = { initSocket, getIO, getSocketId };
