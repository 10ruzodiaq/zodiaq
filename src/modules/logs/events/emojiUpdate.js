const { EmbedBuilder } = require("discord.js");
const { sendLog } = require("../../../utils/logger");

module.exports = {
  name: "emojiUpdate",
  async execute(oldEmoji, newEmoji, client) {
    try {
      if (!newEmoji.guild) return;
      if (oldEmoji.name === newEmoji.name) return;

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: newEmoji.guild.name, iconURL: newEmoji.guild.iconURL({ dynamic: true }) })
        .setDescription(`**L'emoji ${newEmoji} a ete renomme.**\n- Ancien : **:${oldEmoji.name}:**\n- Nouveau : **:${newEmoji.name}:**`)
        .setThumbnail(newEmoji.url)
        .setFooter({ text: `Emoji modifie • ID: ${newEmoji.id}` }).setTimestamp();
      await sendLog(client, newEmoji.guild.id, "emojiUpdate", embed);
    } catch {}
  },
};
