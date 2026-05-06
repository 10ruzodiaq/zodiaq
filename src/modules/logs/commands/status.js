const { getGuildConfig } = require("../../../utils/database");
const { v2Message } = require("../../../utils/v2Message");
const os = require("os");

module.exports = {
  name: "status",
  aliases: ["stats", "info", "botinfo"],
  async execute(message, args, client) {
    const guildConfig = getGuildConfig(message.guild.id);
    const configuredChannels = Object.values(guildConfig.logs).filter((id) => id).length;
    const totalCategories = Object.keys(guildConfig.logs).length;
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;
    const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    return message.reply(v2Message({
      title: "Statistiques du Bot",
      sections: [
        {
          heading: "Bot",
          body: `**Nom :** ${client.user.tag}\n**Uptime :** ${uptimeStr}\n**Latence :** ${client.ws.ping}ms`,
        },
        {
          heading: "Serveurs & Utilisateurs",
          body: `**Serveurs :** ${client.guilds.cache.size}\n**Utilisateurs :** ${client.users.cache.size}\n**Salons :** ${client.channels.cache.size}`,
        },
        {
          heading: "Configuration Logs",
          body: `**Status :** ${guildConfig.enabled ? "Activé" : "Désactivé"}\n**Logs configurés :** ${configuredChannels}/${totalCategories}\n**Ignorer bots :** ${guildConfig.ignoreBots ? "Oui" : "Non"}\n**Salons ignorés :** ${(guildConfig.ignoredChannels || []).length}`,
        },
        {
          heading: "Système",
          body: `**Node.js :** ${process.version}\n**Mémoire :** ${memMB} MB\n**OS :** ${os.platform()}`,
        },
      ],
      lines: [`-# Demandé par ${message.author}`],
    }));
  },
};
