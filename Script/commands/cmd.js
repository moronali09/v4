const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "cmd",
    version: "1.0.0",
    author: "moron ali",
    description: "Manage command modules: load, unload, loadAll, unloadAll, info, count",
    usage: "{p}cmd [load|unload|loadAll|unloadAll|info|count] [moduleName]",
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
    // Only admins can use this command
    const senderID = event.senderID;
    if (!global.GoatBot.config.adminIDs || !global.GoatBot.config.adminIDs.includes(senderID)) {
        return api.sendMessage("⛔ You do not have permission to use this command.", event.threadID, event.messageID);
    }

    if (!args[0]) {
        return api.sendMessage("ℹ️ Usage: {p}cmd [load|unload|loadAll|unloadAll|info|count] [moduleName]", event.threadID, event.messageID);
    }

    const command = args[0].toLowerCase();
    const commandsObj = global.GoatBot.commands;
    const isMap = commandsObj instanceof Map;
    const cmdName = module.exports.config.name;

    switch (command) {
        case "load": {
            if (!args[1]) {
                return api.sendMessage("⚠️ Please specify a module name to load.", event.threadID, event.messageID);
            }
            const moduleName = args[1].endsWith('.js') ? args[1] : `${args[1]}.js`;
            const modulePath = path.join(__dirname, moduleName);
            if (!fs.existsSync(modulePath)) {
                return api.sendMessage(`❌ Module '${moduleName}' does not exist.`, event.threadID, event.messageID);
            }
            try {
                delete require.cache[require.resolve(modulePath)];
                const newModule = require(modulePath);
                const key = newModule.config && newModule.config.name ? newModule.config.name : args[1];
                if (isMap) {
                    commandsObj.set(key, newModule);
                } else {
                    commandsObj[key] = newModule;
                }
                return api.sendMessage(`✅ Loaded module '${key}'.`, event.threadID, event.messageID);
            } catch (error) {
                return api.sendMessage(`❌ Error loading module: ${error.message}`, event.threadID, event.messageID);
            }
        }
        case "unload": {
            if (!args[1]) {
                return api.sendMessage("⚠️ Please specify a module name to unload.", event.threadID, event.messageID);
            }
            const moduleName = args[1];
            let hasModule = false;
            if (isMap) {
                hasModule = commandsObj.has(moduleName);
            } else {
                hasModule = Object.prototype.hasOwnProperty.call(commandsObj, moduleName);
            }
            if (!hasModule) {
                return api.sendMessage(`❌ Module '${moduleName}' is not loaded.`, event.threadID, event.messageID);
            }
            try {
                const modulePath = path.join(__dirname, moduleName + ".js");
                delete require.cache[require.resolve(modulePath)];
                if (isMap) {
                    commandsObj.delete(moduleName);
                } else {
                    delete commandsObj[moduleName];
                }
                return api.sendMessage(`✅ Unloaded module '${moduleName}'.`, event.threadID, event.messageID);
            } catch (error) {
                return api.sendMessage(`❌ Error unloading module: ${error.message}`, event.threadID, event.messageID);
            }
        }
        case "loadall": {
            const files = fs.readdirSync(__dirname);
            let count = 0;
            for (const file of files) {
                if (file === path.basename(__filename)) continue;
                if (!file.endsWith(".js")) continue;
                const modulePath = path.join(__dirname, file);
                try {
                    delete require.cache[require.resolve(modulePath)];
                    const loadedModule = require(modulePath);
                    const key = loadedModule.config && loadedModule.config.name ? loadedModule.config.name : path.basename(file, ".js");
                    if (key === cmdName) continue; // Skip itself
                    if (isMap) {
                        commandsObj.set(key, loadedModule);
                    } else {
                        commandsObj[key] = loadedModule;
                    }
                    count++;
                } catch (error) {
                    // ignore errors for individual modules
                }
            }
            return api.sendMessage(`✅ Loaded ${count} module(s).`, event.threadID, event.messageID);
        }
        case "unloadall": {
            let count = 0;
            if (isMap) {
                const keys = Array.from(commandsObj.keys());
                for (const key of keys) {
                    if (key === cmdName) continue;
                    try {
                        delete require.cache[require.resolve(path.join(__dirname, key + ".js"))];
                    } catch {}
                    commandsObj.delete(key);
                    count++;
                }
            } else {
                for (const key of Object.keys(commandsObj)) {
                    if (key === cmdName) continue;
                    try {
                        delete require.cache[require.resolve(path.join(__dirname, key + ".js"))];
                    } catch {}
                    delete commandsObj[key];
                    count++;
                }
            }
            return api.sendMessage(`✅ Unloaded ${count} module(s).`, event.threadID, event.messageID);
        }
        case "info": {
            if (!args[1]) {
                return api.sendMessage("⚠️ Please specify a module name to get info.", event.threadID, event.messageID);
            }
            const moduleName = args[1];
            let moduleRef;
            if (isMap) {
                moduleRef = commandsObj.get(moduleName);
            } else {
                moduleRef = commandsObj[moduleName];
            }
            if (!moduleRef) {
                return api.sendMessage(`❌ Module '${moduleName}' is not loaded.`, event.threadID, event.messageID);
            }
            const cfg = moduleRef.config || {};
            const infoLines = [];
            infoLines.push(`Module Name: ${cfg.name || moduleName}`);
            if (cfg.version) infoLines.push(`Version: ${cfg.version}`);
            if (cfg.author) infoLines.push(`Author: ${cfg.author}`);
            if (cfg.description) infoLines.push(`Description: ${cfg.description}`);
            return api.sendMessage(infoLines.join("\n"), event.threadID, event.messageID);
        }
        case "count": {
            let count;
            if (isMap) {
                count = commandsObj.size;
            } else {
                count = Object.keys(commandsObj).length;
            }
            return api.sendMessage(`📦 Currently loaded modules: ${count}`, event.threadID, event.messageID);
        }
        default: {
            return api.sendMessage("❓ Unknown subcommand. Available: load, unload, loadAll, unloadAll, info, count.", event.threadID, event.messageID);
        }
    }
};
