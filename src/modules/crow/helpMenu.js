const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { v2Message } = require("../../utils/v2Message");
const config = require("../../config");

const cp = config.prefixes.crow;

const HELP_CATEGORIES = {
  general: {
    label: "General",
    title: "Aide - General",
    sections: [
      {
        heading: "Prefixes du Bot",
        body: `\`${config.prefixes.crow}\` → Crow (moderation, utilitaire)\n\`${config.prefixes.logs}\` → Logs (surveillance serveur)\n\`${config.prefixes.ticket}\` → Ticket (systeme de tickets)`,
      },
      {
        heading: "Commandes",
        body: `\`${cp}ping\` latence\n\`${cp}crowpanel\` panel principal\n\`${cp}commands\` liste etendue`,
      },
      {
        heading: "Informations",
        body: `\`${cp}serverinfo\` infos serveur\n\`${cp}userinfo @membre\` infos membre`,
      },
    ],
  },
  moderation: {
    label: "Moderation",
    title: "Aide - Moderation",
    sections: [
      {
        heading: "Messages et salon",
        body: `\`${cp}clear <1-100>\`\n\`${cp}slowmode <sec>\`\n\`${cp}lock\` / \`${cp}unlock\``,
      },
      {
        heading: "Sanctions",
        body: `\`${cp}timeout @m <min> [raison]\`\n\`${cp}untimeout @m\`\n\`${cp}kick @m [raison]\``,
      },
      {
        heading: "Bannissement",
        body: `\`${cp}ban @m [raison]\`\n\`${cp}unban <id>\`\n\`${cp}nuke\``,
      },
    ],
  },
  admin: {
    label: "Admin",
    title: "Aide - Administration",
    sections: [
      {
        heading: "Gestion",
        body: `\`${cp}announce <texte>\`\n\`${cp}stats\`\n\`${cp}botinfo\``,
      },
      {
        heading: "Configuration",
        body: `\`${cp}setup\` config actuelle\n\`${cp}setlogs\`, \`${cp}setwelcome\`, \`${cp}setgoodbye\``,
      },
      {
        heading: "Roles",
        body: `\`${cp}setautorole\`, \`${cp}setmodrole\`, \`${cp}setadminrole\`, \`${cp}setmuterole\``,
      },
    ],
  },
  utility: {
    label: "Utilitaire",
    title: "Aide - Utilitaire",
    sections: [
      {
        heading: "Profils",
        body: `\`${cp}avatar\`, \`${cp}userinfo\`, \`${cp}serverinfo\``,
      },
      {
        heading: "Salons",
        body: `\`${cp}hide\`, \`${cp}unhide\`, \`${cp}topic\`, \`${cp}rename\`, \`${cp}clone\``,
      },
      {
        heading: "Warns",
        body: `\`${cp}warn @m\`, \`${cp}warnings @m\`, \`${cp}delwarn @m <i>\`, \`${cp}clearwarns @m\``,
      },
      {
        heading: "Alias",
        body: `\`${cp}purge\`=clear, \`${cp}mute\`=timeout, \`${cp}gp\`=ghostping`,
      },
    ],
  },
};

function makeNavRows(activeKey) {
  const entries = Object.entries(HELP_CATEGORIES);
  const rows = [];
  for (let i = 0; i < entries.length; i += 5) {
    const row = new ActionRowBuilder();
    for (const [key, value] of entries.slice(i, i + 5)) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`help:cat:${key}`)
          .setLabel(value.label)
          .setStyle(key === activeKey ? ButtonStyle.Primary : ButtonStyle.Secondary)
      );
    }
    rows.push(row);
  }
  return rows;
}

function buildHelpMessage(categoryKey = "general") {
  const key = HELP_CATEGORIES[categoryKey] ? categoryKey : "general";
  const current = HELP_CATEGORIES[key];
  return v2Message({
    title: current.title,
    sections: current.sections,
    lines: ["Clique sur un bouton pour changer de categorie."],
    components: makeNavRows(key),
  });
}

module.exports = { buildHelpMessage };
