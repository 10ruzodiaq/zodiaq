const { SlashCommandBuilder } = require("discord.js");
const { ephemeralV2Message } = require("../utils/v2Message");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Repond avec Pong."),
  async execute(interaction) {
    await interaction.reply(ephemeralV2Message({ title: "Latence", lines: [`Pong: \`${interaction.client.ws.ping}ms\``] }));
  },
};
