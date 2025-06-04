module.exports.config = {
	name: "offbot",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
	description: "turn the bot off",
	commandCategory: "system",
	cooldowns: 0
        };
module.exports.run = ({event, api}) =>{
    const permission = ["100046458343946"];
  	if (!permission.includes(event.senderID)) return api.sendMessage("❌admin only", event.threadID, event.messageID);
  api.sendMessage(`[ OK ] ${global.config.BOTNAME} ✅ok boss.`,event.threadID, () =>process.exit(0))
}
