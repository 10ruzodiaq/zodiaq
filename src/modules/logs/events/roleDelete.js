const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "roleDelete",
  async execute(role, client) {
    try {
      if (!role.guild) return;

      let desc = `**Le role \`${role.name}\` a ete supprime.**\n`;
      desc += `- Couleur : **${role.hexColor}**\n`;
      desc += `- Membres qui l'avaient : **${role.members?.size || "Inconnu"}**\n`;
      desc += `- ID : \`${role.id}\``;

      const auditEntry = await fetchAuditLog(role.guild, AuditLogEvent.RoleDelete, role.id);
      if (auditEntry) {
        desc += `\n- Moderateur : <@${auditEntry.executor.id}>`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: role.guild.name, iconURL: role.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: "Role supprime" }).setTimestamp();
      await sendLog(client, role.guild.id, "roleDelete", embed);
    } catch {}
  },
};
