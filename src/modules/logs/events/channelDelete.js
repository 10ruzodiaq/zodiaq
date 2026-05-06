const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, channelTypeToString, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "channelDelete",
  async execute(channel, client) {
    try {
      if (!channel.guild) return;

      let desc = `**Le salon \`${channel.name}\` a ete supprime.**\n`;
      desc += `- Type : **${channelTypeToString(channel.type)}**`;
      if (channel.parent) desc += `\n- Categorie : **${channel.parent.name}**`;
      desc += `\n- ID : \`${channel.id}\``;

      const auditEntry = await fetchAuditLog(channel.guild, AuditLogEvent.ChannelDelete, channel.id);
      if (auditEntry) {
        desc += `\n- Moderateur : <@${auditEntry.executor.id}>`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: channel.guild.name, iconURL: channel.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: "Salon supprime" }).setTimestamp();
      await sendLog(client, channel.guild.id, "channelDelete", embed);
    } catch {}
  },
};
