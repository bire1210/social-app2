const os = require("os");

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === "IPv4" && !interface.internal) {
        return interface.address;
      }
    }
  }

  return "localhost";
}

const ip = getLocalIP();
console.log(`Your local IP address is: ${ip}`);
console.log(
  `Update your .env.local file with: NEXT_PUBLIC_API_URL=http://${ip}:5000/api`,
);
