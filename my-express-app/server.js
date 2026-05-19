const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      const os = require("os");
      const interfaces = os.networkInterfaces();
      let localIP = "localhost";

      // Find local IP address
      for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
          if (interface.family === "IPv4" && !interface.internal) {
            localIP = interface.address;
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
