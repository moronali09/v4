const sentMessages = {};

module.exports.config = {
  name: "unsendall",
  version: "1.0.1",
  hasPermssion: 2, 
  credits: "moron ali",
  description: "Unsend all bot messages in this group",
  commandCategory: "admin",
  usages: "[unsendall]",
  cooldowns: 3
};

module.exports.handleEvent = async function({ api, event }) {
  if (event.senderID === api.getCurrentUserID()) {
    if (!sentMessages[event.threadID]) sentMessages[event.threadID] = [];
    sentMessages[event.threadID].push(event.messageID);

    // 50 টার বেশি হলে পুরানো মেসেজ বাদ
    if (sentMessages[event.threadID].length > 50) {
      sentMessages[event.threadID].shift();
    }
  }
};

module.exports.run = async function({ api, event }) {
  const messages = sentMessages[event.threadID] || [];

  if (messages.length === 0) {
    return api.sendMessage("❌ কোনো বট মেসেজ পাওয়া যায়নি এই গ্রুপে।", event.threadID);
  }

  let count = 0;

  for (const msgID of messages.reverse()) {
    try {
      await api.unsendMessage(msgID);
      count++;
    } catch (e) {}
  }

  sentMessages[event.threadID] = [];

  return api.sendMessage(`✅ total unsend ${count}.`, event.threadID);
};
