const { EmbedBuilder } = require("discord.js");
const { sendLog } = require("../../../utils/logger");

module.exports = {
  name: "inviteCreate",
  async execute(invite, client) {
    try {
      if (!invite.guild) return;

      let desc = `**Invitation creee.**\n\n`;
      desc += `- Code : **${invite.code}** ([Lien](${invite.url}))\n`;
      desc += `- Salon : ${invite.channel ? `<#${invite.channel.id}>` : "**Inconnu**"}\n`;
      desc += `- Duree : **${invite.maxAge === 0 ? "Illimitee" : `${invite.maxAge / 3600}h`}**\n`;
      desc += `- Utilisations max : **${invite.maxUses === 0 ? "Illimitees" : invite.maxUses}**\n`;
      desc += `- Temporaire : **${invite.temporary ? "Oui" : "Non"}**`;

      if (invite.inviter) {
        desc += `\n- Creee par : <@${invite.inviter.id}>`;
      }

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: invite.inviter ? invite.inviter.tag : "Inconnu", iconURL: invite.inviter?.displayAvatarURL() })
        .setDescription(desc)
        .setFooter({ text: "Invitation creee" }).setTimestamp();
      await sendLog(client, invite.guild.id, "inviteCreate", embed);
    } catch {}
  },
};
