module.exports.config = {
  name: "weatherauto",
  version: "1.0.1",
  hasPermssion: 2,
  credits: "moron ali",
  description: "Auto rain alert in all groups",
  commandCategory: "system",
  usages: "",
  cooldowns: 5,
  dependencies: {
    "moment-timezone": "",
    "request": ""
  },
  envConfig: {
    "OPEN_WEATHER": "b7f1db5959a1f5b2a079912b03f0cd96"
  }
};

module.exports.run = async ({ api }) => {
  const request = global.nodemodule["request"];
  const moment = global.nodemodule["moment-timezone"];
  const weatherKey = global.configModule.weatherauto.OPEN_WEATHER;

  // যেই শহরগুলো চেক করবে
  const cities = ["Dhaka", "Chittagong", "Khulna", "Barisal", "Sylhet", "Rajshahi", "Rangpur", "Mymensingh"];

  // প্রতি ১৫ মিনিটে একবার চেক করবে
  setInterval(async () => {
    cities.forEach(city => {
      const url = encodeURI(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherKey}&units=metric`);

      request(url, async (err, response, body) => {
        if (err) return console.log("Weather API error:", err);
        const data = JSON.parse(body);

        if (data.weather && data.weather[0].main.toLowerCase().includes("rain")) {
          const msg = `🌧️ এখন ${city} শহরে বৃষ্টি হচ্ছে!\n🌡️ তাপমাত্রা: ${data.main.temp}°C\n🕓 সময়: ${moment().tz("Asia/Dhaka").format("hh:mm A")}`;

          // সব গ্রুপে পাঠানো
          const allThreads = await api.getThreadList(100, null, ["INBOX"]);
          allThreads.forEach(thread => {
            if (thread.isGroup) {
              api.sendMessage(msg, thread.threadID);
            }
          });
        }
      });
    });
  }, 15 * 60 * 1000); // ১৫ মিনিট
};
