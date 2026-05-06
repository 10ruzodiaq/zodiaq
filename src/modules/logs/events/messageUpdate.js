const { EmbedBuilder } = require("discord.js");
const { sendLog, shouldIgnore, truncate } = require("../../../utils/logger");

module.exports = {
  name: "messageUpdate",
  async execute(oldMessage, newMessage, client) {
    try {
      if (!newMessage.guild || !newMessage.author) return;
      if (oldMessage.content === newMessage.content) return;
      if (shouldIgnore(newMessage.guild.id, newMessage.author.id, newMessage.channel?.id, newMessage.author.bot)) return;

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: newMessage.author.tag, iconURL: newMessage.author.displayAvatarURL({ dynamic: true }) })
        .setDescription(
          `**Ancien contenu**\n${truncate(oldMessage.content || "*Non disponible*")}\n\n` +
          `**Nouveau contenu**\n${truncate(newMessage.content || "*Pas de texte*")}\n\n` +
          `**[Aller au message](${newMessage.url})**`
        )
        .setFooter({ text: `Message modifie • #${newMessage.channel?.name || "inconnu"} • ID: ${newMessage.id}` })
        .setTimestamp(newMessage.editedAt || Date.now());

      // Detect ajout/retrait de pieces jointes
      const oldAttCount = oldMessage.attachments?.size || 0;
      const newAttCount = newMessage.attachments?.size || 0;
      if (oldAttCount !== newAttCount) {
        embed.setDescription(embed.data.description + `\n\n**Pieces jointes** : ${oldAttCount} -> ${newAttCount}`);
      }

      // Detect embed changes
      const oldEmbedCount = oldMessage.embeds?.length || 0;
      const newEmbedCount = newMessage.embeds?.length || 0;
      if (oldEmbedCount !== newEmbedCount) {
        embed.setDescription(embed.data.description + `\n**Embeds** : ${oldEmbedCount} -> ${newEmbedCount}`);
      }

      await sendLog(client, newMessage.guild.id, "messageUpdate", embed);
    } catch {}
  },
};
