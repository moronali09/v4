module.exports.config = {
  name: "join",
  eventType: ["log:subscribe"], // Member join
  version: "1.0.0",
  credits: "moron ali",
  description: "Send welcome message when someone joins"
};

module.exports.run = async function({ event, api, Users }) {
  const threadID = event.threadID;
  const addedUser = event.logMessageData.addedParticipants;

  for (let user of addedUser) {
    const name = await Users.getNameUser(user.userFbId);
    const message = `🔥 গ্রুপে আগুন লাগাতে ${name} চলে এলো!`;

    api.sendMessage(message, threadID);
  }
};
