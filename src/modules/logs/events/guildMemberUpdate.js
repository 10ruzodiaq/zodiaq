const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember, client) {
    try {
      const guildId = newMember.guild.id;
      const tag = newMember.user.tag;
      const avatar = newMember.user.displayAvatarURL({ dynamic: true });

      // Changement de pseudo
      if (oldMember.nickname !== newMember.nickname) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**Changement de pseudo**\n- Ancien : ${oldMember.nickname || "*Aucun*"}\n- Nouveau : ${newMember.nickname || "*Aucun*"}`)
          .setFooter({ text: "Pseudo modifie" }).setTimestamp();

        // Audit log pour savoir qui a change le pseudo
        const auditEntry = await fetchAuditLog(newMember.guild, AuditLogEvent.MemberUpdate, newMember.id, 500);
        if (auditEntry && auditEntry.executor.id !== newMember.id) {
          embed.setDescription(embed.data.description + `\n- Modifie par : <@${auditEntry.executor.id}>`);
        }

        await sendLog(client, guildId, "guildMemberUpdate", embed);
      }

      // Changement d'avatar serveur
      if (oldMember.avatar !== newMember.avatar) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**Avatar serveur modifie**`)
          .setFooter({ text: "Avatar mis a jour" }).setTimestamp();
        if (newMember.avatar) {
          embed.setThumbnail(newMember.displayAvatarURL({ dynamic: true, size: 256 }));
        }
        await sendLog(client, guildId, "guildMemberUpdate", embed);
      }

      // Roles ajoutes
      const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
      if (addedRoles.size > 0) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**Role(s) ajoute(s)**\n${addedRoles.map(r => `<@&${r.id}>`).join(", ")}`)
          .setFooter({ text: "Roles mis a jour" }).setTimestamp();

        const auditEntry = await fetchAuditLog(newMember.guild, AuditLogEvent.MemberRoleUpdate, newMember.id, 500);
        if (auditEntry) {
          embed.setDescription(embed.data.description + `\n\n- Par : <@${auditEntry.executor.id}>`);
        }

        await sendLog(client, guildId, "guildMemberUpdate", embed);
      }

      // Roles retires
      const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));
      if (removedRoles.size > 0) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**Role(s) retire(s)**\n${removedRoles.map(r => `<@&${r.id}>`).join(", ")}`)
          .setFooter({ text: "Roles mis a jour" }).setTimestamp();

        const auditEntry = await fetchAuditLog(newMember.guild, AuditLogEvent.MemberRoleUpdate, newMember.id, 500);
        if (auditEntry) {
          embed.setDescription(embed.data.description + `\n\n- Par : <@${auditEntry.executor.id}>`);
        }

        await sendLog(client, guildId, "guildMemberUpdate", embed);
      }

      // Timeout applique/retire
      if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil) {
        if (newMember.communicationDisabledUntil) {
          const embed = new EmbedBuilder().setColor("#2B2D31")
            .setAuthor({ name: tag, iconURL: avatar })
            .setDescription(`**Timeout Applique**\n- Expire : <t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:F>\n- Duree : <t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:R>`)
            .setFooter({ text: "Exclusion temporaire" }).setTimestamp();

          const auditEntry = await fetchAuditLog(newMember.guild, AuditLogEvent.MemberUpdate, newMember.id, 500);
          if (auditEntry) {
            embed.setDescription(embed.data.description + `\n- Par : <@${auditEntry.executor.id}>`);
            if (auditEntry.reason) embed.setDescription(embed.data.description + `\n- Raison : ${auditEntry.reason}`);
          }

          await sendLog(client, guildId, "guildMemberUpdate", embed);
        } else {
          const embed = new EmbedBuilder().setColor("#2B2D31")
            .setAuthor({ name: tag, iconURL: avatar })
            .setDescription(`**Timeout Retire**`)
            .setFooter({ text: "Exclusion terminee" }).setTimestamp();

          const auditEntry = await fetchAuditLog(newMember.guild, AuditLogEvent.MemberUpdate, newMember.id, 500);
          if (auditEntry && auditEntry.executor.id !== newMember.id) {
            embed.setDescription(embed.data.description + `\n- Par : <@${auditEntry.executor.id}>`);
          }

          await sendLog(client, guildId, "guildMemberUpdate", embed);
        }
      }

      // Boost
      if (!oldMember.premiumSince && newMember.premiumSince) {
        const embed = new EmbedBuilder().setColor("#F47FFF")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**${tag}** a boost le serveur !`)
          .setFooter({ text: `Boost • ${newMember.guild.premiumSubscriptionCount} boosts` }).setTimestamp();
        await sendLog(client, guildId, "guildMemberUpdate", embed);
      }
      if (oldMember.premiumSince && !newMember.premiumSince) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**${tag}** a retire son boost.`)
          .setFooter({ text: `Boost retire • ${newMember.guild.premiumSubscriptionCount} boosts` }).setTimestamp();
        await sendLog(client, guildId, "guildMemberUpdate", embed);
      }
    } catch {}
  },
};
