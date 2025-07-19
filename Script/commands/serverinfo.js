const util = require('minecraft-server-util');

module.exports = {
  name: 'serverinfo',
  aliases: ['si'],
  description: 'Minecraft server',
  usage: '<ip> [port]',
  execute: async (bot, message, args) => {
    if (!args[0])
      return message.reply('Server IP deo, jemon: `!serverinfo play.example.com 25565`');

    const ip = args[0];
    const port = args[1] ? parseInt(args[1]) : 25565;

    try {
      const status = await util.status(ip, port, { timeout: 5000 });

      const reply = `
📋 Server Name: ${status.motd.clean}
🌐 IP: ${status.host}:${port}
👥 Players: ${status.players.online}/${status.players.max}
⚙️ Version: ${status.version.name}
⏱️ Ping: ${status.roundTripLatency.toFixed(2)}ms
✅ Status: Online
`;

      message.reply(reply);
    } catch (error) {
      console.error('MC Status Error:', error);
      message.reply(`
❌ Server Offline or Unreachable
IP: ${ip}:${port}
`);
    }
  },
};
