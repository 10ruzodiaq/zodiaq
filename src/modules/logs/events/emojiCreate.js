const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "emojiCreate",
  async execute(emoji, client) {
    try {
      if (!emoji.guild) return;

      let desc = `**L'emoji ${emoji} a ete ajoute.**\n`;
      desc += `- Nom : **:${emoji.name}:**\n`;
      desc += `- ID : \`${emoji.id}\`\n`;
      desc += `- Anime : **${emoji.animated ? "Oui" : "Non"}**`;

      const auditEntry = await fetchAuditLog(emoji.guild, AuditLogEvent.EmojiCreate, emoji.id);
      if (auditEntry) {
        desc += `\n- Ajoute par : <@${auditEntry.executor.id}>`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: emoji.guild.name, iconURL: emoji.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setThumbnail(emoji.url)
        .setFooter({ text: `Emoji cree • Total: ${emoji.guild.emojis.cache.size}` }).setTimestamp();
      await sendLog(client, emoji.guild.id, "emojiCreate", embed);
    } catch {}
  },
};
