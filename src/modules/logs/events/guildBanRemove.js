const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "guildBanRemove",
  async execute(ban, client) {
    try {
      if (!ban.guild) return;

      let desc = `**${ban.user.tag}** a ete debanni.\n- ID : \`${ban.user.id}\``;

      const auditEntry = await fetchAuditLog(ban.guild, AuditLogEvent.MemberBanRemove, ban.user.id);
      if (auditEntry) {
        desc += `\n- Moderateur : <@${auditEntry.executor.id}>`;
        if (auditEntry.reason) desc += `\n- Raison : ${auditEntry.reason}`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: ban.user.tag, iconURL: ban.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: "Membre debanni" }).setTimestamp();
      await sendLog(client, ban.guild.id, "guildBanRemove", embed);
    } catch {}
  },
};
