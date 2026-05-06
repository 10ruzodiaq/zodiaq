const { EmbedBuilder } = require("discord.js");
const { sendLog } = require("../../../utils/logger");

module.exports = {
  name: "guildUpdate",
  async execute(oldGuild, newGuild, client) {
    try {
      const changes = [];
      if (oldGuild.name !== newGuild.name) changes.push(`- Nom : **${oldGuild.name}** -> **${newGuild.name}**`);
      if (oldGuild.icon !== newGuild.icon) changes.push(`- Icone : **Modifiee**`);
      if (oldGuild.banner !== newGuild.banner) changes.push(`- Banniere : **Modifiee**`);
      if (oldGuild.splash !== newGuild.splash) changes.push(`- Splash : **Modifie**`);
      if (oldGuild.discoverySplash !== newGuild.discoverySplash) changes.push(`- Discovery splash : **Modifie**`);
      if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
        const levels = { 0: "Aucun", 1: "Faible", 2: "Moyen", 3: "Eleve", 4: "Tres eleve" };
        changes.push(`- Verification : **${levels[oldGuild.verificationLevel]}** -> **${levels[newGuild.verificationLevel]}**`);
      }
      if (oldGuild.explicitContentFilter !== newGuild.explicitContentFilter) {
        const filters = { 0: "Desactive", 1: "Sans role", 2: "Tous" };
        changes.push(`- Filtre contenu : **${filters[oldGuild.explicitContentFilter]}** -> **${filters[newGuild.explicitContentFilter]}**`);
      }
      if (oldGuild.defaultMessageNotifications !== newGuild.defaultMessageNotifications) {
        const notifs = { 0: "Tous les messages", 1: "Mentions uniquement" };
        changes.push(`- Notifications : **${notifs[oldGuild.defaultMessageNotifications]}** -> **${notifs[newGuild.defaultMessageNotifications]}**`);
      }
      if (oldGuild.afkChannelId !== newGuild.afkChannelId) changes.push(`- Salon AFK : ${oldGuild.afkChannelId ? `<#${oldGuild.afkChannelId}>` : "**Aucun**"} -> ${newGuild.afkChannelId ? `<#${newGuild.afkChannelId}>` : "**Aucun**"}`);
      if (oldGuild.afkTimeout !== newGuild.afkTimeout) changes.push(`- Timeout AFK : **${oldGuild.afkTimeout / 60}min** -> **${newGuild.afkTimeout / 60}min**`);
      if (oldGuild.systemChannelId !== newGuild.systemChannelId) changes.push(`- Salon systeme : ${oldGuild.systemChannelId ? `<#${oldGuild.systemChannelId}>` : "**Aucun**"} -> ${newGuild.systemChannelId ? `<#${newGuild.systemChannelId}>` : "**Aucun**"}`);
      if (oldGuild.rulesChannelId !== newGuild.rulesChannelId) changes.push(`- Salon regles : ${oldGuild.rulesChannelId ? `<#${oldGuild.rulesChannelId}>` : "**Aucun**"} -> ${newGuild.rulesChannelId ? `<#${newGuild.rulesChannelId}>` : "**Aucun**"}`);
      if (oldGuild.ownerId !== newGuild.ownerId) changes.push(`- Proprietaire : <@${oldGuild.ownerId}> -> <@${newGuild.ownerId}>`);
      if (oldGuild.description !== newGuild.description) changes.push(`- Description modifiee`);
      if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) changes.push(`- URL vanity : **${oldGuild.vanityURLCode || "Aucune"}** -> **${newGuild.vanityURLCode || "Aucune"}**`);
      if (oldGuild.premiumTier !== newGuild.premiumTier) changes.push(`- Niveau boost : **${oldGuild.premiumTier}** -> **${newGuild.premiumTier}**`);
      if (oldGuild.preferredLocale !== newGuild.preferredLocale) changes.push(`- Langue : **${oldGuild.preferredLocale}** -> **${newGuild.preferredLocale}**`);
      if (oldGuild.nsfwLevel !== newGuild.nsfwLevel) changes.push(`- Niveau NSFW : **${oldGuild.nsfwLevel}** -> **${newGuild.nsfwLevel}**`);
      if (oldGuild.mfaLevel !== newGuild.mfaLevel) changes.push(`- MFA moderation : **${newGuild.mfaLevel ? "Requis" : "Non requis"}**`);

      if (changes.length === 0) return;

      const embed = new EmbedBuilder().setColor("#2B2D31")
        .setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL({ dynamic: true }) })
        .setDescription(`**Le serveur a ete modifie.**\n\n${changes.join("\n")}`)
        .setFooter({ text: "Information serveur" }).setTimestamp();

      if (newGuild.icon !== oldGuild.icon && newGuild.iconURL()) {
        embed.setThumbnail(newGuild.iconURL({ dynamic: true, size: 256 }));
      }

      await sendLog(client, newGuild.id, "guildUpdate", embed);
    } catch {}
  },
};
