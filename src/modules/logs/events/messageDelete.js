const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, shouldIgnore, truncate, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "messageDelete",
  async execute(message, client) {
    try {
      if (!message.guild) return;

      // Message non en cache
      if (!message.author) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setDescription(`**Message Supprime**\n\n- Salon : <#${message.channel?.id || "inconnu"}>\n- Info : *Message non en cache*\n- ID : \`${message.id}\``)
          .setFooter({ text: "Message supprime" }).setTimestamp();
        await sendLog(client, message.guild.id, "messageDelete", embed);
        return;
      }

      if (shouldIgnore(message.guild.id, message.author.id, message.channel?.id, message.author.bot)) return;

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setDescription(truncate(message.content || "*Pas de texte*"))
        .setFooter({ text: `Message supprime • #${message.channel?.name || "inconnu"} • ID: ${message.id}` })
        .setTimestamp(message.createdAt);

      // Pieces jointes
      if (message.attachments?.size > 0) {
        const list = message.attachments.map(a => `- \`${a.name}\` (${a.contentType || "inconnu"}, ${(a.size / 1024).toFixed(1)} KB)`).join("\n");
        embed.setDescription(embed.data.description + `\n\n**Pieces jointes**\n${truncate(list)}`);
      }

      // Embeds
      if (message.embeds?.length > 0) {
        embed.setDescription(embed.data.description + `\n\n**Embeds** : ${message.embeds.length}`);
      }

      // Stickers
      if (message.stickers?.size > 0) {
        embed.setDescription(embed.data.description + `\n\n**Stickers** : ${message.stickers.map(s => s.name).join(", ")}`);
      }

      // Audit log pour savoir qui a supprime
      const auditEntry = await fetchAuditLog(message.guild, AuditLogEvent.MessageDelete, message.author.id);
      if (auditEntry && auditEntry.executor.id !== message.author.id) {
        embed.setDescription(embed.data.description + `\n\n**Supprime par** : <@${auditEntry.executor.id}>`);
      }

      await sendLog(client, message.guild.id, "messageDelete", embed);
    } catch {}
  },
};
