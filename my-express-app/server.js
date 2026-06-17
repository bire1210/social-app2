const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config();

const http = require("node:http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
      const os = require("node:os");
      const interfaces = os.networkInterfaces();
      let localIP = "localhost";

      // Find local IP address
      for (const name of Object.keys(interfaces)) {
        for (const netInterface of interfaces[name]) {
          if (netInterface.family === "IPv4" && !netInterface.internal) {
            localIP = netInterface.address;
            break;
          }
        }
      }

      console.log(`\n🚀 Server running on:`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Network: http://${localIP}:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `\n💡 For mobile testing, use: http://${localIP}:${PORT}/api\n`,
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
