const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "channelUpdate",
  async execute(oldChannel, newChannel, client) {
    try {
      if (!newChannel.guild) return;

      const changes = [];
      if (oldChannel.name !== newChannel.name) changes.push(`- Nom : **${oldChannel.name}** -> **${newChannel.name}**`);
      if (oldChannel.topic !== newChannel.topic) {
        changes.push(`- Description : **${oldChannel.topic?.substring(0, 50) || "Aucune"}** -> **${newChannel.topic?.substring(0, 50) || "Aucune"}**`);
      }
      if (oldChannel.nsfw !== newChannel.nsfw) changes.push(`- NSFW : **${newChannel.nsfw ? "Active" : "Desactive"}**`);
      if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) changes.push(`- Slowmode : **${oldChannel.rateLimitPerUser}s** -> **${newChannel.rateLimitPerUser}s**`);
      if (oldChannel.parentId !== newChannel.parentId) changes.push(`- Categorie : **${oldChannel.parent?.name || "Aucune"}** -> **${newChannel.parent?.name || "Aucune"}**`);
      if (oldChannel.bitrate !== newChannel.bitrate) changes.push(`- Bitrate : **${(oldChannel.bitrate / 1000).toFixed(0)}kbps** -> **${(newChannel.bitrate / 1000).toFixed(0)}kbps**`);
      if (oldChannel.userLimit !== newChannel.userLimit) changes.push(`- Limite : **${oldChannel.userLimit || "Illimite"}** -> **${newChannel.userLimit || "Illimite"}**`);
      if (oldChannel.rtcRegion !== newChannel.rtcRegion) changes.push(`- Region : **${oldChannel.rtcRegion || "Auto"}** -> **${newChannel.rtcRegion || "Auto"}**`);
      if (oldChannel.defaultAutoArchiveDuration !== newChannel.defaultAutoArchiveDuration) changes.push(`- Auto-archive : **${oldChannel.defaultAutoArchiveDuration || 0}min** -> **${newChannel.defaultAutoArchiveDuration || 0}min**`);

      // Permission overwrite changes
      const oldPerms = oldChannel.permissionOverwrites?.cache;
      const newPerms = newChannel.permissionOverwrites?.cache;
      if (oldPerms && newPerms) {
        const permChanges = [];
        newPerms.forEach((perm, id) => {
          const old = oldPerms.get(id);
          if (!old) permChanges.push(`Ajout permission pour <@${perm.type === 0 ? "&" : ""}${id}>`);
          else if (old.allow.bitfield !== perm.allow.bitfield || old.deny.bitfield !== perm.deny.bitfield) {
            permChanges.push(`Permission modifiee pour <@${perm.type === 0 ? "&" : ""}${id}>`);
          }
        });
        oldPerms.forEach((perm, id) => {
          if (!newPerms.has(id)) permChanges.push(`Permission retiree pour <@${perm.type === 0 ? "&" : ""}${id}>`);
        });
        if (permChanges.length > 0) changes.push(`\n**Permissions**\n${permChanges.slice(0, 5).join("\n")}`);
      }

      if (changes.length === 0) return;

      let desc = `**Le salon <#${newChannel.id}> a ete modifie.**\n\n${changes.join("\n")}`;

      const auditEntry = await fetchAuditLog(newChannel.guild, AuditLogEvent.ChannelUpdate, newChannel.id, 500);
      if (auditEntry) {
        desc += `\n\n- Modifie par : <@${auditEntry.executor.id}>`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: newChannel.guild.name, iconURL: newChannel.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: `Salon modifie • ID: ${newChannel.id}` }).setTimestamp();
      await sendLog(client, newChannel.guild.id, "channelUpdate", embed);
    } catch {}
  },
};
