module.exports.config = {
  name: "ipdetect2",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "moron ali",
  description: "Detects 'ip' and sends server IP + rules",
  commandCategory: "auto",
  usages: "[auto ip detect]",
  cooldowns: 0
};

module.exports.handleEvent = async ({ api, event }) => {
  const groupID = "29683067108007781";
  if (event.threadID !== groupID) return;

  const content = event.body?.toLowerCase();
  if (!content || !content.includes("ip")) return;

  const userName = await api.getUserInfo(event.senderID);
  const name = userName[event.senderID]?.name || "Player";

  const msg = `@${name}\n\n ╭─❖ Shadow Elites SMP ❖─╮
IP: Shadow_Elites.ignorelist.com
🔹PORT: 25604
╰───────────────────╯

➤ Good Behavior = Peaceful Gaming
সবাই মিলে সুন্দরভাবে খেলি

╭─❌ Restricted ❌─╮
• BASE break ❎ (Land claim Active)
• চুরি ❎
• X-Ray ❎
• Toxic ❎
• গালাগালি ❎
• বিনা কারণে kill ❎
╰────────────────╯

⚔️ PVP:
• only friendly PVP ✅

🤝 Behavior:
• Respect everyone✅
• বন্ধুদের মতো চলাফেরা ✅
• কোনো সমস্যা হলে Admin কে বলো ⚠️

⚠️ Punishment:
1st time – 1 Days Ban
2st time – 10 Days Ban
3st time – Permanent BAN ☢️
`;

  return api.sendMessage({ 
    body: msg, 
    mentions: [{ tag: `@${name}`, id: event.senderID }] 
  }, event.threadID, event.messageID);
};

module.exports.run = () => {};
