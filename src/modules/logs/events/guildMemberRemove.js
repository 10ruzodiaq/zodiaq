const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");
const moment = require("moment");

module.exports = {
  name: "guildMemberRemove",
  async execute(member, client) {
    try {
      if (!member.guild) return;

      const duration = member.joinedAt ? moment(member.joinedAt).fromNow(true) : "Inconnu";
      const joinDate = member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : "*Inconnu*";
      const rolesList = member.roles.cache
        .filter(r => r.id !== member.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(r => `<@&${r.id}>`)
        .join(", ") || "*Aucun*";

      let desc = `**${member.user.tag}** a quitte le serveur.\n\n`;
      desc += `- Present depuis : **${duration}**\n`;
      desc += `- Rejoint le : ${joinDate}\n`;
      desc += `- ID : \`${member.id}\`\n`;
      desc += `- Roles : ${truncateRoles(rolesList)}`;

      // Check si kick via audit log
      const auditEntry = await fetchAuditLog(member.guild, AuditLogEvent.MemberKick, member.id);
      if (auditEntry) {
        desc += `\n\n**Kick par** : <@${auditEntry.executor.id}>`;
        if (auditEntry.reason) desc += `\n**Raison** : ${auditEntry.reason}`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setDescription(desc)
        .setFooter({ text: `Membre parti • ${member.guild.memberCount} membres` }).setTimestamp();
      await sendLog(client, member.guild.id, "guildMemberRemove", embed);
    } catch {}
  },
};

function truncateRoles(text) {
  if (text.length <= 500) return text;
  return text.substring(0, 497) + "...";
}
