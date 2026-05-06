const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const required = ["DISCORD_TOKEN", "DISCORD_CLIENT_ID", "DISCORD_GUILD_ID"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Variables .env manquantes: ${missing.join(", ")}. Remplis le fichier .env.`
  );
}

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID,

  // ═══════════════════════════════════════════════════════════
  //  PREFIXES — chaque module a son propre prefix
  // ═══════════════════════════════════════════════════════════
  prefixes: {
    crow: "+",     // Commandes Crow (moderation, admin, utilitaire)
    logs: "&",     // Commandes Logs (config, logs, status, restart)
    ticket: "-",    // Commandes Ticket (prefix message)
  },

  // ═══════════════════════════════════════════════════════════
  //  CONFIG LOGS
  // ═══════════════════════════════════════════════════════════
  owners: ["1435301564981186601", "1459984868783034580"],

  logs: {
    messages: "",
    voice: "",
    members: "",
    moderation: "",
    channels: "",
    roles: "",
    server: "",
    invites: "",
  },

  colors: {
    create: "#2B2D31",
    update: "#2B2D31",
    delete: "#2B2D31",
    info: "#2B2D31",
    join: "#2B2D31",
    leave: "#2B2D31",
    warning: "#2B2D31",
    mute: "#2B2D31",
    voice: "#2B2D31",
    moderation: "#2B2D31",
  },

  ignoreBots: true,
  ignoredChannels: [],
  ignoredUsers: [],
  timezone: "Europe/Paris",
  dateFormat: "DD/MM/YYYY à HH:mm:ss",

  // ═══════════════════════════════════════════════════════════
  //  CONFIG TICKET
  // ═══════════════════════════════════════════════════════════
  ticket: {
    ticketCategoryId: "1475093242809810964",
    staffRoleId: "1499809473496088676",
    accentColor: 5793266,
    accentColorClaim: 5763719,
    // Chaque raison de ticket avec son label + role à ping
    reasons: {
      owner: { label: "Owner", roleId: "1474960149763588187" },
      gestion_abus: { label: "Gestion Abus", roleId: "1474909983161192468" },
      gestion_staff: { label: "Gestion Staff", roleId: "1474910482287689788" },
      gestion_casino: { label: "Gestion Casino", roleId: "1474910747208454266" },
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  EMOJIS LOGS — changez l'emoji pour chaque event
  //  Mettez un emoji unicode ou laissez "" pour aucun emoji
  // ═══════════════════════════════════════════════════════════
  logEmojis: {
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
};
