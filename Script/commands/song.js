const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
 config: {
   name: "song",
   version: "1.0.1",
   hasPermssion: 0,
   credits: "moron ali",
   description: "Download YouTube audio/video",
   commandCategory: "media",
   usages: "[song name] [audio/video]",
   cooldowns: 5
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

   const msg = await api.sendMessage(
     "⏳ Downloading, please wait...",
     event.threadID,
     null,
     event.messageID
   );

   try {
     const res = await ytSearch(songName);
     const video = res.videos.sort((a, b) => b.views - a.views)[0];

     if (!video) throw new Error("No video found.");

     const titleShort =
       video.title.length > 40
         ? video.title.substring(0, 40) + "..."
         : video.title;

     const fileName = `${titleShort.replace(/[^a-zA-Z0-9]/g, "_")}.${type === "audio" ? "mp3" : "mp4"}`;
     const filePath = path.join(__dirname, "cache", fileName);

     if (!fs.existsSync("cache")) fs.mkdirSync("cache");

     if (type === "video") {
       const stream = ytdl(video.url, { quality: "highestvideo" });
       const writeStream = fs.createWriteStream(filePath);
       stream.pipe(writeStream);

       await new Promise((res, rej) => {
         writeStream.on("finish", res);
         writeStream.on("error", rej);
       });
     } else {
       const stream = ytdl(video.url, { filter: "audioonly" });
       await new Promise((res, rej) => {
         ffmpeg(stream)
           .audioBitrate(128)
           .save(filePath)
           .on("end", res)
           .on("error", rej);
       });
     }

     await api.sendMessage(
       {
         body: `🎵 Title: ${titleShort}\n⏱ Duration: ${video.timestamp}`,
         attachment: fs.createReadStream(filePath)
       },
       event.threadID,
       () => {
         fs.unlinkSync(filePath);
         api.unsendMessage(msg.messageID);
       },
       event.messageID
     );

   } catch (e) {
     console.log(e);
     api.sendMessage(
       `❌ Failed: ${e.message}`,
       event.threadID,
       () => api.unsendMessage(msg.messageID),
       event.messageID
     );
   }
 }
};
