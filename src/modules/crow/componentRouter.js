const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { ephemeralV2Message } = require("../../utils/v2Message");
const { buildHelpMessage } = require("./helpMenu");

async function handleButton(interaction) {
  if (interaction.customId.startsWith("help:cat:")) {
    const categoryKey = interaction.customId.replace("help:cat:", "");
    await interaction.update(buildHelpMessage(categoryKey));
    return;
  }
  if (interaction.customId === "crow:hello") {
    await interaction.reply(ephemeralV2Message({ title: "Presentation", lines: [`Salut ${interaction.user}, bienvenue chez les crows.`] }));
    return;
  }
  if (interaction.customId === "crow:rules") {
    await interaction.reply(ephemeralV2Message({ title: "Regles Rapides", lines: ["Respect", "Pas de spam", "Pas de drama"] }));
    return;
  }
  if (interaction.customId === "crow:modal") {
    const feedbackInput = new TextInputBuilder()
      .setCustomId("feedback_text").setLabel("Ton feedback")
      .setStyle(TextInputStyle.Paragraph).setPlaceholder("Dis-nous ce qu'on peut ameliorer...")
      .setRequired(true).setMaxLength(500);
    const modal = new ModalBuilder()
      .setCustomId("crow:feedback").setTitle("Feedback Bot")
      .addComponents(new ActionRowBuilder().addComponents(feedbackInput));
    await interaction.showModal(modal);
  }
}

async function handleSelect(interaction) {
  const selected = interaction.values[0];
  if (selected === "about") {
    await interaction.reply(ephemeralV2Message({ title: "A Propos", lines: ["Bot combo: Crow + Ticket + Logs en un seul bot.", "Toutes les reponses sont en Components V2."] }));
    return;
  }
  if (selected === "support") {
    await interaction.reply(ephemeralV2Message({ title: "Support", lines: ["Ouvre un ticket dans #support ou contacte un administrateur."] }));
  }
}

async function handleModal(interaction) {
  if (interaction.customId !== "crow:feedback") return;
  const feedback = interaction.fields.getTextInputValue("feedback_text");
  await interaction.reply(ephemeralV2Message({ title: "Feedback Recu", lines: [feedback] }));
}

module.exports = { handleButton, handleSelect, handleModal };
