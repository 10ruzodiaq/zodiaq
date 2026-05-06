const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, channelTypeToString, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "channelCreate",
  async execute(channel, client) {
    try {
      if (!channel.guild) return;

      let desc = `**Le salon <#${channel.id}> a ete cree.**\n`;
      desc += `- Nom : **${channel.name}**\n`;
      desc += `- Type : **${channelTypeToString(channel.type)}**`;
      if (channel.parent) desc += `\n- Categorie : **${channel.parent.name}**`;
      if (channel.nsfw) desc += `\n- NSFW : **Oui**`;

      const auditEntry = await fetchAuditLog(channel.guild, AuditLogEvent.ChannelCreate, channel.id);
      if (auditEntry) {
        desc += `\n- Createur : <@${auditEntry.executor.id}>`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: channel.guild.name, iconURL: channel.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: `Salon cree • ID: ${channel.id}` }).setTimestamp();
      await sendLog(client, channel.guild.id, "channelCreate", embed);
    } catch {}
  },
};
