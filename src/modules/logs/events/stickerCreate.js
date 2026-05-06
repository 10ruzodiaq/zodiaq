const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "stickerCreate",
  async execute(sticker, client) {
    try {
      if (!sticker.guild) return;

      let desc = `**Sticker ajoute : \`${sticker.name}\`**\n`;
      desc += `- ID : \`${sticker.id}\`\n`;
      desc += `- Description : ${sticker.description || "*Aucune*"}\n`;
      desc += `- Format : **${sticker.format === 1 ? "PNG" : sticker.format === 2 ? "APNG" : sticker.format === 3 ? "Lottie" : sticker.format === 4 ? "GIF" : "Inconnu"}**`;

      const auditEntry = await fetchAuditLog(sticker.guild, AuditLogEvent.StickerCreate, sticker.id);
      if (auditEntry) {
        desc += `\n- Ajoute par : <@${auditEntry.executor.id}>`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: sticker.guild.name, iconURL: sticker.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: `Sticker cree • Total: ${sticker.guild.stickers.cache.size}` }).setTimestamp();
      await sendLog(client, sticker.guild.id, "stickerCreate", embed);
    } catch {}
  },
};
