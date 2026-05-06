const { PermissionFlagsBits } = require("discord.js");
const { getGuildConfig, updateGuildConfig } = require("../../../utils/database");
const { v2Message } = require("../../../utils/v2Message");
const config = require("../../../config");

module.exports = {
  name: "logs",
  aliases: ["toggle"],
  permissions: [PermissionFlagsBits.Administrator],
  async execute(message, args, client) {
    const prefix = config.prefixes.logs;
    const guildConfig = getGuildConfig(message.guild.id);

    if (!args[0]) {
      return message.reply(v2Message({
        title: "État des Logs",
        sections: [
          {
            heading: "Status",
            body: `Les logs sont **${guildConfig.enabled ? "activés" : "désactivés"}**.`,
          },
          {
            heading: "Commandes",
            body: `\`${prefix}logs on/off\`\n\`${prefix}logs bots\`\n\`${prefix}logs ignore <#salon>\`\n\`${prefix}logs unignore <#salon>\``,
          },
        ],
      }));
    }

    const sub = args[0].toLowerCase();

    if (sub === "on" || sub === "enable") {
      updateGuildConfig(message.guild.id, "enabled", true);
      return message.reply(v2Message({ title: "Logs", lines: ["Logs **activés**."] }));
    }

    if (sub === "off" || sub === "disable") {
      updateGuildConfig(message.guild.id, "enabled", false);
      return message.reply(v2Message({ title: "Logs", lines: ["Logs **désactivés**."] }));
    }

    if (sub === "bots") {
      const current = guildConfig.ignoreBots;
      updateGuildConfig(message.guild.id, "ignoreBots", !current);
      return message.reply(v2Message({ title: "Logs", lines: [!current ? "Bots **ignorés**." : "Bots **loggés**."] }));
    }

    if (sub === "ignore") {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply(v2Message({ title: "Erreur", lines: ["Mentionnez un salon."] }));
      const ignored = guildConfig.ignoredChannels || [];
      if (ignored.includes(channel.id)) return message.reply(v2Message({ title: "Attention", lines: [`<#${channel.id}> déjà ignoré.`] }));
      ignored.push(channel.id);
      updateGuildConfig(message.guild.id, "ignoredChannels", ignored);
      return message.reply(v2Message({ title: "Logs", lines: [`<#${channel.id}> **ignoré**.`] }));
    }

    if (sub === "unignore") {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply(v2Message({ title: "Erreur", lines: ["Mentionnez un salon."] }));
      const ignored = guildConfig.ignoredChannels || [];
      const index = ignored.indexOf(channel.id);
      if (index === -1) return message.reply(v2Message({ title: "Attention", lines: [`<#${channel.id}> n'était pas ignoré.`] }));
      ignored.splice(index, 1);
      updateGuildConfig(message.guild.id, "ignoredChannels", ignored);
      return message.reply(v2Message({ title: "Logs", lines: [`<#${channel.id}> **suivi**.`] }));
    }
  },
};
