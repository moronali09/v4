const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const play = require("play-dl");

module.exports = {
  config: {
    name: "vsong",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "moron ali (no api)",
    description: "Download YouTube video using keyword (no API)",
    commandCategory: "Media",
    usages: "[video name]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    const keyword = args.join(" ");
    if (!keyword)
      return api.sendMessage("Please enter a song or video name.", event.threadID, event.messageID);

    const processingMessage = await api.sendMessage("🔍 Searching video...", event.threadID, null, event.messageID);

    try {
      const results = await ytSearch(keyword);
      if (!results.videos || results.videos.length === 0)
        return api.sendMessage("❌ No video found.", event.threadID, event.messageID);

      const video = results.videos[0];
      const videoURL = video.url;
      const safeTitle = video.title.replace(/[^a-zA-Z0-9 \-_]/g, "").substring(0, 50);
      const filename = `${safeTitle}.mp4`;
      const filePath = path.join(__dirname, "cache", filename);

      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      const stream = await play.stream(videoURL, { quality: 18 });
      const file = fs.createWriteStream(filePath);

      stream.stream.pipe(file);

      file.on("finish", () => {
        api.sendMessage(
          {
            body: `🎬 Title: ${video.title.substring(0, 30)}...`,
            attachment: fs.createReadStream(filePath),
          },

          event.threadID,
          () => {
            fs.unlinkSync(filePath);
            api.unsendMessage(processingMessage.messageID);
          },
          event.messageID
        );
      });

      file.on("error", (err) => {
        console.error(err);
        api.sendMessage("❌ Error saving file.", event.threadID, event.messageID);
      });
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ Something went wrong.", event.threadID, event.messageID);
    }
  },
};
