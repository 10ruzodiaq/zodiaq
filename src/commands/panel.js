const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, MessageFlags } = require("discord.js");
const config = require("../config");

function buildPanelMessage() {
  const cp = config.prefixes.crow;
  const lp = config.prefixes.logs;
  const tp = config.prefixes.ticket;
  const rowButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("crow:hello").setLabel("Presentation").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("crow:rules").setLabel("Regles").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("crow:modal").setLabel("Feedback").setStyle(ButtonStyle.Success)
  );
  const rowSelect = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId("crow:menu").setPlaceholder("Selectionne une section")
      .addOptions(
        { label: "A propos", description: "Presentation rapide du bot", value: "about" },
        { label: "Support", description: "Aide et contact moderation", value: "support" }
      )
  );
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [{
      type: 17,
      components: [
        { type: 10, content: "# Bot Combo — Control Center" },
        { type: 14, divider: true, spacing: 2 },
        { type: 10, content: "## Interface principale" },
        { type: 10, content: "Ce panneau centralise les actions rapides et les informations utiles." },
        { type: 14, divider: true, spacing: 1 },
        { type: 10, content: `## Prefixes\n\`${cp}\` Crow  •  \`${lp}\` Logs  •  \`${tp}\` Ticket` },
        { type: 10, content: `## Commandes rapides\n\`${cp}help\`  •  \`${cp}ping\`  •  \`${lp}status\`  •  \`${tp}setup-ticket\`` },
        { type: 10, content: "## Navigation\n- Boutons: actions immediates\n- Menu: sections d'information" },
        rowButtons.toJSON(),
        rowSelect.toJSON(),
      ],
    }],
  };
}

module.exports = {
  data: new SlashCommandBuilder().setName("crowpanel").setDescription("Affiche le panneau composants V2 du Bot Combo."),
  async execute(interaction) { await interaction.reply(buildPanelMessage()); },
  buildPanelMessage,
};
