module.exports.config = {
  name: "ipdetect3",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "moron ali",
  description: "Detects 'ip' and sends server IP + rules",
  commandCategory: "auto",
  usages: "[auto ip detect]",
  cooldowns: 0
};

module.exports.handleEvent = async ({ api, event }) => {
  const groupID = "23919089114355014";
  if (event.threadID !== groupID) return;

  const content = event.body?.toLowerCase();
  if (!content || !content.includes("ip")) return;

  try {
    const userInfo = await api.getUserInfo(event.senderID);
    const name = userInfo[event.senderID]?.name || "Player";

    const msg = `@${name}\n\n𝗝𝗮𝘃𝗮 𝗘𝗱𝗶𝘁𝗶𝗼𝗻
🕹️ IP - axolotl.bitbyte.host:5059
━━━━━━━━━━━━━━━━━━━━━━━
𝗕𝗲𝗱𝗿𝗼𝗰𝗸 𝗘𝗱𝗶𝘁𝗶𝗼𝗻
🕹️ IP - axolotl.bitbyte.host
🕹️ PORT - 5059
━━━━━━━━━━━━━━━━━━━━━━━
📜 𝐑𝐔𝐋𝐄𝐒 👇
1.Nσ Bαԃ Lαɳɠυαɠҽ 🛑
2.Nσ Rυԃҽ Bҽԋαʋισɾ 🛑
3. PʋP করার আগে সামনের জনের পারমিশন নিতে হবে 🛑
4. Dσɳ'ƚ Bɾҽαƙ Aɳყσɳҽ Bυιʅԃʂ 🛑
5.Eʋҽɾყσɳҽ ɱυʂƚ Ⴆҽ Fɾιҽɳԃʅყ 🛑
6.Tԋҽ Hσυʂҽ Mυʂƚ Bҽ Bυιʅƚ Iɳ Tԋҽ Dҽʂιɠɳαƚҽԃ Aɾҽα Oϝ SMP - Nσƚ Fαɾ Aɯαყ 🛑
7.Aԃɱιɳ /Oɯɳҽɾ এর কাছ থেকে কিছু চাওয়া যাবে না 🛑
8. Aԃɱιɳ/Oɯɳҽɾ ρҽɾɱιʂʂισɳ ছাড়া Eɳԃ এ যাওয়া যাবে না 🛑`;

    return api.sendMessage({ 
      body: msg, 
      mentions: [{ tag: `@${name}`, id: event.senderID }] 
    }, event.threadID, event.messageID);
  } catch (err) {
    console.error("Error in ipdetect:", err);
  }
};

module.exports.run = () => {};
