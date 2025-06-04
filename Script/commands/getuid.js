module.exports.config = {
  name: "getuid",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Get current group UID",
  commandCategory: "Box",
  usages: "getuid",
  cooldowns: 0
};

module.exports.run = async function({ api, event }) {
  const threadID = event.threadID;
  const threadName = event.threadName || "Unknown";
  api.sendMessage(
    `🔎 Group Name: ${threadName}\n🆔 Group UID: ${threadID}`,
    threadID,
    event.messageID
  );
};
