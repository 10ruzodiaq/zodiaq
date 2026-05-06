const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "roleUpdate",
  async execute(oldRole, newRole, client) {
    try {
      if (!newRole.guild) return;

      const changes = [];
      if (oldRole.name !== newRole.name) changes.push(`- Nom : **${oldRole.name}** -> **${newRole.name}**`);
      if (oldRole.color !== newRole.color) changes.push(`- Couleur : **${oldRole.hexColor}** -> **${newRole.hexColor}**`);
      if (oldRole.hoist !== newRole.hoist) changes.push(`- Affiche separement : **${newRole.hoist ? "Desactive -> Active" : "Active -> Desactive"}**`);
      if (oldRole.mentionable !== newRole.mentionable) changes.push(`- Mentionnable : **${newRole.mentionable ? "Desactive -> Active" : "Active -> Desactive"}**`);
      if (oldRole.icon !== newRole.icon) changes.push(`- Icone : **Modifiee**`);
      if (oldRole.position !== newRole.position) changes.push(`- Position : **${oldRole.position}** -> **${newRole.position}**`);

      // Permissions
      let permChanges = "";
      if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
        const oldP = oldRole.permissions.toArray();
        const newP = newRole.permissions.toArray();
        const added = newP.filter(p => !oldP.includes(p));
        const removed = oldP.filter(p => !newP.includes(p));
        if (added.length) permChanges += `\n\n**Permissions ajoutees**\n${added.map(p => `\`${p}\``).join(", ").substring(0, 500)}`;
        if (removed.length) permChanges += `\n\n**Permissions retirees**\n${removed.map(p => `\`${p}\``).join(", ").substring(0, 500)}`;
      }

      if (changes.length === 0 && !permChanges) return;

      let desc = `**Le role <@&${newRole.id}> a ete modifie.**\n\n${changes.join("\n")}${permChanges}`;

      const auditEntry = await fetchAuditLog(newRole.guild, AuditLogEvent.RoleUpdate, newRole.id, 500);
      if (auditEntry) {
        desc += `\n\n- Modifie par : <@${auditEntry.executor.id}>`;
      }

      const embed = new EmbedBuilder().setColor(newRole.hexColor !== "#000000" ? newRole.hexColor : "#2B2D31")
        .setAuthor({ name: newRole.guild.name, iconURL: newRole.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: `Role modifie • ID: ${newRole.id}` }).setTimestamp();
      await sendLog(client, newRole.guild.id, "roleUpdate", embed);
    } catch {}
  },
};
