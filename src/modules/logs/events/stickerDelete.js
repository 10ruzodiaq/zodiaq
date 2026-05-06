const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, fetchAuditLog } = require("../../../utils/logger");

module.exports = {
  name: "stickerDelete",
  async execute(sticker, client) {
    try {
      if (!sticker.guild) return;

      let desc = `**Sticker supprime : \`${sticker.name}\`**\n`;
      desc += `- ID : \`${sticker.id}\``;

      const auditEntry = await fetchAuditLog(sticker.guild, AuditLogEvent.StickerDelete, sticker.id);
      if (auditEntry) {
        desc += `\n- Supprime par : <@${auditEntry.executor.id}>`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: sticker.guild.name, iconURL: sticker.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: `Sticker supprime • Total: ${sticker.guild.stickers.cache.size}` }).setTimestamp();
      await sendLog(client, sticker.guild.id, "stickerDelete", embed);
    } catch {}
  },
};
