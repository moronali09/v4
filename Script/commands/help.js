const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");

module.exports.config = {
    name: "help",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "moron ali",
    description: "FREE SET-UP MESSENGER",
    commandCategory: "system",
    usages: "[name | all | page]",
    cooldowns: 5,
    envConfig: {
        autoUnsend: true,
        delayUnsend: 20
    }
};

module.exports.languages = {
    "en": {
        "moduleInfo": "╭────────────╮\n |    moron ali    𝗜\n | %1 \n | %3\n | %2\n  %4\n | %5 seconds(s)\n | %6\n |\n |\n╰────────────╯",
        "helpList": '[ There are %1 commands on this bot, Use: "%2help nameCommand" to know how to use! ]',
        "user": "User",
        "adminGroup": "Admin group",
        "adminBot": "Admin bot"
    }
};

module.exports.handleEvent = function ({ api, event, getText }) {
    const { commands } = global.client;
    const { threadID, messageID, body } = event;

    if (!body || typeof body == "undefined" || body.indexOf("help") != 0) return;
    const splitBody = body.slice(body.indexOf("help")).trim().split(/\s+/);
    if (splitBody.length == 1 || !commands.has(splitBody[1].toLowerCase())) return;
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const command = commands.get(splitBody[1].toLowerCase());
    const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

    return api.sendMessage(getText("moduleInfo",
        command.config.name,
        command.config.description,
        `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
        command.config.commandCategory,
        command.config.cooldowns,
        ((command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")),
        command.config.credits), threadID, messageID);
};

module.exports.run = async function ({ api, event, args, getText }) {
    const { commands } = global.client;
    const { threadID, messageID } = event;
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
    const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

    if (args[0] == "all") {
        const commandList = commands.values();
        let group = [], msg = "";

        for (const command of commandList) {
            const category = command.config.commandCategory.toLowerCase();
            if (!group.some(item => item.group === category)) {
                group.push({ group: category, cmds: [command.config.name] });
            } else {
                group.find(item => item.group === category).cmds.push(command.config.name);
            }
        }

        group.forEach(cmdGroup => {
            msg += `🎈 ${cmdGroup.group.charAt(0).toUpperCase() + cmdGroup.group.slice(1)} \n${cmdGroup.cmds.join(' • ')}\n\n`;
        });

        return axios.get('https://loidsenpaihelpapi.miraiandgoat.repl.co').then(res => {
            let ext = res.data.data.substring(res.data.data.lastIndexOf(".") + 1);
            let admID = "61551846081032";

            api.getUserInfo(parseInt(admID), (err, data) => {
                if (err) return console.log(err);
                var obj = Object.keys(data);
                var firstname = data[obj].name.replace("@", "");

                const callback = function () {
                    api.sendMessage({
                        body: `\n\n` + msg + `══════════════\n│𝗨𝘀𝗲 ${prefix}help [Name?]\n│𝗨𝘀𝗲 ${prefix}help [Page?]\n│\n│𝗧𝗢𝗧𝗔𝗟 :  ${commands.size}\n————————————`,
                        mentions: [{
                            tag: firstname,
                            id: admID,
                            fromIndex: 0,
                        }],
                        attachment: fs.createReadStream(__dirname + `/cache/472.${ext}`)
                    }, threadID, (err, info) => {
                        fs.unlinkSync(__dirname + `/cache/472.${ext}`);
                        if (autoUnsend == true) {
                            setTimeout(() => api.unsendMessage(info.messageID), delayUnsend * 1000);
                        }
                    }, messageID);
                };

                request(res.data.data).pipe(fs.createWriteStream(__dirname + `/cache/472.${ext}`)).on("close", callback);
            });
        });
    }

    // Help [commandName]
    const command = commands.get((args[0] || "").toLowerCase());
    if (command) {
        return api.sendMessage(getText("moduleInfo",
            command.config.name,
            command.config.description,
            `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
            command.config.commandCategory,
            command.config.cooldowns,
            ((command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")),
            command.config.credits), threadID, messageID);
    }

    // Help [page]
    const itemsPerPage = 10;
    const page = parseInt(args[0]) || 1;
    const totalCommands = Array.from(commands.values());
    const totalPages = Math.ceil(totalCommands.length / itemsPerPage);
    if (page > totalPages || page < 1) return api.sendMessage(`Page ${page} does not exist.`, threadID, messageID);

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const commandPage = totalCommands.slice(start, end);

    let msg = `📖 Page ${page}/${totalPages} | Total commands: ${commands.size}\n`;
    msg += commandPage.map(cmd => `➤ ${cmd.config.name}`).join("\n");
    msg += `\n\nUse ${prefix}help [command name] for details`;

    return api.sendMessage(msg, threadID, messageID);
};
