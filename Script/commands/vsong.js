const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "vsong",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Modified by moron ali",
    description: "Download YouTube video from keyword search",
    commandCategory: "Media",
    usages: "[video name]",
    cooldowns: 5,
    dependencies: {
      "node-fetch": "",
      "yt-search": "",
    },
  },

  run: async function ({ api, event, args }) {
    const keyword = args.join(" ");
    if (!keyword)
      return api.sendMessage("Please enter a song or video name.", event.threadID, event.messageID);

    const processingMessage = await api.sendMessage("Searching for the video...", event.threadID, null, event.messageID);

    try {
      const searchResults = await ytSearch(keyword);
      if (!searchResults || !searchResults.videos.length) {
        throw new Error("No video found.");
      }

      const topResult = searchResults.videos[0];
      const videoId = topResult.videoId;
      const apiKey = "priyansh-here";
      const apiUrl = `https://priyansh-ai.onrender.com/youtube?id=${videoId}&type=video&apikey=${apiKey}`;

      const downloadResponse = await axios.get(apiUrl);
      const downloadUrl = downloadResponse.data.downloadUrl;

      const safeTitle = topResult.title.replace(/[^a-zA-Z0-9 \-_]/g, "");
      const filename = `${safeTitle}.mp4`;
      const downloadPath = path.join(__dirname, "cache", filename);

      if (!fs.existsSync(path.dirname(downloadPath))) {
        fs.mkdirSync(path.dirname(downloadPath), { recursive: true });
      }

      const response = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "stream",
      });

      const fileStream = fs.createWriteStream(downloadPath);
      response.data.pipe(fileStream);

      await new Promise((resolve, reject) => {
        fileStream.on("finish", resolve);
        fileStream.on("error", reject);
      });

      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎬 Title: ${topResult.title.substring(0, 30)}...`,
        },
        event.threadID,
        () => {
          fs.unlinkSync(downloadPath);
          api.unsendMessage(processingMessage.messageID);
        },
        event.messageID
      );
    } catch (error) {
      console.error(error);
      api.sendMessage("Failed to download video.", event.threadID, event.messageID);
    }
  },
};
