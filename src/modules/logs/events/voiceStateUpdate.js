const { EmbedBuilder } = require("discord.js");
const { sendLog, shouldIgnore } = require("../../../utils/logger");

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldState, newState, client) {
    try {
      const member = newState.member || oldState.member;
      if (!member?.user) return;
      const guildId = newState.guild?.id || oldState.guild?.id;
      if (!guildId) return;
      if (shouldIgnore(guildId, member.id, null, member.user.bot)) return;

      const oldChannel = oldState.channel;
      const newChannel = newState.channel;
      const tag = member.user.tag;
      const avatar = member.user.displayAvatarURL({ dynamic: true });

      // Rejoindre un salon vocal
      if (!oldChannel && newChannel) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**${tag}** a rejoint <#${newChannel.id}>.` + `\n- Membres dans le salon : **${newChannel.members.size}**`)
          .setFooter({ text: `Connexion vocale • ${newChannel.name}` }).setTimestamp();
        await sendLog(client, guildId, "voiceStateUpdate", embed);
        return;
      }

      // Quitter un salon vocal
      if (oldChannel && !newChannel) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**${tag}** a quitte <#${oldChannel.id}>.` + `\n- Membres restants : **${oldChannel.members.size}**`)
          .setFooter({ text: `Deconnexion vocale • ${oldChannel.name}` }).setTimestamp();
        await sendLog(client, guildId, "voiceStateUpdate", embed);
        return;
      }

      // Changer de salon
      if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**Changement vocal**\n- Ancien : <#${oldChannel.id}> (${oldChannel.members.size} restants)\n- Nouveau : <#${newChannel.id}> (${newChannel.members.size} membres)`)
          .setFooter({ text: "Changement de salon" }).setTimestamp();
        await sendLog(client, guildId, "voiceStateUpdate", embed);
        return;
      }

      // Self mute/unmute
      if (oldState.selfMute !== newState.selfMute) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**${tag}** a ${newState.selfMute ? "coupe" : "active"} son micro.`)
          .setFooter({ text: newState.selfMute ? "Micro coupe" : "Micro active" }).setTimestamp();
        await sendLog(client, guildId, "voiceStateUpdate", embed);
      }

      // Self deaf
      if (oldState.selfDeaf !== newState.selfDeaf) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**${tag}** a ${newState.selfDeaf ? "coupe" : "active"} son casque.`)
          .setFooter({ text: newState.selfDeaf ? "Casque coupe" : "Casque active" }).setTimestamp();
        await sendLog(client, guildId, "voiceStateUpdate", embed);
      }

      // Server mute
      if (oldState.serverMute !== newState.serverMute) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**${tag}** ${newState.serverMute ? "mute" : "unmute"} par un admin.`)
          .setFooter({ text: newState.serverMute ? "Mute serveur" : "Unmute serveur" }).setTimestamp();
        await sendLog(client, guildId, "voiceStateUpdate", embed);
      }

      // Server deaf
      if (oldState.serverDeaf !== newState.serverDeaf) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**${tag}** ${newState.serverDeaf ? "rendu sourd" : "undeaf"} par un admin.`)
          .setFooter({ text: newState.serverDeaf ? "Sourd serveur" : "Undeaf" }).setTimestamp();
        await sendLog(client, guildId, "voiceStateUpdate", embed);
      }

      // Streaming
      if (oldState.streaming !== newState.streaming) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**${tag}** a ${newState.streaming ? "commence" : "arrete"} un stream.` + (newChannel ? `\n- Salon : <#${newChannel.id}>` : ""))
          .setFooter({ text: newState.streaming ? "Stream demarre" : "Stream arrete" }).setTimestamp();
        await sendLog(client, guildId, "voiceStateUpdate", embed);
      }

      // Camera
      if (oldState.selfVideo !== newState.selfVideo) {
        const embed = new EmbedBuilder().setColor("#2B2D31")
          .setAuthor({ name: tag, iconURL: avatar })
          .setDescription(`**${tag}** a ${newState.selfVideo ? "active" : "desactive"} sa camera.` + (newChannel ? `\n- Salon : <#${newChannel.id}>` : ""))
          .setFooter({ text: newState.selfVideo ? "Camera activee" : "Camera desactivee" }).setTimestamp();
        await sendLog(client, guildId, "voiceStateUpdate", embed);
      }
    } catch {}
  },
};
