module.exports.config = {
  name: "yt",
  aliases: ["ytsearch", "ytv", "v"],
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Moron Ali",
  description: "Send YouTube video by search term",
  commandCategory: "media",
  usages: "[search term]",
  cooldowns: 0,
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require("axios");
  const yts = require("yt-search");
  const request = require("request");

  const keyword = args.join(" ");
  if (!keyword) return api.sendMessage("🔍 কী সার্চ করবো লিখো!", event.threadID, event.messageID);

  // YouTube এ সার্চ
  const { videos } = await yts(keyword);
  if (!videos.length) return api.sendMessage("❌ কোনো ভিডিও পাই নাই!", event.threadID, event.messageID);

  const video = videos[0];
  const title = video.title;
  const url = video.url;

  api.sendMessage(`📥 নিচ্ছি ভিডিও: ${title}\n⏳ একটু অপেক্ষা করো...`, event.threadID, event.messageID);

  try {
    const res = await axios.get(`https://youtube-video-download-api-moronali.repl.co/download?url=${encodeURIComponent(url)}`);
    const videoUrl = res.data.video_url;

    // সরাসরি ভিডিও পাঠানো
    const stream = request(videoUrl);
    stream.on("response", response => {
      if (response.statusCode !== 200) {
        return api.sendMessage("❌ ভিডিও পাঠাতে সমস্যা হয়েছে!", event.threadID, event.messageID);
      }

      api.sendMessage({
        body: `✅ ${title}`,
        attachment: stream
      }, event.threadID, event.messageID);
    });

  } catch (e) {
    console.log(e);
    api.sendMessage("❌ ভিডিও আনতে সমস্যা হয়েছে!", event.threadID, event.messageID);
  }
};
