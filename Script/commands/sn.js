const ytdl = require("ytdl-core");
const ytsr = require("ytsr");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "sn",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "moron ali",
  description: "Download and send song as MP3 from YouTube",
  commandCategory: "media",
  usages: "/sn [song name]",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const query = args.join(" ");
  if (!query) return api.sendMessage("❌ any song name", event.threadID);

  try {
    // YouTube-এ গান খোঁজো
    const searchResults = await ytsr(query, { limit: 1 });
    const video = searchResults.items.find(item => item.type === "video");
    if (!video) return api.sendMessage("❌ ei song nei", event.threadID);

    const filePath = path.join(__dirname, `/cache/${event.senderID}_song.mp3`);
    const stream = ytdl(video.url, { filter: "audioonly" });

    // গান ডাউনলোড করে cache-এ সংরক্ষণ
    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    stream.on("end", () => {
      api.sendMessage(
        {
          body: `🎧 ${video.title}\n\n✅`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath)
      );
    });

    stream.on("error", (err) => {
      console.error(err);
      api.sendMessage("❌ problem", event.threadID);
    });

  } catch (e) {
    console.log(e);
    api.sendMessage("❌ song name thik moto deo.", event.threadID);
  }
};
