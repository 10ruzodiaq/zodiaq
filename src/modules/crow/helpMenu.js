const { v2Message } = require("../../utils/v2Message");
const config = require("../../config");

const cp = config.prefixes.crow;
const lp = config.prefixes.logs;
const tp = config.prefixes.ticket;

function buildHelpMessage() {
  return v2Message({
    title: "Aide",
    sections: [
      {
        heading: "Prefixes",
        body: `\`${cp}\` Crow (moderation, utilitaire)\n\`${lp}\` Logs (surveillance serveur)\n\`${tp}\` Ticket (systeme de tickets)`,
      },
      {
        heading: "Commandes",
        body: `\`${cp}ping\` latence\n\`${cp}crowpanel\` panel principal\n\`${cp}commands\` liste etendue\n\`${cp}serverinfo\` infos serveur\n\`${cp}userinfo @membre\` infos membre\n\`${cp}avatar @membre\` avatar\n\`${cp}stats\` statistiques serveur\n\`${cp}botinfo\` infos bot`,
      },
      {
        heading: "Moderation",
        body: `\`${cp}clear <1-100>\` supprimer messages\n\`${cp}slowmode <sec>\` mode lent\n\`${cp}lock\` / \`${cp}unlock\` verrouiller salon\n\`${cp}timeout @m <min> [raison]\` mute\n\`${cp}untimeout @m\` unmute\n\`${cp}kick @m [raison]\` expulser\n\`${cp}ban @m [raison]\` bannir\n\`${cp}unban <id>\` debannir\n\`${cp}nuke\` reinitialiser salon`,
      },
      {
        heading: "Utilitaire",
        body: `\`${cp}ghostping @m [#salon] [msg]\`\n\`${cp}hide\` / \`${cp}unhide\` masquer salon\n\`${cp}topic <texte>\` changer sujet\n\`${cp}rename [#salon] <nom>\` renommer\n\`${cp}clone [#salon]\` cloner\n\`${cp}announce <texte>\` annonce\n\`${cp}emoji <emoji>\` voler emoji\n\`${cp}nick @m <pseudo>\` / \`${cp}resetnick @m\`\n\`${cp}addrole @m @role\` / \`${cp}removerole @m @role\``,
      },
      {
        heading: "Warns",
        body: `\`${cp}warn @m [raison]\` avertir\n\`${cp}warnings @m\` voir warns\n\`${cp}delwarn @m <i>\` supprimer warn\n\`${cp}clearwarns @m\` tout effacer`,
      },
      {
        heading: "Configuration",
        body: `\`${cp}setup\` config actuelle\n\`${cp}setlogs\` / \`${cp}setwelcome\` / \`${cp}setgoodbye\`\n\`${cp}setautorole\` / \`${cp}setmodrole\` / \`${cp}setadminrole\` / \`${cp}setmuterole\``,
      },
      {
        heading: "Logs",
        body: `\`${lp}config\` voir config\n\`${lp}config setup\` creer salons\n\`${lp}config set <cat> <#salon>\`\n\`${lp}config reset\`\n\`${lp}logs on/off\` / \`${lp}status\``,
      },
      {
        heading: "Tickets",
        body: `\`${tp}setup-ticket\` installer le panel de tickets`,
      },
    ],
    noAccent: true,
  });
}

module.exports = { buildHelpMessage };
