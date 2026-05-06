const { EmbedBuilder } = require("discord.js");
const { sendLog, shouldIgnore } = require("../../../utils/logger");

module.exports = {
  name: "messageReactionRemove",
  async execute(reaction, user, client) {
    try {
      if (reaction.partial) { try { await reaction.fetch(); } catch { return; } }
      if (!reaction.message.guild) return;
      if (shouldIgnore(reaction.message.guild.id, user.id, reaction.message.channel?.id, user.bot)) return;

      const emoji = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;
      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`**Reaction retiree** ${emoji}\n- Salon : <#${reaction.message.channel.id}>\n- [Aller au message](${reaction.message.url})`)
        .setFooter({ text: `Reaction retiree • #${reaction.message.channel?.name || "inconnu"}` }).setTimestamp();
      await sendLog(client, reaction.message.guild.id, "messageReactionRemove", embed);
    } catch {}
  },
};
