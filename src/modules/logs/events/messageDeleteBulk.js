const { EmbedBuilder } = require("discord.js");
const { sendLog, truncate } = require("../../../utils/logger");

module.exports = {
  name: "messageDeleteBulk",
  async execute(messages, channel, client) {
    try {
      if (!channel?.guild) return;

      const authors = new Map();
      messages.forEach(m => {
        if (m.author) {
          const tag = m.author.tag;
          authors.set(tag, (authors.get(tag) || 0) + 1);
        }
      });

      const authorList = [...authors.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => `- **${tag}** : ${count}`)
        .join("\n");

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setDescription(
          `**Suppression en Masse**\n\n` +
          `- Salon : <#${channel.id}>\n` +
          `- Nombre : **${messages.size}**\n\n` +
          (authorList ? `**Auteurs**\n${authorList}` : "")
        )
        .setFooter({ text: "Messages supprimes" }).setTimestamp();

      // Apercu des derniers messages
      const preview = messages.filter(m => m.content).first(10)
        .map(m => `- **${m.author?.tag || "Inconnu"}** : ${m.content.substring(0, 80)}${m.content.length > 80 ? "..." : ""}`)
        .join("\n");
      if (preview) {
        embed.setDescription(embed.data.description + `\n\n**Apercu**\n${preview.substring(0, 1024)}`);
      }

      await sendLog(client, channel.guild.id, "messageDeleteBulk", embed);
    } catch {}
  },
};
