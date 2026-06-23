const mongoose = require("mongoose");
const dns = require("node:dns");

// Set Google and Cloudflare DNS servers to bypass buggy ISP routers
// This fixes the 'queryTxt EREFUSED cluster0...mongodb.net' error on Windows 
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
