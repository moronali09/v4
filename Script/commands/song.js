const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
 config: {
   name: "song",
   version: "1.0.0",
   hasPermssion: 0,
   credits: "moron ali",
   description: "Download YouTube audio/video directly without API",
   commandCategory: "Media",
   usages: "[song name] [audio/video]",
   cooldowns: 5,
   dependencies: {
     "yt-search": "",
     "ytdl-core": "",
     "fluent-ffmpeg": ""
   }
 },

 run: async function ({ api, event, args }) {
   let songName, type;

   if (
     args.length > 1 &&
     (args[args.length - 1] === "audio" || args[args.length - 1] === "video")
   ) {
     type = args.pop();
     songName = args.join(" ");
   } else {
     songName = args.join(" ");
     type = "audio";
   }

   const processingMessage = await api.sendMessage(
     "✅ Downloading from YouTube, please wait...",
     event.threadID,
     null,
     event.messageID
   );

   try {
     const searchResults = await ytSearch(songName);
     if (!searchResults || !searchResults.videos.length) {
       throw new Error("No results found.");
     }

     const topResult = searchResults.videos.sort((a, b) => b.views - a.views)[0];
     const videoUrl = topResult.url;
     const safeTitle = topResult.title.replace(/[^a-zA-Z0-9 \-_]/g, "").substring(0, 50);
     const ext = type === "audio" ? "mp3" : "mp4";
     const fileName = `${safeTitle}.${ext}`;
     const filePath = path.join(__dirname, "cache", fileName);

     if (!fs.existsSync(path.dirname(filePath))) {
       fs.mkdirSync(path.dirname(filePath), { recursive: true });
     }

     if (type === "video") {
       const videoStream = ytdl(videoUrl, { quality: "highestvideo" });
       const fileStream = fs.createWriteStream(filePath);
       videoStream.pipe(fileStream);

       await new Promise((resolve, reject) => {
         fileStream.on("finish", resolve);
         fileStream.on("error", reject);
       });

     } else {
       await new Promise((resolve, reject) => {
         const stream = ytdl(videoUrl, { filter: "audioonly" });
         ffmpeg(stream)
           .audioBitrate(128)
           .save(filePath)
           .on("end", resolve)
           .on("error", reject);
       });
     }

     await api.sendMessage(
       {
         attachment: fs.createReadStream(filePath),
         body: `🎵 Title: ${topResult.title}\n🕒 Duration: ${topResult.timestamp}`,
       },
       event.threadID,
       () => {
         fs.unlinkSync(filePath);
         api.unsendMessage(processingMessage.messageID);
       },
       event.messageID
     );

   } catch (err) {
     console.error(err);
     api.sendMessage(
       `❌ Error: ${err.message}`,
       event.threadID,
       () => api.unsendMessage(processingMessage.messageID),
       event.messageID
     );
   }
 }
};
