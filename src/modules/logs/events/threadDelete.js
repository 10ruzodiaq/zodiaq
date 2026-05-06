const { EmbedBuilder } = require("discord.js");
const { sendLog } = require("../../../utils/logger");

module.exports = {
  name: "threadDelete",
  async execute(thread, client) {
    try {
      if (!thread.guild) return;

      let desc = `**Thread supprime : \`${thread.name}\`**\n`;
      desc += `- Salon parent : <#${thread.parentId}>\n`;
      desc += `- ID : \`${thread.id}\`\n`;
      desc += `- Messages : **${thread.messageCount ?? "Inconnu"}**\n`;
      desc += `- Membres : **${thread.memberCount ?? "Inconnu"}**`;

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: thread.guild.name, iconURL: thread.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: "Thread supprime" }).setTimestamp();
      await sendLog(client, thread.guild.id, "threadDelete", embed);
    } catch {}
  },
};
