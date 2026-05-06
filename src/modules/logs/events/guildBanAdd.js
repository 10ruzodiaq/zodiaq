const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "guildBanAdd",
  async execute(ban, client) {
    try {
      if (!ban.guild) return;

      let desc = `**${ban.user.tag}** a ete banni.\n- Raison : **${ban.reason || "*Aucune*"}**\n- ID : \`${ban.user.id}\``;

      const auditEntry = await fetchAuditLog(ban.guild, AuditLogEvent.MemberBanAdd, ban.user.id);
      if (auditEntry) {
        desc += `\n- Moderateur : <@${auditEntry.executor.id}>`;
        if (auditEntry.reason && !ban.reason) desc = desc.replace("*Aucune*", auditEntry.reason);
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: ban.user.tag, iconURL: ban.user.displayAvatarURL({ dynamic: true }) })
        .setThumbnail(ban.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setDescription(desc)
        .setFooter({ text: "Membre banni" }).setTimestamp();
      await sendLog(client, ban.guild.id, "guildBanAdd", embed);
    } catch {}
  },
};
