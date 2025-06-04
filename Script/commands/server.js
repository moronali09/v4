const fs = require("fs");
const axios = require("axios");

const dbPath = __dirname + "/serverDB.json";
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

module.exports.config = {
  name: "server",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "moron ali",
  description: "Get Minecraft server info (Java/Bedrock)",
  commandCategory: "utility",
  usages: "/server add <ip:port> <name> | /server <name/ip>",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const db = JSON.parse(fs.readFileSync(dbPath));

  const send = msg => api.sendMessage(msg, threadID, messageID);

  if (args[0] === "add") {
    const [ , ipPort, ...nameParts ] = args;
    const name = nameParts.join(" ");
    if (!ipPort || !name) return send("⚠️ Usage: /server add <ip:port> <name>");

    if (!db[threadID]) db[threadID] = {};
    db[threadID][name.toLowerCase()] = ipPort;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return send(`✅ Server added:\n📛 Name: ${name}\n🌐 IP: ${ipPort}`);
  }

  if (args.length === 0) {
    if (!db[threadID] || Object.keys(db[threadID]).length === 0)
      return send("ℹ️ No servers added for this group.");
    let list = Object.entries(db[threadID])
      .map(([n, ip]) => `• ${n} - ${ip}`)
      .join("\n");
    return send(`📋 Server list:\n${list}`);
  }

  let query = args.join(" ").toLowerCase();
  let ipPort = db[threadID]?.[query] || query;
  if (!ipPort.includes(":")) ipPort += ":25565";
  const [ip, port] = ipPort.split(":");

  try {
    const res = await axios.get(`https://api.mcstatus.io/v2/status/java/${ip}:${port}`);
    const { online, players, latency, motd } = res.data;
    if (!online) return send(`🔴 Server is offline\n🌐 ${ip}:${port}`);
    send(`🟢 Server is online
🌐 IP: ${ip}:${port}
👥 Players: ${players.online}/${players.max}
📡 Ping: ${latency}ms
📝 MOTD: ${motd.clean.join(" ")}`);
  } catch (e) {
    send(`⚠️ Could not fetch server info.\nCheck if the IP is valid.`);
  }
};
