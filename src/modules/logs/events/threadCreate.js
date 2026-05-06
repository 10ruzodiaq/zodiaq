const { EmbedBuilder } = require("discord.js");
const { sendLog } = require("../../../utils/logger");

module.exports = {
  name: "threadCreate",
  async execute(thread, newlyCreated, client) {
    try {
      if (!thread.guild || !newlyCreated) return;

      let desc = `**Thread cree : <#${thread.id}>**\n`;
      desc += `- Nom : **${thread.name}**\n`;
      desc += `- Salon parent : <#${thread.parentId}>\n`;
      desc += `- Auto-archive : **${thread.autoArchiveDuration}min**`;

      if (thread.ownerId) {
        desc += `\n- Createur : <@${thread.ownerId}>`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: thread.guild.name, iconURL: thread.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: `Thread cree • ID: ${thread.id}` }).setTimestamp();
      await sendLog(client, thread.guild.id, "threadCreate", embed);
    } catch {}
  },
};
