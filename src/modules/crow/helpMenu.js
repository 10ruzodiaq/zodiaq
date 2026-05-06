const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { v2Message } = require("../../utils/v2Message");
const config = require("../../config");

const cp = config.prefixes.crow;
const lp = config.prefixes.logs;
const tp = config.prefixes.ticket;

const HELP_CATEGORIES = {
  general: {
    label: "General",
    title: "Aide - General",
    sections: [
      {
        heading: "Prefixes du Bot",
        body: `\`${cp}\` → Crow (moderation, utilitaire)\n\`${lp}\` → Logs (surveillance serveur)\n\`${tp}\` → Ticket (systeme de tickets)`,
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
  logs: {
    label: "Logs",
    title: "Aide - Logs",
    sections: [
      {
        heading: "Config Logs",
        body: `\`${lp}config\` voir config\n\`${lp}config setup\` creer salons\n\`${lp}config set <cat> <#salon>\`\n\`${lp}config reset\``,
      },
      {
        heading: "Gestion",
        body: `\`${lp}logs on/off\`\n\`${lp}logs bots\`\n\`${lp}logs ignore <#salon>\``,
      },
      {
        heading: "Systeme",
        body: `\`${lp}status\`\n\`${lp}restart\` (Owner)`,
      },
    ],
  },
  ticket: {
    label: "Ticket",
    title: "Aide - Tickets",
    sections: [
      {
        heading: "Tickets",
        body: `\`${tp}setup-ticket\` installe le panel de tickets\n\`${tp}ticket\` (alias)`,
      },
      {
        heading: "Categories",
        body: "Owner\nGestion Abus\nGestion Staff\nGestion Casino",
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
