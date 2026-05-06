const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");
const moment = require("moment");

module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    try {
      if (!member.guild) return;
      const accountAge = moment(member.user.createdAt).fromNow();
      const accountCreated = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`;
      const isNew = Date.now() - member.user.createdTimestamp < 7 * 24 * 60 * 60 * 1000;
      const isVeryNew = Date.now() - member.user.createdTimestamp < 24 * 60 * 60 * 1000;

      let desc = `**${member.user.tag}** a rejoint le serveur.\n\n`;
      desc += `- Compte cree : ${accountCreated} (${accountAge})\n`;
      desc += `- ID : \`${member.id}\`\n`;
      desc += `- Bot : **${member.user.bot ? "Oui" : "Non"}**`;

      if (isVeryNew) {
        desc += `\n\n**Compte tres recent (< 24h) !**`;
      } else if (isNew) {
        desc += `\n\n**Compte recent (< 7 jours)**`;
      }

      // Check invite used (via audit logs)
      const auditEntry = await fetchAuditLog(member.guild, AuditLogEvent.MemberUpdate, member.id, 500);
      if (auditEntry?.executor) {
        desc += `\n- Invite par : <@${auditEntry.executor.id}>`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setDescription(desc)
        .setFooter({ text: `Membre rejoint • ${member.guild.memberCount} membres` })
        .setTimestamp(member.joinedAt || Date.now());
      await sendLog(client, member.guild.id, "guildMemberAdd", embed);
    } catch {}
  },
};
