const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "emojiDelete",
  async execute(emoji, client) {
    try {
      if (!emoji.guild) return;

      let desc = `**L'emoji \`:${emoji.name}:\` a ete supprime.**\n`;
      desc += `- ID : \`${emoji.id}\`\n`;
      desc += `- Anime : **${emoji.animated ? "Oui" : "Non"}**`;

      const auditEntry = await fetchAuditLog(emoji.guild, AuditLogEvent.EmojiDelete, emoji.id);
      if (auditEntry) {
        desc += `\n- Supprime par : <@${auditEntry.executor.id}>`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: emoji.guild.name, iconURL: emoji.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: `Emoji supprime • Total: ${emoji.guild.emojis.cache.size}` }).setTimestamp();
      await sendLog(client, emoji.guild.id, "emojiDelete", embed);
    } catch {}
  },
};
