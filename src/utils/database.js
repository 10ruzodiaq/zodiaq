const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "..", "data", "guilds.json");

// Créer le dossier data s'il n'existe pas
function ensureDataDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Template par défaut pour un serveur
function getDefaultGuildConfig() {
  return {
    logs: {
      channelCreate: "",
      channelDelete: "",
      channelUpdate: "",
      emojiCreate: "",
      emojiDelete: "",
      emojiUpdate: "",
      guildBanAdd: "",
      guildBanRemove: "",
      guildMemberAdd: "",
      guildMemberRemove: "",
      guildMemberUpdate: "",
      guildUpdate: "",
      inviteCreate: "",
      inviteDelete: "",
      messageCreate: "",
      messageDelete: "",
      messageDeleteBulk: "",
      messageReactionAdd: "",
      messageReactionRemove: "",
      messageUpdate: "",
      roleCreate: "",
      roleDelete: "",
      roleUpdate: "",
      stickerCreate: "",
      stickerDelete: "",
      threadCreate: "",
      threadDelete: "",
      threadUpdate: "",
      voiceStateUpdate: "",
      webhookUpdate: "",
    },
    enabled: true,
    ignoreBots: true,
    ignoredChannels: [],
    ignoredUsers: [],
  };
}

// Charger toute la DB
function loadDB() {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return {};
  }
}

// Sauvegarder toute la DB
function saveDB(data) {
  ensureDataDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Récupérer la config d'un serveur
function getGuildConfig(guildId) {
  const db = loadDB();
  if (!db[guildId]) {
    db[guildId] = getDefaultGuildConfig();
    saveDB(db);
  }
  return db[guildId];
}

// Mettre à jour la config d'un serveur
function updateGuildConfig(guildId, key, value) {
  const db = loadDB();
  if (!db[guildId]) {
    db[guildId] = getDefaultGuildConfig();
  }

  // Support dot notation (ex: "logs.messages")
  const keys = key.split(".");
  let obj = db[guildId];
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;

  saveDB(db);
  return db[guildId];
}

// Récupérer le salon de log d'une catégorie pour un serveur
function getLogChannel(guildId, category) {
  const config = getGuildConfig(guildId);
  return config.logs[category] || "";
}

module.exports = {
  getDefaultGuildConfig,
  loadDB,
  saveDB,
  getGuildConfig,
  updateGuildConfig,
  getLogChannel,
};
