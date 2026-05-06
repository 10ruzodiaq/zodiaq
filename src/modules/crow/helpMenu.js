const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { v2Message } = require("../../utils/v2Message");
const config = require("../../config");

const cp = config.prefixes.crow;

const lp = config.prefixes.logs;
const tp = config.prefixes.ticket;

const HELP_CATEGORIES = {
  general: {
    label: "General",
    title: "Aide — General",
    sections: [
      {
        heading: "Prefixes du Bot",
        body: `\`${cp}\` → Crow (moderation, utilitaire)\n\`${lp}\` → Logs (surveillance serveur)\n\`${tp}\` → Ticket (systeme de tickets)`,
      },
      {
        heading: "Commandes",
        body: `\`${cp}help\` ce menu\n\`${cp}ping\` latence du bot\n\`${cp}crowpanel\` panel principal\n\`${cp}commands\` liste complete`,
      },
      {
        heading: "Informations",
        body: `\`${cp}serverinfo\` infos serveur\n\`${cp}userinfo [@membre]\` infos membre\n\`${cp}avatar [@membre]\` avatar\n\`${cp}botinfo\` infos du bot\n\`${cp}stats\` statistiques serveur`,
      },
    ],
  },
  moderation: {
    label: "Moderation",
    title: "Aide — Moderation",
    sections: [
      {
        heading: "Messages & Salon",
        body: `\`${cp}clear <1-100>\` supprimer des messages\n\`${cp}slowmode <0-21600>\` mode lent\n\`${cp}lock [#salon]\` verrouiller\n\`${cp}unlock [#salon]\` deverrouiller\n\`${cp}nuke\` reinitialiser le salon`,
      },
      {
        heading: "Sanctions",
        body: `\`${cp}timeout @m <min> [raison]\`\n\`${cp}untimeout @m\`\n\`${cp}kick @m [raison]\`\n\`${cp}ban @m [raison]\`\n\`${cp}unban <id> [raison]\``,
      },
      {
        heading: "Warns",
        body: `\`${cp}warn @m [raison]\` avertir\n\`${cp}warnings @m\` voir les warns\n\`${cp}delwarn @m <index>\` supprimer un warn\n\`${cp}clearwarns @m\` tout effacer`,
      },
      {
        heading: "Outils Mod",
        body: `\`${cp}ghostping @m [#salon] [msg]\`\n\`${cp}nick @m <pseudo>\` changer pseudo\n\`${cp}resetnick @m\` reinitialiser pseudo`,
      },
    ],
  },
  admin: {
    label: "Admin",
    title: "Aide — Administration",
    sections: [
      {
        heading: "Gestion",
        body: `\`${cp}announce <texte>\` envoyer une annonce\n\`${cp}stats\` statistiques\n\`${cp}botinfo\` infos bot`,
      },
      {
        heading: "Roles",
        body: `\`${cp}addrole @m @role\` ajouter un role\n\`${cp}removerole @m @role\` retirer un role`,
      },
      {
        heading: "Config Serveur",
        body: `\`${cp}setup\` config actuelle\n\`${cp}setlogs\` salon logs\n\`${cp}setwelcome\` salon bienvenue\n\`${cp}setgoodbye\` salon au revoir`,
      },
      {
        heading: "Config Roles",
        body: `\`${cp}setautorole\` role auto\n\`${cp}setmodrole\` role moderateur\n\`${cp}setadminrole\` role admin\n\`${cp}setmuterole\` role mute`,
      },
    ],
  },
  utility: {
    label: "Utilitaire",
    title: "Aide — Utilitaire",
    sections: [
      {
        heading: "Profils",
        body: `\`${cp}avatar [@membre]\` afficher l'avatar\n\`${cp}userinfo [@membre]\` infos membre\n\`${cp}serverinfo\` infos serveur`,
      },
      {
        heading: "Salons",
        body: `\`${cp}hide [#salon]\` masquer\n\`${cp}unhide [#salon]\` rendre visible\n\`${cp}topic <texte>\` changer le sujet\n\`${cp}rename [#salon] <nom>\` renommer\n\`${cp}clone [#salon]\` dupliquer`,
      },
      {
        heading: "Emoji",
        body: `\`${cp}emoji <emoji>\` voler un emoji\n\`${cp}emoji\` (en reply) voler depuis un message`,
      },
      {
        heading: "Alias",
        body: `\`${cp}purge\`=clear · \`${cp}mute\`=timeout · \`${cp}unmute\`=untimeout\n\`${cp}gp\`=ghostping · \`${cp}av\`=avatar\n\`${cp}si\`=serverinfo · \`${cp}ui\`=userinfo\n\`${cp}steal\`=emoji · \`${cp}h\`=help`,
      },
    ],
  },
  logs: {
    label: "Logs",
    title: "Aide — Module Logs",
    sections: [
      {
        heading: "Configuration",
        body: `\`${lp}config\` voir la config\n\`${lp}config setup\` creer tous les salons\n\`${lp}config set <event> <#salon>\`\n\`${lp}config setall <#salon>\`\n\`${lp}config remove <event>\`\n\`${lp}config reset\` reinitialiser\n\`${lp}config list\` liste des events`,
      },
      {
        heading: "Gestion",
        body: `\`${lp}logs on/off\` activer/desactiver\n\`${lp}logs bots\` ignorer les bots\n\`${lp}logs ignore <#salon>\`\n\`${lp}logs unignore <#salon>\``,
      },
      {
        heading: "Systeme",
        body: `\`${lp}help\` aide logs\n\`${lp}status\` statistiques du bot\n\`${lp}restart\` redemarrer (Owner)`,
      },
    ],
  },
  ticket: {
    label: "Ticket",
    title: "Aide — Module Ticket",
    sections: [
      {
        heading: "Fonctionnement",
        body: `Le systeme de ticket utilise un menu de selection.\nUn panel est disponible via \`/ticket\` ou le Crow Panel.`,
      },
      {
        heading: "Categories",
        body: `**Owner** · **Gestion Abus** · **Gestion Staff** · **Gestion Casino**`,
      },
      {
        heading: "Actions",
        body: `**Fermer** un ticket via le bouton rouge\n**Prendre en charge** via le bouton vert`,
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
