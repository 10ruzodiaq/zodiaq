const fs = require("fs");
const path = require("path");
const { PermissionsBitField } = require("discord.js");
const { v2Message } = require("../../utils/v2Message");

const DATA_DIR = path.join(__dirname, "..", "..", "..", "data");
const CONFIG_PATH = path.join(DATA_DIR, "guildConfig.json");

const spamCache = new Map();
const SPAM_WINDOW_MS = 8000;
const SPAM_THRESHOLD = 6;

function readGuildConfig(guildId) {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    const data = JSON.parse(raw);
    return data[guildId] || {};
  } catch {
    return {};
  }
}

async function sendConfiguredMessage(guild, channelId, payload) {
  if (!channelId) return;
  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isTextBased()) return;
  await channel.send(payload).catch(() => null);
}

async function handleMemberAdd(member) {
  const cfg = readGuildConfig(member.guild.id);
  if (cfg.autoRoleId) {
    await member.roles.add(cfg.autoRoleId).catch(() => null);
  }
  if (cfg.welcomeChannelId) {
    const welcomeChannel = await member.guild.channels.fetch(cfg.welcomeChannelId).catch(() => null);
    if (welcomeChannel && welcomeChannel.isTextBased()) {
      const ghostPing = await welcomeChannel.send({ content: `${member}` }).catch(() => null);
      if (ghostPing) {
        setTimeout(() => { ghostPing.delete().catch(() => null); }, 2000);
      }
    }
  }
  await sendConfiguredMessage(member.guild, cfg.welcomeChannelId,
    v2Message({ title: "Bienvenue", lines: [`Bienvenue sur **${member.guild.name}**.`] })
  );
}

async function handleMemberRemove(member) {
  const cfg = readGuildConfig(member.guild.id);
  await sendConfiguredMessage(member.guild, cfg.goodbyeChannelId,
    v2Message({ title: "Depart", lines: [`${member.user.tag} a quitte le serveur.`] })
  );
}

function trackSpam(guildId, userId, now) {
  const key = `${guildId}:${userId}`;
  const list = spamCache.get(key) || [];
  const recent = list.filter((ts) => now - ts <= SPAM_WINDOW_MS);
  recent.push(now);
  spamCache.set(key, recent);
  return recent.length >= SPAM_THRESHOLD;
}

async function handleAutoModeration(message) {
  if (!message.guild || message.author.bot) return false;
  if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return false;
  const content = message.content.toLowerCase();
  const hasLink = content.includes("http://") || content.includes("https://") || content.includes("discord.gg/");
  if (hasLink) {
    await message.delete().catch(() => null);
    await message.channel.send(v2Message({ title: "AutoMod", lines: [`${message.author}, les liens ne sont pas autorises ici.`] })).catch(() => null);
    return true;
  }
  const isSpam = trackSpam(message.guild.id, message.author.id, Date.now());
  if (isSpam) {
    await message.delete().catch(() => null);
    if (message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      await message.member.timeout(5 * 60 * 1000, "AutoMod spam").catch(() => null);
    }
    await message.channel.send(v2Message({ title: "AutoMod", lines: [`${message.author} a ete detecte pour spam.`] })).catch(() => null);
    return true;
  }
  return false;
}

module.exports = { handleAutoModeration, handleMemberAdd, handleMemberRemove };
