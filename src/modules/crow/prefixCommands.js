const fs = require("fs");
const path = require("path");
const { PermissionsBitField, ChannelType } = require("discord.js");
const { v2Message } = require("../../utils/v2Message");
const { buildHelpMessage } = require("./helpMenu");

const DATA_DIR = path.join(__dirname, "..", "..", "..", "data");
const CONFIG_PATH = path.join(DATA_DIR, "guildConfig.json");
const WARN_PATH = path.join(DATA_DIR, "warnings.json");

const COMMAND_ALIASES = {
  purge: "clear", clean: "clear", prune: "clear",
  lockdown: "lock", unlockdown: "unlock",
  mute: "timeout", unmute: "untimeout", tempmute: "timeout",
  panel: "crowpanel", latency: "ping",
  infoserveur: "serverinfo", infouser: "userinfo",
  banid: "unban", h: "help", cmds: "commands",
  si: "serverinfo", ui: "userinfo", av: "avatar",
  rmrole: "removerole", gp: "ghostping",
  steal: "emoji", addemoji: "emoji", emojiadd: "emoji",
};

const ALL_COMMANDS = [
  "help","commands","ping","crowpanel","serverinfo","userinfo","avatar",
  "stats","botinfo","ghostping","clear","lock","unlock","slowmode",
  "timeout","untimeout","kick","ban","unban","announce","nuke",
  "addrole","removerole","nick","resetnick","hide","unhide","topic",
  "rename","clone","warn","warnings","clearwarns","delwarn",
  "setlogs","setwelcome","setgoodbye","setautorole","setmodrole",
  "setadminrole","setmuterole","setup","emoji",
  ...Object.keys(COMMAND_ALIASES),
];

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CONFIG_PATH)) fs.writeFileSync(CONFIG_PATH, "{}");
  if (!fs.existsSync(WARN_PATH)) fs.writeFileSync(WARN_PATH, "{}");
}

function readJson(filePath) {
  ensureDataFiles();
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); }
  catch { return {}; }
}

function writeJson(filePath, data) {
  ensureDataFiles();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function makeError(message) { return v2Message({ title: "Erreur", lines: [message] }); }
function ok(title, lines) { return v2Message({ title, lines }); }
function resolveCommand(commandName) { return COMMAND_ALIASES[commandName] || commandName; }

function hasPerm(message, permission, label) {
  if (message.member.permissions.has(permission)) return true;
  message.reply(makeError(`Permission requise: \`${label}\`.`)).catch(() => null);
  return false;
}

function getMentionedMember(message) { return message.mentions.members.first() || null; }
function getReason(args, fallback = "Aucune raison fournie.") { return args.length > 0 ? args.join(" ") : fallback; }

function setGuildConfig(guildId, key, value) {
  const cfg = readJson(CONFIG_PATH);
  cfg[guildId] = cfg[guildId] || {};
  cfg[guildId][key] = value;
  writeJson(CONFIG_PATH, cfg);
}

function getGuildConfig(guildId) {
  const cfg = readJson(CONFIG_PATH);
  return cfg[guildId] || {};
}

function addWarn(guildId, userId, modId, reason) {
  const data = readJson(WARN_PATH);
  data[guildId] = data[guildId] || {};
  data[guildId][userId] = data[guildId][userId] || [];
  data[guildId][userId].push({ id: Date.now(), reason, moderatorId: modId, createdAt: new Date().toISOString() });
  writeJson(WARN_PATH, data);
  return data[guildId][userId];
}

function getWarns(guildId, userId) {
  const data = readJson(WARN_PATH);
  return (data[guildId] && data[guildId][userId]) || [];
}

function clearWarns(guildId, userId) {
  const data = readJson(WARN_PATH);
  if (!data[guildId] || !data[guildId][userId]) return 0;
  const count = data[guildId][userId].length;
  delete data[guildId][userId];
  writeJson(WARN_PATH, data);
  return count;
}

function delWarn(guildId, userId, index) {
  const data = readJson(WARN_PATH);
  const list = (data[guildId] && data[guildId][userId]) || [];
  if (index < 0 || index >= list.length) return null;
  const removed = list.splice(index, 1)[0];
  if (list.length === 0) delete data[guildId][userId];
  writeJson(WARN_PATH, data);
  return removed;
}

async function handlePrefixCommand(message, rawName, args, panelCommand) {
  const name = resolveCommand(rawName);

  if (name === "help") { await message.reply(buildHelpMessage("general")); return true; }
  if (name === "commands") {
    const unique = [...new Set(ALL_COMMANDS)];
    await message.reply(ok("Liste Des Commandes", [`Total: **${unique.length}**`, unique.map((c) => `\`+${c}\``).join(" ")]));
    return true;
  }
  if (name === "ping") { await message.reply(ok("Latence", [`Pong: \`${message.client.ws.ping}ms\``])); return true; }
  if (name === "crowpanel") { await message.reply(panelCommand.buildPanelMessage()); return true; }

  if (name === "serverinfo") {
    const guild = message.guild;
    await message.reply(ok("Informations Serveur", [`Nom: **${guild.name}**`,`Membres: **${guild.memberCount}**`,`Salons: **${guild.channels.cache.size}**`,`Roles: **${guild.roles.cache.size}**`]));
    return true;
  }
  if (name === "userinfo") {
    const target = getMentionedMember(message) || message.member;
    await message.reply(ok("Informations Membre", [`Utilisateur: **${target.user.tag}**`,`ID: \`${target.id}\``]));
    return true;
  }
  if (name === "avatar") {
    const target = getMentionedMember(message) || message.member;
    await message.reply(ok("Avatar", [target.displayAvatarURL({ size: 1024 })]));
    return true;
  }
  if (name === "stats") {
    await message.reply(ok("Statistiques", [`Membres: **${message.guild.memberCount}**`,`Salons: **${message.guild.channels.cache.size}**`,`Roles: **${message.guild.roles.cache.size}**`]));
    return true;
  }
  if (name === "botinfo") {
    await message.reply(ok("Bot Info", [`Bot: **${message.client.user.tag}**`,`Ping: **${message.client.ws.ping}ms**`,`Serveurs: **${message.client.guilds.cache.size}**`]));
    return true;
  }

  if (name === "ghostping") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageMessages, "ManageMessages")) return true;
    const target = getMentionedMember(message);
    if (!target) { await message.reply(makeError("Utilisation: `+ghostping @membre [#salon] [message]`")); return true; }
    const targetChannel = message.mentions.channels.first() || message.channel;
    if (!targetChannel.isTextBased()) { await message.reply(makeError("Le salon cible doit etre un salon texte.")); return true; }
    const extra = args.filter((arg) => !arg.startsWith("<@") && !arg.startsWith("<#")).join(" ").trim();
    const ghostContent = extra ? `${target} ${extra}` : `${target}`;
    await message.delete().catch(() => null);
    const ghost = await targetChannel.send({ content: ghostContent }).catch(() => null);
    if (ghost) { setTimeout(() => { ghost.delete().catch(() => null); }, 1500); }
    return true;
  }

  if (name === "clear") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageMessages, "ManageMessages")) return true;
    const amount = Number(args[0]);
    if (!Number.isInteger(amount) || amount < 1 || amount > 100) { await message.reply(makeError("Utilisation: `+clear <1-100>`")); return true; }
    const deleted = await message.channel.bulkDelete(amount, true);
    await message.reply(ok("Nettoyage", [`${deleted.size} messages supprimes.`]));
    return true;
  }

  if (name === "lock" || name === "unlock") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageChannels, "ManageChannels")) return true;
    const channel = message.mentions.channels.first() || message.channel;
    await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: name === "lock" ? false : null });
    await message.reply(ok(name === "lock" ? "Salon Verrouille" : "Salon Deverrouille", [`${channel}`]));
    return true;
  }

  if (name === "slowmode") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageChannels, "ManageChannels")) return true;
    const seconds = Number(args[0]);
    if (!Number.isInteger(seconds) || seconds < 0 || seconds > 21600) { await message.reply(makeError("Utilisation: `+slowmode <0-21600>`")); return true; }
    await message.channel.setRateLimitPerUser(seconds);
    await message.reply(ok("Slowmode", [`Nouveau delai: **${seconds}s**`]));
    return true;
  }

  if (name === "timeout" || name === "untimeout") {
    if (!hasPerm(message, PermissionsBitField.Flags.ModerateMembers, "ModerateMembers")) return true;
    const target = getMentionedMember(message);
    if (!target) { await message.reply(makeError(name === "timeout" ? "Utilisation: `+timeout @membre <minutes> [raison]`" : "Utilisation: `+untimeout @membre [raison]`")); return true; }
    if (name === "timeout") {
      const minutes = Number(args[1]);
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 40320) { await message.reply(makeError("Minutes invalides. Limite: `1` a `40320`.")); return true; }
      const reason = getReason(args.slice(2));
      await target.timeout(minutes * 60 * 1000, reason);
      await message.reply(ok("Timeout Applique", [`Membre: ${target}`, `Duree: ${minutes} minute(s)`, `Raison: ${reason}`]));
      return true;
    }
    const reason = getReason(args.slice(1));
    await target.timeout(null, reason);
    await message.reply(ok("Timeout Retire", [`Membre: ${target}`, `Raison: ${reason}`]));
    return true;
  }

  if (name === "kick" || name === "ban") {
    const perm = name === "kick" ? PermissionsBitField.Flags.KickMembers : PermissionsBitField.Flags.BanMembers;
    const permLabel = name === "kick" ? "KickMembers" : "BanMembers";
    if (!hasPerm(message, perm, permLabel)) return true;
    const target = getMentionedMember(message);
    if (!target) { await message.reply(makeError(`Utilisation: \`+${name} @membre [raison]\``)); return true; }
    const reason = getReason(args.slice(1));
    if (name === "kick") await target.kick(reason);
    if (name === "ban") await target.ban({ reason });
    await message.reply(ok(name === "kick" ? "Membre Expulse" : "Membre Banni", [`Membre: **${target.user.tag}**`, `Raison: ${reason}`]));
    return true;
  }

  if (name === "unban") {
    if (!hasPerm(message, PermissionsBitField.Flags.BanMembers, "BanMembers")) return true;
    const userId = args[0];
    if (!userId) { await message.reply(makeError("Utilisation: `+unban <userId> [raison]`")); return true; }
    const reason = getReason(args.slice(1));
    await message.guild.members.unban(userId, reason);
    await message.reply(ok("Membre Debanni", [`User ID: \`${userId}\``, `Raison: ${reason}`]));
    return true;
  }

  if (name === "announce") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageGuild, "ManageGuild")) return true;
    const text = args.join(" ").trim();
    if (!text) { await message.reply(makeError("Utilisation: `+announce <texte>`")); return true; }
    await message.channel.send(ok("Annonce", [text]));
    return true;
  }

  if (name === "nuke") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageChannels, "ManageChannels")) return true;
    if (message.channel.type !== ChannelType.GuildText && message.channel.type !== ChannelType.GuildAnnouncement) {
      await message.reply(makeError("Commande disponible uniquement en salon texte."));
      return true;
    }
    const sourceChannel = message.channel;
    const cloned = await sourceChannel.clone().catch(() => null);
    if (!cloned) { await message.reply(makeError("Impossible de cloner le salon pour executer le nuke.")); return true; }
    await sourceChannel.delete("Nuke command").catch(() => null);
    await cloned.send(ok("Salon Reinitialise", ["L'historique precedent a ete supprime."]));
    return true;
  }

  if (name === "addrole" || name === "removerole") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageRoles, "ManageRoles")) return true;
    const member = getMentionedMember(message);
    const role = message.mentions.roles.first();
    if (!member || !role) { await message.reply(makeError(`Utilisation: \`+${name} @membre @role\``)); return true; }
    if (name === "addrole") await member.roles.add(role);
    else await member.roles.remove(role);
    await message.reply(ok("Role Mis A Jour", [`Membre: ${member}`, `Role: ${role}`]));
    return true;
  }

  if (name === "nick" || name === "resetnick") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageNicknames, "ManageNicknames")) return true;
    const member = getMentionedMember(message);
    if (!member) { await message.reply(makeError(`Utilisation: \`+${name} @membre ${name === "nick" ? "<nouveauPseudo>" : ""}\``)); return true; }
    if (name === "nick") {
      const newNick = args.slice(1).join(" ").trim();
      if (!newNick) { await message.reply(makeError("Utilisation: `+nick @membre <nouveauPseudo>`")); return true; }
      await member.setNickname(newNick);
    } else { await member.setNickname(null); }
    await message.reply(ok("Pseudo Mis A Jour", [`Membre: ${member}`]));
    return true;
  }

  if (name === "hide" || name === "unhide") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageChannels, "ManageChannels")) return true;
    const channel = message.mentions.channels.first() || message.channel;
    await channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: name === "hide" ? false : null });
    await message.reply(ok(name === "hide" ? "Salon Masque" : "Salon Visible", [`${channel}`]));
    return true;
  }

  if (name === "topic") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageChannels, "ManageChannels")) return true;
    const topic = args.join(" ").trim();
    if (!topic) { await message.reply(makeError("Utilisation: `+topic <texte>`")); return true; }
    await message.channel.setTopic(topic);
    await message.reply(ok("Topic Mis A Jour", [topic]));
    return true;
  }

  if (name === "rename") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageChannels, "ManageChannels")) return true;
    const channel = message.mentions.channels.first() || message.channel;
    const newName = args.filter((a) => !a.includes("<#")).join(" ").trim();
    if (!newName) { await message.reply(makeError("Utilisation: `+rename [#salon] <nom>`")); return true; }
    await channel.setName(newName);
    await message.reply(ok("Salon Renomme", [`Nouveau nom: **${newName}**`]));
    return true;
  }

  if (name === "clone") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageChannels, "ManageChannels")) return true;
    const channel = message.mentions.channels.first() || message.channel;
    const cloned = await channel.clone();
    await message.reply(ok("Salon Clone", [`Ancien: ${channel}`, `Nouveau: ${cloned}`]));
    return true;
  }

  if (name === "warn" || name === "warnings" || name === "clearwarns" || name === "delwarn") {
    if (!hasPerm(message, PermissionsBitField.Flags.ModerateMembers, "ModerateMembers")) return true;
    const member = getMentionedMember(message);
    if (!member) { await message.reply(makeError("Utilisation: `+warn/+warnings/+clearwarns/+delwarn @membre ...`")); return true; }
    if (name === "warn") {
      const reason = getReason(args.slice(1));
      const list = addWarn(message.guild.id, member.id, message.author.id, reason);
      await message.reply(ok("Avertissement Ajoute", [`Membre: ${member}`, `Total warns: **${list.length}**`, `Raison: ${reason}`]));
      return true;
    }
    if (name === "warnings") {
      const list = getWarns(message.guild.id, member.id);
      if (list.length === 0) { await message.reply(ok("Warnings", [`Aucun avertissement pour ${member}.`])); return true; }
      const lines = list.slice(0, 20).map((w, i) => `${i + 1}. ${w.reason} (mod: <@${w.moderatorId}>)`);
      await message.reply(ok("Warnings", [`Membre: ${member}`, ...lines]));
      return true;
    }
    if (name === "clearwarns") {
      const count = clearWarns(message.guild.id, member.id);
      await message.reply(ok("Warnings Effaces", [`Membre: ${member}`, `Supprimes: **${count}**`]));
      return true;
    }
    const index = Number(args[1]) - 1;
    if (!Number.isInteger(index) || index < 0) { await message.reply(makeError("Utilisation: `+delwarn @membre <index>`")); return true; }
    const removed = delWarn(message.guild.id, member.id, index);
    if (!removed) { await message.reply(makeError("Index d'avertissement invalide.")); return true; }
    await message.reply(ok("Warning Supprime", [`Membre: ${member}`, `Raison: ${removed.reason}`]));
    return true;
  }

  // ─── EMOJI STEAL ───
  if (name === "emoji") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageGuildExpressions, "ManageGuildExpressions")) return true;

    // Regex pour détecter un emoji custom Discord <:name:id> ou <a:name:id>
    const emojiRegex = /<(a?):([a-zA-Z0-9_]+):(\d+)>/;
    let emojis = [];

    // Chercher les emojis dans le message
    const msgContent = args.join(" ");
    const matches = msgContent.matchAll(/<(a?):([a-zA-Z0-9_]+):(\d+)>/g);
    for (const m of matches) {
      emojis.push({ animated: m[1] === "a", name: m[2], id: m[3] });
    }

    // Si reply, chercher les emojis dans le message référencé
    if (emojis.length === 0 && message.reference) {
      try {
        const ref = await message.channel.messages.fetch(message.reference.messageId);
        const refMatches = ref.content.matchAll(/<(a?):([a-zA-Z0-9_]+):(\d+)>/g);
        for (const m of refMatches) {
          emojis.push({ animated: m[1] === "a", name: m[2], id: m[3] });
        }
      } catch {}
    }

    if (emojis.length === 0) {
      await message.reply(makeError("Utilisation: `+emoji <emoji>` ou répondez à un message contenant un emoji.\nExemple: `+emoji :monEmoji:`"));
      return true;
    }

    const results = [];
    for (const emoji of emojis) {
      const ext = emoji.animated ? "gif" : "png";
      const url = `https://cdn.discordapp.com/emojis/${emoji.id}.${ext}?size=128&quality=lossless`;
      try {
        const created = await message.guild.emojis.create({ attachment: url, name: emoji.name });
        results.push(`${created} **${emoji.name}** ajouté`);
      } catch (e) {
        const errMsg = e.code === 30008 ? "Limite d'emojis atteinte" : e.message || "Erreur inconnue";
        results.push(`**${emoji.name}** — ${errMsg}`);
      }
    }

    await message.reply(ok("Emoji", results));
    return true;
  }

  if (name.startsWith("set") || name === "setup") {
    if (!hasPerm(message, PermissionsBitField.Flags.ManageGuild, "ManageGuild")) return true;
    const keyMap = {
      setlogs: "logsChannelId", setwelcome: "welcomeChannelId", setgoodbye: "goodbyeChannelId",
      setautorole: "autoRoleId", setmodrole: "modRoleId", setadminrole: "adminRoleId", setmuterole: "muteRoleId",
    };
    if (name === "setup") {
      const cfg = getGuildConfig(message.guild.id);
      const lines = Object.keys(cfg).length ? Object.entries(cfg).map(([k, v]) => `${k}: \`${v}\``) : ["Aucune configuration enregistree."];
      await message.reply(ok("Configuration Serveur", lines));
      return true;
    }
    const key = keyMap[name];
    if (!key) return false;
    const channel = message.mentions.channels.first();
    const role = message.mentions.roles.first();
    const value = channel ? channel.id : role ? role.id : args[0];
    if (!value) { await message.reply(makeError(`Utilisation: \`+${name} #salon\` ou \`+${name} @role\``)); return true; }
    setGuildConfig(message.guild.id, key, value);
    await message.reply(ok("Configuration Mise A Jour", [`${key}: \`${value}\``]));
    return true;
  }

  return false;
}

module.exports = { handlePrefixCommand };
