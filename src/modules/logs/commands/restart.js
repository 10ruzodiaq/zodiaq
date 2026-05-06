const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const { v2Message } = require("../../../utils/v2Message");

const RESTART_FILE = path.join(__dirname, "../../../../data/restart.json");

module.exports = {
  name: "restart",
  ownerOnly: true,
  async execute(message, args, client) {
    await message.reply(v2Message({ title: "Redémarrage", lines: ["**Redémarrage en cours...**\n\nLe bot va revenir dans quelques instants."] }));
    const dataDir = path.dirname(RESTART_FILE);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(RESTART_FILE, JSON.stringify({ channelId: message.channel.id, guildId: message.guild.id, userId: message.author.id, tag: message.author.tag, timestamp: Date.now() }, null, 2));
    console.log("Redémarrage demandé par", message.author.tag);
    setTimeout(() => {
      const child = execFile(process.execPath, [path.join(__dirname, "../../../../src/index.js")], { detached: true, stdio: "ignore", cwd: path.join(__dirname, "../../../.."), env: process.env });
      child.unref();
      process.exit(0);
    }, 1500);
  },
};
