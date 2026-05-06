const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { sendLog, shouldIgnore, truncate } = require("../../../utils/logger");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    try {
      if (!message.guild || !message.author) return;
      if (shouldIgnore(message.guild.id, message.author.id, message.channel?.id, message.author.bot)) return;

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setDescription(truncate(message.content || "*Pas de texte*"))
        .setFooter({ text: `Message poste • #${message.channel?.name || "inconnu"} • ID: ${message.id}` })
        .setTimestamp(message.createdAt);

      // Pieces jointes
      if (message.attachments.size > 0) {
        const attachmentList = message.attachments.map(a => `- [${a.name}](${a.url}) (${(a.size / 1024).toFixed(1)} KB)`).join("\n");
        embed.setDescription(embed.data.description + `\n\n**Pieces jointes**\n${truncate(attachmentList)}`);
        const firstImage = message.attachments.find(a => a.contentType?.startsWith("image/"));
        if (firstImage) embed.setImage(firstImage.url);
      }

      // Stickers
      if (message.stickers?.size > 0) {
        embed.setDescription(embed.data.description + `\n\n**Stickers**\n- ${message.stickers.map(s => s.name).join(", ")}`);
      }

      // Embeds
      if (message.embeds?.length > 0) {
        embed.setDescription(embed.data.description + `\n\n**Embeds** : ${message.embeds.length}`);
      }

      // Mentions
      const mentions = [];
      if (message.mentions.users.size > 0) mentions.push(`${message.mentions.users.size} utilisateur(s)`);
      if (message.mentions.roles.size > 0) mentions.push(`${message.mentions.roles.size} role(s)`);
      if (message.mentions.channels.size > 0) mentions.push(`${message.mentions.channels.size} salon(s)`);
      if (message.mentions.everyone) mentions.push("@everyone/@here");
      if (mentions.length > 0) {
        embed.setDescription(embed.data.description + `\n\n**Mentions** : ${mentions.join(", ")}`);
      }

      embed.setDescription(embed.data.description + `\n\n**[Aller au message](${message.url})**`);
      await sendLog(client, message.guild.id, "messageCreate", embed);
    } catch {}
  },
};
