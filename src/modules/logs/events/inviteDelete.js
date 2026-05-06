const { EmbedBuilder } = require("discord.js");
const { sendLog } = require("../../../utils/logger");

module.exports = {
  name: "inviteDelete",
  async execute(invite, client) {
    try {
      if (!invite.guild) return;

      let desc = `**L'invitation \`${invite.code}\` a ete supprimee.**\n`;
      desc += `- Salon : ${invite.channel ? `<#${invite.channel.id}>` : "**Inconnu**"}\n`;
      desc += `- Utilisations : **${invite.uses ?? "Inconnu"}**`;

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: invite.guild.name, iconURL: invite.guild.iconURL({ dynamic: true }) })
        .setDescription(desc)
        .setFooter({ text: "Invitation supprimee" }).setTimestamp();
      await sendLog(client, invite.guild.id, "inviteDelete", embed);
    } catch {}
  },
};
