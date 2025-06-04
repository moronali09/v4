module.exports.config = {
  name: "ipdetect",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "moron ali",
  description: "Detects 'ip' and sends server IP + rules",
  commandCategory: "auto",
  usages: "[auto ip detect]",
  cooldowns: 0
};

module.exports.handleEvent = async ({ api, event }) => {
  const groupID = "29713764201603804";
  if (event.threadID !== groupID) return;

  const content = event.body?.toLowerCase();
  if (!content || !content.includes("ip")) return;

  const userName = await api.getUserInfo(event.senderID);
  const name = userName[event.senderID]?.name || "Player";

  const msg = `@${name}\n\n🔥 CraftOra BD - 𝐒𝐞𝐚𝐬𝐨𝐧 𝟏 🔥
━━━━━━━━━━━━━━━━━━━━━━━
𝗝𝗮𝘃𝗮 𝗘𝗱𝗶𝘁𝗶𝗼𝗻
🔹 IP: ip.ozima.cloud:25705

𝗕𝗲𝗱𝗿𝗼𝗰𝗸 𝗘𝗱𝗶𝘁𝗶𝗼𝗻
🔸 IP: ip.ozima.cloud
⚙️ Port: 25705
━━━━━━━━━━━━━━━━━━━━━━━

📜 Rules:
1. No bad language ❌
2. No destroying builds 💣
3. Spawn building not allowed 🏰
4. Spawn এর পাশে build করতে হবে 📍
5. সবাইকে ভালো ব্যবহার করতে হবে 😊
6. Admin & Owner-দের সম্মান দিতে হবে 🫡
━━━━━━━━━━━━━━━━━━━━━━━
✅ Join now and start your adventure!
`;

  return api.sendMessage({ 
    body: msg, 
    mentions: [{ tag: `@${name}`, id: event.senderID }] 
  }, event.threadID, event.messageID);
};

module.exports.run = () => {};
