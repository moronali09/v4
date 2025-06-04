const fs = require("fs");
const axios = require("axios");

module.exports.config = {
  name: "elv",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "moron ali",
  description: "Text to voice using ElevenLabs",
  commandCategory: "tools",
  usages: "/elv {text} or reply",
  cooldowns: 2,
};

module.exports.run = async ({ api, event, args }) => {
  const apiKey = "sk_b178aae4b3045f981ac8369a6f304c282ff750d8c0e1360f";
  const text = args.join(" ") || event.messageReply?.body;

  if (!text) return api.sendMessage("/elv <text> or reply", event.threadID, event.messageID);

  const voiceID = "pNInz6obpgDQGcFmaJgB"; 

  try {
    const response = await axios({
      method: "post",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceID}`,
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      data: {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      responseType: "arraybuffer"
    });

    const audioPath = __dirname + `/voice-${event.senderID}.mp3`;
    fs.writeFileSync(audioPath, Buffer.from(response.data), "binary");

    api.sendMessage(
      { attachment: fs.createReadStream(audioPath) },
      event.threadID,
      () => fs.unlinkSync(audioPath)
    );

  } catch (error) {
    console.log(error.response?.data || error.message);
    api.sendMessage("❌ voice error", event.threadID);
  }
};
