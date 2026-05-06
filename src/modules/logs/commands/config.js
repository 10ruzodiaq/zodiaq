const { PermissionFlagsBits } = require("discord.js");
const { getGuildConfig, updateGuildConfig } = require("../../../utils/database");
const { v2Message } = require("../../../utils/v2Message");
const config = require("../../../config");

// Génère le nom de salon avec l'emoji configuré
function channelName(event, name) {
  const emoji = config.logEmojis?.[event] || '';
  return emoji ? `${emoji}・log-${name}` : `log-${name}`;
}

// Mapping: clé DB → nom affiché + nom de salon Discord
const LOG_EVENTS = {
  channelCreate:        { display: "Channel Create",        channelSuffix: "channel-create" },
  channelDelete:        { display: "Channel Delete",        channelSuffix: "channel-delete" },
  channelUpdate:        { display: "Channel Update",        channelSuffix: "channel-update" },
  emojiCreate:          { display: "Emoji Create",          channelSuffix: "emoji-create" },
  emojiDelete:          { display: "Emoji Delete",          channelSuffix: "emoji-delete" },
  emojiUpdate:          { display: "Emoji Update",          channelSuffix: "emoji-update" },
  guildBanAdd:          { display: "Ban Add",               channelSuffix: "ban-add" },
  guildBanRemove:       { display: "Ban Remove",            channelSuffix: "ban-remove" },
  guildMemberAdd:       { display: "Member Join",           channelSuffix: "join" },
  guildMemberRemove:    { display: "Member Leave",          channelSuffix: "leave" },
  guildMemberUpdate:    { display: "Member Update",         channelSuffix: "member-update" },
  guildUpdate:          { display: "Server Update",         channelSuffix: "server-update" },
  inviteCreate:         { display: "Invite Create",         channelSuffix: "invite-create" },
  inviteDelete:         { display: "Invite Delete",         channelSuffix: "invite-delete" },
  messageCreate:        { display: "Message Create",        channelSuffix: "message-create" },
  messageDelete:        { display: "Message Delete",        channelSuffix: "message-delete" },
  messageDeleteBulk:    { display: "Message Bulk Delete",   channelSuffix: "message-bulk" },
  messageReactionAdd:   { display: "Reaction Add",          channelSuffix: "reaction-add" },
  messageReactionRemove:{ display: "Reaction Remove",       channelSuffix: "reaction-remove" },
  messageUpdate:        { display: "Message Edit",          channelSuffix: "message-edit" },
  roleCreate:           { display: "Role Create",           channelSuffix: "role-create" },
  roleDelete:           { display: "Role Delete",           channelSuffix: "role-delete" },
  roleUpdate:           { display: "Role Update",           channelSuffix: "role-update" },
  stickerCreate:        { display: "Sticker Create",        channelSuffix: "sticker-create" },
  stickerDelete:        { display: "Sticker Delete",        channelSuffix: "sticker-delete" },
  threadCreate:         { display: "Thread Create",         channelSuffix: "thread-create" },
  threadDelete:         { display: "Thread Delete",         channelSuffix: "thread-delete" },
  threadUpdate:         { display: "Thread Update",         channelSuffix: "thread-update" },
  voiceStateUpdate:     { display: "Voice Update",          channelSuffix: "voice" },
  webhookUpdate:        { display: "Webhook Update",        channelSuffix: "webhook" },
};

module.exports = {
  name: "config",
  aliases: ["setup", "cfg"],
  permissions: [PermissionFlagsBits.Administrator],
  async execute(message, args, client) {
    const prefix = config.prefixes.logs;
    const guildConfig = getGuildConfig(message.guild.id);

    if (!args[0]) {
      // Afficher la config groupée par sections pour la lisibilité
      const groups = {
        "Salons": ["channelCreate", "channelDelete", "channelUpdate"],
        "Emojis / Stickers": ["emojiCreate", "emojiDelete", "emojiUpdate", "stickerCreate", "stickerDelete"],
        "Modération": ["guildBanAdd", "guildBanRemove"],
        "Membres": ["guildMemberAdd", "guildMemberRemove", "guildMemberUpdate"],
        "Serveur": ["guildUpdate", "webhookUpdate"],
        "Invitations": ["inviteCreate", "inviteDelete"],
        "Messages": ["messageCreate", "messageDelete", "messageDeleteBulk", "messageUpdate"],
        "Réactions": ["messageReactionAdd", "messageReactionRemove"],
        "Rôles": ["roleCreate", "roleDelete", "roleUpdate"],
        "Threads": ["threadCreate", "threadDelete", "threadUpdate"],
        "Vocal": ["voiceStateUpdate"],
      };

      const sections = Object.entries(groups).map(([groupName, keys]) => {
        const lines = keys.map(key => {
          const { display } = LOG_EVENTS[key];
          const channelId = guildConfig.logs[key];
          return `**${display}** → ${channelId ? `<#${channelId}>` : "*Non configuré*"}`;
        }).join("\n");
        return { heading: groupName, body: lines };
      });

      sections.unshift({
        heading: "Status",
        body: `${guildConfig.enabled ? "Activé" : "Désactivé"}\nPrefix : \`${prefix}\``,
      });

      sections.push({
        heading: "Utilisation",
        body: `\`${prefix}config setup\` → créer & configurer tous les salons\n\`${prefix}config set <event> <#salon>\`\n\`${prefix}config setall <#salon>\`\n\`${prefix}config remove <event>\`\n\`${prefix}config reset\`\n\`${prefix}config list\` → voir les noms d'events`,
      });

      return message.reply(v2Message({
        title: "Configuration des Logs",
        sections,
        lines: [`-# Demandé par ${message.author}`],
      }));
    }

    const subcommand = args[0].toLowerCase();

    // ─── SETUP : créer tous les salons ───
    if (subcommand === "setup") {
      const statusMsg = await message.reply(v2Message({ title: "Configuration", lines: ["Création des 30 salons en cours..."] }));
      try {
        let category = message.guild.channels.cache.find(c => c.name === "LOGS" && c.type === 4);
        if (!category) {
          category = await message.guild.channels.create({ name: "LOGS", type: 4, permissionOverwrites: [
            { id: message.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks] }
          ]});
        }

        let created = 0;
        for (const [key, { channelSuffix }] of Object.entries(LOG_EVENTS)) {
          const channel = await message.guild.channels.create({
            name: channelName(key, channelSuffix),
            type: 0,
            parent: category.id,
            permissionOverwrites: [
              { id: message.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
              { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks] }
            ]
          });
          updateGuildConfig(message.guild.id, `logs.${key}`, channel.id);
          created++;
        }

        await statusMsg.edit(v2Message({ title: "Succès", lines: [`Catégorie **LOGS** créée avec **${created}** salons.`] }));
      } catch (error) {
        console.error(error);
        await statusMsg.edit(v2Message({ title: "Erreur", lines: ["Vérifiez mes permissions."] }));
      }
      return;
    }

    // ─── LIST : afficher tous les noms d'events disponibles ───
    if (subcommand === "list") {
      const eventList = Object.entries(LOG_EVENTS).map(([key, { display }]) => `\`${key}\` → ${display}`).join("\n");
      return message.reply(v2Message({
        title: "Events disponibles",
        sections: [{ heading: "Noms d'events", body: eventList }],
        lines: [`-# Utilisez ces noms avec \`${prefix}config set <event> <#salon>\``],
      }));
    }

    // ─── SET : configurer un event spécifique ───
    if (subcommand === "set") {
      const eventKey = args[1];
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);
      if (!eventKey || !LOG_EVENTS[eventKey]) {
        return message.reply(v2Message({ title: "Erreur", lines: [`Event invalide. Utilisez \`${prefix}config list\` pour voir les events.`] }));
      }
      if (!channel) return message.reply(v2Message({ title: "Erreur", lines: ["Mentionnez un salon valide."] }));
      updateGuildConfig(message.guild.id, `logs.${eventKey}`, channel.id);
      const { display } = LOG_EVENTS[eventKey];
      return message.reply(v2Message({ title: "Configuré", lines: [`Logs **${display}** configurés sur <#${channel.id}>.`] }));
    }

    // ─── SETALL : tout mettre sur un seul salon ───
    if (subcommand === "setall") {
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
      if (!channel) return message.reply(v2Message({ title: "Erreur", lines: ["Mentionnez un salon."] }));
      for (const key of Object.keys(LOG_EVENTS)) updateGuildConfig(message.guild.id, `logs.${key}`, channel.id);
      return message.reply(v2Message({ title: "Configuré", lines: [`Tous les events configurés sur <#${channel.id}>.`] }));
    }

    // ─── REMOVE : supprimer un event ───
    if (subcommand === "remove" || subcommand === "delete") {
      const eventKey = args[1];
      if (!eventKey || !LOG_EVENTS[eventKey]) {
        return message.reply(v2Message({ title: "Erreur", lines: [`Event invalide. Utilisez \`${prefix}config list\`.`] }));
      }
      updateGuildConfig(message.guild.id, `logs.${eventKey}`, "");
      const { display } = LOG_EVENTS[eventKey];
      return message.reply(v2Message({ title: "Supprimé", lines: [`Logs **${display}** désactivés.`] }));
    }

    // ─── RESET : tout réinitialiser ───
    if (subcommand === "reset") {
      for (const key of Object.keys(LOG_EVENTS)) updateGuildConfig(message.guild.id, `logs.${key}`, "");
      return message.reply(v2Message({ title: "Réinitialisé", lines: ["Configuration réinitialisée."] }));
    }

    return message.reply(v2Message({ title: "Erreur", lines: [`Sous-commande inconnue. Utilisez \`${prefix}config\`.`] }));
  },
};
