const { REST, Routes } = require("discord.js");
const config = require("../config");
const { getGuildConfig } = require("./database");
const moment = require("moment");

moment.locale("fr");

const rest = new REST({ version: '10' }).setToken(config.token);

// ─── QUEUE & RATE LIMIT ───
const LOG_QUEUE = new Map(); // channelId -> [{ components }]
const RATE_LIMIT_MS = 600; // min ms between sends per channel
const lastSent = new Map(); // channelId -> timestamp
const MAX_RETRIES = 2;
let processingQueue = false;

/**
 * Envoie un log via Discord Components V2 avec gestion de queue
 */
async function sendLog(client, guildId, category, embed) {
  if (!guildId) return;

  try {
    const guildConfig = getGuildConfig(guildId);
    if (!guildConfig?.enabled) return;

    const channelId = guildConfig.logs?.[category];
    if (!channelId) return;

    const embedData = embed?.data || embed;
    if (!embedData) return;

    const emoji = config.logEmojis?.[category] || '';
    const components = buildV2Components(embedData, emoji);

    // Push to queue
    if (!LOG_QUEUE.has(channelId)) LOG_QUEUE.set(channelId, []);
    LOG_QUEUE.get(channelId).push({ components, retries: 0 });

    // Process queue
    drainQueue();
  } catch (error) {
    // Silent fail - never crash the bot for a log
  }
}

async function drainQueue() {
  if (processingQueue) return;
  processingQueue = true;

  try {
    while (hasQueuedItems()) {
      for (const [channelId, items] of LOG_QUEUE.entries()) {
        if (items.length === 0) { LOG_QUEUE.delete(channelId); continue; }

        const now = Date.now();
        const last = lastSent.get(channelId) || 0;
        if (now - last < RATE_LIMIT_MS) continue;

        const item = items.shift();
        lastSent.set(channelId, now);

        try {
          await rest.post(Routes.channelMessages(channelId), {
            body: { flags: 1 << 15, components: item.components }
          });
        } catch (error) {
          if (error.status === 429) {
            // Rate limited - push back and wait
            items.unshift(item);
            const retryAfter = error.retryAfter || 2;
            lastSent.set(channelId, now + (retryAfter * 1000));
          } else if (error.status >= 500 && item.retries < MAX_RETRIES) {
            item.retries++;
            items.push(item); // retry later
          }
          // 4xx errors (except 429) are silently dropped
        }
      }

      // Small delay between batches
      await new Promise(r => setTimeout(r, 100));
    }
  } finally {
    processingQueue = false;
  }
}

function hasQueuedItems() {
  for (const [, items] of LOG_QUEUE) {
    if (items.length > 0) return true;
  }
  return false;
}

/**
 * Convertit les données d'embed en composants V2
 */
function buildV2Components(embedData, emoji = '') {
  const containerComponents = [];
  const emojiPrefix = emoji ? `${emoji} ` : '';

  // Header
  if (embedData.author?.name) {
    containerComponents.push({ type: 10, content: `## ${emojiPrefix}${embedData.author.name}` });
  } else if (embedData.title) {
    containerComponents.push({ type: 10, content: `## ${emojiPrefix}${embedData.title}` });
  }

  if (containerComponents.length > 0) {
    containerComponents.push({ type: 14, divider: true, spacing: 2 });
  }

  // Description
  if (embedData.description) {
    containerComponents.push({ type: 10, content: embedData.description });
  }

  // Fields
  if (embedData.fields?.length > 0) {
    containerComponents.push({ type: 14, divider: false, spacing: 1 });
    for (const field of embedData.fields) {
      containerComponents.push({ type: 10, content: `**${field.name}**\n${field.value}` });
    }
  }

  // Footer
  containerComponents.push({ type: 14, divider: true, spacing: 1 });
  const footerText = embedData.footer?.text || `Surveillance active • ${moment().format("HH:mm")}`;
  containerComponents.push({ type: 10, content: `-# ${footerText}` });

  return [{ type: 17, components: containerComponents }];
}

// ─── UTILITIES ───

function shouldIgnore(guildId, userId, channelId, isBot = false) {
  try {
    const guildConfig = getGuildConfig(guildId);
    if (!guildConfig) return true;
    if (guildConfig.ignoreBots && isBot) return true;
    if (channelId && guildConfig.ignoredChannels?.includes(channelId)) return true;
    if (userId && guildConfig.ignoredUsers?.includes(userId)) return true;
  } catch {
    return false;
  }
  return false;
}

function truncate(text, maxLength = 1024) {
  if (!text) return "*Aucun contenu*";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

function channelTypeToString(type) {
  const types = {
    0: "Salon textuel",
    2: "Salon vocal",
    4: "Categorie",
    5: "Salon d'annonces",
    10: "Thread d'annonces",
    11: "Thread public",
    12: "Thread prive",
    13: "Salon stage",
    14: "Repertoire",
    15: "Forum",
    16: "Salon media",
  };
  return types[type] || `Type inconnu (${type})`;
}

/**
 * Fetch audit log entry de maniere fiable avec delai
 */
async function fetchAuditLog(guild, type, targetId, delayMs = 800) {
  try {
    await new Promise(r => setTimeout(r, delayMs));
    const auditLogs = await guild.fetchAuditLogs({ type, limit: 5 });
    const entry = auditLogs.entries.find(e => {
      if (targetId && e.target?.id !== targetId) return false;
      // L'entree doit etre recente (< 10s)
      return Date.now() - e.createdTimestamp < 10000;
    });
    return entry || null;
  } catch {
    return null;
  }
}

/**
 * Formatte un timestamp Discord
 */
function timestamp(date, style = "F") {
  const ts = date instanceof Date ? Math.floor(date.getTime() / 1000) : Math.floor(date / 1000);
  return `<t:${ts}:${style}>`;
}

module.exports = { sendLog, shouldIgnore, truncate, channelTypeToString, fetchAuditLog, timestamp };
