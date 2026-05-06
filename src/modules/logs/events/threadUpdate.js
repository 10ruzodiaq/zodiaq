const { EmbedBuilder } = require("discord.js");
const { sendLog } = require("../../../utils/logger");

module.exports = {
  name: "threadUpdate",
  async execute(oldThread, newThread, client) {
    try {
      if (!newThread.guild) return;

      const changes = [];
      if (oldThread.name !== newThread.name) changes.push(`- Nom : **${oldThread.name}** -> **${newThread.name}**`);
      if (oldThread.archived !== newThread.archived) changes.push(`- Archive : **${newThread.archived ? "Oui" : "Non"}**`);
      if (oldThread.locked !== newThread.locked) changes.push(`- Verrouille : **${newThread.locked ? "Oui" : "Non"}**`);
      if (oldThread.rateLimitPerUser !== newThread.rateLimitPerUser) changes.push(`- Slowmode : **${oldThread.rateLimitPerUser}s** -> **${newThread.rateLimitPerUser}s**`);
      if (oldThread.autoArchiveDuration !== newThread.autoArchiveDuration) changes.push(`- Auto-archive : **${oldThread.autoArchiveDuration}min** -> **${newThread.autoArchiveDuration}min**`);

      if (changes.length === 0) return;

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: newThread.guild.name, iconURL: newThread.guild.iconURL({ dynamic: true }) })
        .setDescription(`**Thread modifie : <#${newThread.id}>**\n\n${changes.join("\n")}`)
        .setFooter({ text: `Thread modifie • ID: ${newThread.id}` }).setTimestamp();
      await sendLog(client, newThread.guild.id, "threadUpdate", embed);
    } catch {}
  },
};
