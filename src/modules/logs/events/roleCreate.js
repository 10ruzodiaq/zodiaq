const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "roleCreate",
  async execute(role, client) {
    try {
      if (!role.guild) return;

      let desc = `**Le role <@&${role.id}> a ete cree.**\n`;
      desc += `- Nom : **${role.name}**\n`;
      desc += `- Couleur : **${role.hexColor}**\n`;
      desc += `- Affiche separement : **${role.hoist ? "Oui" : "Non"}**\n`;
      desc += `- Mentionnable : **${role.mentionable ? "Oui" : "Non"}**\n`;
      desc += `- Position : **${role.position}**`;

      const auditEntry = await fetchAuditLog(role.guild, AuditLogEvent.RoleCreate, role.id);
      if (auditEntry) {
        desc += `\n- Createur : <@${auditEntry.executor.id}>`;
      }

      const embed = new EmbedBuilder().setColor(role.hexColor !== "#000000" ? role.hexColor : "#2B2D31")
        .setAuthor({ name: role.guild.name, iconURL: role.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: `Role cree • ID: ${role.id}` }).setTimestamp();
      await sendLog(client, role.guild.id, "roleCreate", embed);
    } catch {}
  },
};
