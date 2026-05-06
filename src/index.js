const { Client, Collection, GatewayIntentBits, Partials, ActivityType, EmbedBuilder, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config");

// ═══════════════════════════════════════════════════════════
//  IMPORTS MODULES
// ═══════════════════════════════════════════════════════════

// Crow
const { handlePrefixCommand } = require("./modules/crow/prefixCommands");
const { handleAutoModeration, handleMemberAdd, handleMemberRemove } = require("./modules/crow/serverAutomation");
const { handleButton: handleCrowButton, handleSelect: handleCrowSelect, handleModal: handleCrowModal } = require("./modules/crow/componentRouter");

// Slash commands
const pingCommand = require("./commands/ping");
const panelCommand = require("./commands/panel");
const setupTicketCommand = require("./commands/setup-ticket");

// Ticket
const { handleTicketSelect, handleTicketModal, handleTicketClose, handleTicketClaim } = require("./modules/ticket/ticketHandler");

// Logs commands
const logsCommandsPath = path.join(__dirname, "modules", "logs", "commands");
const logsCommands = new Collection();
const logsCommandFiles = fs.readdirSync(logsCommandsPath).filter((f) => f.endsWith(".js"));
for (const file of logsCommandFiles) {
  const cmd = require(path.join(logsCommandsPath, file));
  logsCommands.set(cmd.name, cmd);
  if (cmd.aliases) cmd.aliases.forEach((alias) => logsCommands.set(alias, cmd));
}

// Logs events
const logsEventsPath = path.join(__dirname, "modules", "logs", "events");
const logsEventFiles = fs.readdirSync(logsEventsPath).filter((f) => f.endsWith(".js"));
const logsEvents = [];
for (const file of logsEventFiles) {
  logsEvents.push(require(path.join(logsEventsPath, file)));
}

const RESTART_FILE = path.join(__dirname, "..", "data", "restart.json");

// ═══════════════════════════════════════════════════════════
//  CLIENT DISCORD
// ═══════════════════════════════════════════════════════════
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message, Partials.Channel, Partials.Reaction,
    Partials.User, Partials.GuildMember, Partials.ThreadMember,
  ],
});

// ═══════════════════════════════════════════════════════════
//  SLASH COMMANDS
// ═══════════════════════════════════════════════════════════
client.commands = new Collection();
for (const command of [pingCommand, panelCommand, setupTicketCommand]) {
  client.commands.set(command.data.name, command);
}

// ═══════════════════════════════════════════════════════════
//  REGISTER LOG EVENTS
// ═══════════════════════════════════════════════════════════
for (const event of logsEvents) {
  client.on(event.name, (...args) => event.execute(...args, client));
}

// ═══════════════════════════════════════════════════════════
//  READY
// ═══════════════════════════════════════════════════════════
client.once("ready", async () => {
  console.log("╔══════════════════════════════════════════════╗");
  console.log(`║  Bot Combo connecte: ${client.user.tag.padEnd(20)}  ║`);
  console.log(`║  ${String(client.guilds.cache.size).padEnd(2)} serveur(s)                             ║`);
  console.log(`║  Prefixes: + (Crow) & (Logs) - (Ticket)     ║`);
  console.log("╚══════════════════════════════════════════════╝");

  client.user.setPresence({
    activities: [{ name: "+help | &help ", type: ActivityType.Watching }],
    status: "dnd",
  });

  // Register slash commands
  try {
    const rest = new REST({ version: "10" }).setToken(config.token);
    const cmds = [pingCommand.data.toJSON(), panelCommand.data.toJSON(), setupTicketCommand.data.toJSON()];
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: cmds });
    console.log(`[Combo] ${cmds.length} slash commandes déployées.`);
  } catch (error) {
    console.error("[Combo] Erreur deploy slash:", error);
  }

  // Post-restart message
  if (fs.existsSync(RESTART_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(RESTART_FILE, "utf8"));
      fs.unlinkSync(RESTART_FILE);
      const channel = await client.channels.fetch(data.channelId).catch(() => null);
      if (channel) {
        const uptime = ((Date.now() - data.timestamp) / 1000).toFixed(1);
        await channel.send({ embeds: [new EmbedBuilder().setColor("#2B2D31").setDescription(`**Bot redémarré !**\n\nTemps: **${uptime}s**\nPar: **${data.tag}**`)] });
      }
    } catch (err) { console.error("Erreur post-restart:", err); }
  }
});

// ═══════════════════════════════════════════════════════════
//  INTERACTION CREATE (Slash + Buttons + Selects + Modals)
// ═══════════════════════════════════════════════════════════
client.on("interactionCreate", async (interaction) => {
  try {
    // Slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    // Buttons
    if (interaction.isButton()) {
      // Ticket buttons
      if (await handleTicketClose(interaction)) return;
      if (await handleTicketClaim(interaction)) return;
      // Crow buttons (help nav, panel)
      await handleCrowButton(interaction);
      return;
    }

    // Select menus
    if (interaction.isStringSelectMenu()) {
      // Ticket select
      if (await handleTicketSelect(interaction)) return;
      // Crow select
      await handleCrowSelect(interaction);
      return;
    }

    // Modals
    if (interaction.isModalSubmit()) {
      // Ticket modal
      if (await handleTicketModal(interaction)) return;
      // Crow modal (feedback)
      await handleCrowModal(interaction);
    }
  } catch (error) {
    console.error("[Combo] Erreur interaction:", error);
    const reply = { content: "Une erreur est survenue.", flags: 1 << 6 };
    if (interaction.replied || interaction.deferred) await interaction.followUp(reply).catch(() => { });
    else await interaction.reply(reply).catch(() => { });
  }
});

// ═══════════════════════════════════════════════════════════
//  MESSAGE CREATE (Prefix commands: + and & and -)
// ═══════════════════════════════════════════════════════════
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  // AutoMod (Crow)
  const blockedByAutoMod = await handleAutoModeration(message);
  if (blockedByAutoMod) return;

  const content = message.content;

  // ─── COMMANDE !prefix ───
  if (content.toLowerCase() === "!prefix" || content.toLowerCase() === "!prefixes") {
    const rest = new REST({ version: '10' }).setToken(config.token);
    try {
      await rest.post(Routes.channelMessages(message.channel.id), {
        body: {
          flags: 1 << 15,
          message_reference: { message_id: message.id },
          components: [{
            type: 17,
            components: [
              { type: 10, content: "# Prefixes du Bot" },
              { type: 14, divider: true, spacing: 2 },
              { type: 10, content: `## Module Crow — \`${config.prefixes.crow}\`` },
              { type: 10, content: `> Modération, administration, utilitaire\n> Exemples : \`${config.prefixes.crow}help\` · \`${config.prefixes.crow}ban\` · \`${config.prefixes.crow}clear\` · \`${config.prefixes.crow}warn\`` },
              { type: 14, divider: true, spacing: 1 },
              { type: 10, content: `## Module Logs — \`${config.prefixes.logs}\`` },
              { type: 10, content: `> Surveillance et configuration des logs serveur\n> Exemples : \`${config.prefixes.logs}config\` · \`${config.prefixes.logs}logs on\` · \`${config.prefixes.logs}status\`` },
              { type: 14, divider: true, spacing: 1 },
              { type: 10, content: `## Module Ticket — \`${config.prefixes.ticket}\`` },
              { type: 10, content: `> Système de support par tickets\n> Exemples : \`${config.prefixes.ticket}setup-ticket\` · \`${config.prefixes.ticket}ticket\`` },
              { type: 14, divider: true, spacing: 1 },
              { type: 10, content: `## Commande Globale — \`!\`` },
              { type: 10, content: "> Afficher ce message : `!prefix`" },
              { type: 14, divider: true, spacing: 2 },
              { type: 10, content: "-# Tape un prefix suivi de help pour voir les commandes du module." }
            ]
          }]
        }
      });
    } catch (error) {
      console.error("[Combo] Erreur !prefix:", error);
    }
    return;
  }

  // ─── PREFIX CROW (+) ───
  if (content.startsWith(config.prefixes.crow)) {
    const args = content.slice(config.prefixes.crow.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    try {
      const handled = await handlePrefixCommand(message, commandName, args, panelCommand);
      if (!handled) return;
    } catch (error) {
      console.error("[Crow] Erreur commande:", error);
      try {
        const { v2Message } = require("./utils/v2Message");
        await message.reply(v2Message({ title: "Erreur", lines: ["Une erreur est survenue."] }));
      } catch (replyError) {
        console.error("[Crow] Impossible d'envoyer l'erreur:", replyError);
      }
    }
    return;
  }

  // ─── PREFIX LOGS (&) ───
  if (content.startsWith(config.prefixes.logs)) {
    const args = content.slice(config.prefixes.logs.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command = logsCommands.get(commandName);
    if (!command) return;

    // Owner check
    if (command.ownerOnly) {
      if (!config.owners.includes(message.author.id)) {
        const rest = new REST({ version: '10' }).setToken(config.token);
        return rest.post(Routes.channelMessages(message.channel.id), {
          body: {
            flags: 1 << 15,
            message_reference: { message_id: message.id },
            components: [{
              type: 17, components: [
                { type: 10, content: "## Accès Refusé" },
                { type: 14, divider: true, spacing: 1 },
                { type: 10, content: "Seul le propriétaire du bot peut utiliser cette commande." }
              ]
            }]
          }
        });
      }
    }

    // Permission check
    if (command.permissions) {
      if (!message.member.permissions.has(command.permissions)) {
        const rest = new REST({ version: '10' }).setToken(config.token);
        return rest.post(Routes.channelMessages(message.channel.id), {
          body: {
            flags: 1 << 15,
            message_reference: { message_id: message.id },
            components: [{
              type: 17, components: [
                { type: 10, content: "## Permission Requise" },
                { type: 14, divider: true, spacing: 1 },
                { type: 10, content: "Tu n'as pas les permissions nécessaires." }
              ]
            }]
          }
        });
      }
    }

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(`[Logs] Erreur commande ${commandName}:`, error);
      const { v2Message } = require("./utils/v2Message");
      message.reply(v2Message({ title: "Erreur", lines: ["Une erreur est survenue."] })).catch(() => { });
    }
    return;
  }

  // ─── PREFIX TICKET (-) ───
  if (content.startsWith(config.prefixes.ticket)) {
    const args = content.slice(config.prefixes.ticket.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    if (commandName === "setup-ticket" || commandName === "setupticket" || commandName === "ticket") {
      if (!message.member.permissions.has("Administrator")) {
        return message.reply({ content: "Tu dois être administrateur.", flags: 1 << 6 }).catch(() => { });
      }
      try {
        // Simulate interaction-like call by passing message context
        const rest = new REST({ version: '10' }).setToken(config.token);
        const components = [{
          type: 17,
          components: [
            { type: 10, content: "# Système de Support" },
            { type: 14, divider: true, spacing: 2 },
            { type: 10, content: "Besoin d'aide ? Notre équipe est là pour vous.\nSélectionnez une catégorie ci-dessous et décrivez votre problème — un membre du staff vous répondra rapidement." },
            { type: 14, divider: false, spacing: 1 },
            { type: 10, content: ">>> **Owner** — decal/fusion/plainte de grosse perm\n**Gestion Abus** — abus de perm\n**Gestion Staff** — rank up et mission\n**Gestion Casino** — probleme casino" },
            { type: 14, divider: true, spacing: 2 },
            {
              type: 1, components: [{
                type: 3, custom_id: "ticket_select", placeholder: "Ouvrir un ticket...", options: [
                  { label: "Owner", description: "decal/fusion/plainte de grosse perm", value: "owner" },
                  { label: "Gestion Abus", description: "abus de perm", value: "gestion_abus" },
                  { label: "Gestion Staff", description: "rank up et mission", value: "gestion_staff" },
                  { label: "Gestion Casino", description: "probleme casino", value: "gestion_casino" }
                ]
              }]
            },
            { type: 14, divider: false, spacing: 1 },
            { type: 10, content: "-# Merci de ne pas ouvrir de tickets inutiles." }
          ]
        }];
        await rest.post(Routes.channelMessages(message.channel.id), { body: { flags: 1 << 15, components } });
        await message.delete().catch(() => { });
      } catch (error) {
        console.error("[Ticket] Erreur setup:", error);
        message.reply("Erreur lors de la mise en place du système.").catch(() => { });
      }
      return;
    }
  }
});

// ═══════════════════════════════════════════════════════════
//  MEMBER EVENTS (Crow automation)
// ═══════════════════════════════════════════════════════════
client.on("guildMemberAdd", async (member) => { await handleMemberAdd(member); });
client.on("guildMemberRemove", async (member) => { await handleMemberRemove(member); });

// ═══════════════════════════════════════════════════════════
//  SERVEUR HTTP (pour hébergement Render/gratuit)
// ═══════════════════════════════════════════════════════════
const http = require("http");
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot combo is running!");
}).listen(process.env.PORT || 3000, () => {
  console.log("[Combo] Serveur HTTP actif sur le port", process.env.PORT || 3000);
});

// ═══════════════════════════════════════════════════════════
//  CONNEXION
// ═══════════════════════════════════════════════════════════
client.login(config.token).catch((err) => {
  console.error("Erreur de connexion:", err.message);
  console.error("Verifie ton DISCORD_TOKEN dans le fichier .env");
});
