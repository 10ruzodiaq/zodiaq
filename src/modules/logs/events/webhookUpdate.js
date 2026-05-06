const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "webhookUpdate",
  async execute(channel, client) {
    try {
      if (!channel.guild) return;

      let desc = `**Webhook modifie dans <#${channel.id}>**`;

      const auditEntry = await fetchAuditLog(channel.guild, AuditLogEvent.WebhookUpdate, null, 500);
      if (auditEntry) {
        desc += `\n- Par : <@${auditEntry.executor.id}>`;
        if (auditEntry.target?.name) desc += `\n- Webhook : **${auditEntry.target.name}**`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: channel.guild.name, iconURL: channel.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: "Webhook modifie" }).setTimestamp();
      await sendLog(client, channel.guild.id, "webhookUpdate", embed);
    } catch {}
  },
};
