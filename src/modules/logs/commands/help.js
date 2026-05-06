const { v2Message } = require("../../../utils/v2Message");
const config = require("../../../config");

module.exports = {
  name: "help",
  aliases: ["h", "aide", "cmds"],
  async execute(message, args, client) {
    const lp = config.prefixes.logs;
    return message.reply(v2Message({
      title: "Commandes - Logs",
      sections: [
        {
          heading: "Configuration",
          body: `\`${lp}config\` → voir la config\n\`${lp}config setup\` → créer & configurer les salons\n\`${lp}config set <cat> <#salon>\`\n\`${lp}config setall <#salon>\`\n\`${lp}config remove <cat>\`\n\`${lp}config reset\``,
        },
        {
          heading: "Gestion des Logs",
          body: `\`${lp}logs on/off\`\n\`${lp}logs bots\`\n\`${lp}logs ignore <#salon>\`\n\`${lp}logs unignore <#salon>\``,
        },
        {
          heading: "Système",
          body: `\`${lp}status\` → stats du bot\n\`${lp}restart\` → redémarrer (Owner)`,
        },
        {
          heading: "Catégories",
          body: "`messages`, `voice`, `members`, `moderation`, `channels`, `roles`, `server`, `invites`",
        },
      ],
      lines: [`-# Prefix logs : \`${lp}\``],
    }));
  },
};
