const { REST, Routes } = require("discord.js");
const config = require("./config");
const pingCommand = require("./commands/ping");
const panelCommand = require("./commands/panel");
const setupTicketCommand = require("./commands/setup-ticket");

const commands = [
  pingCommand.data.toJSON(),
  panelCommand.data.toJSON(),
  setupTicketCommand.data.toJSON(),
];

async function deploy() {
  const rest = new REST({ version: "10" }).setToken(config.token);
  await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
    body: commands,
  });
  console.log(`[Combo] ${commands.length} commandes slash déployées.`);
}

deploy().catch((error) => {
  console.error("[Combo] Echec du deploy:", error);
  process.exit(1);
});
