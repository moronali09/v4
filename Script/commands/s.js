const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "s",
    version: "1.0",
    author: "moron ali",
    description: "Convert text to speech using ElevenLabs API",
    usage: "/s [text]",
    commandCategory: "voice",
    cooldowns: 3,
  },

  onStart: async function ({ api, event, args }) {
    const text = args.join(" ");
    if (!text)
      return api.sendMessage("🔊 দয়া করে কিছু লেখো!\nযেমন: /s Hello", event.threadID, event.messageID);

    const apiKey = "sk_c1559b0ce09e353996931397d6f146f77fee28fdf04846c2";
    const voiceId = "21m00Tcm4TlvDq8ikWAM";

    try {
      const response = await axios({
        method: "POST",
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        data: {
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.8,
          },
        },
        responseType: "stream",
      });

      const filePath = path.join(__dirname, "s.mp3");
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: "✅ Here's your voice:",
            attachment: fs.createReadStream(filePath),
          },
          event.threadID,
          () => fs.unlinkSync(filePath),
          event.messageID
        );
      });
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ ভয়েস পাঠাতে সমস্যা হয়েছে!", event.threadID, event.messageID);
    }
  },
};
