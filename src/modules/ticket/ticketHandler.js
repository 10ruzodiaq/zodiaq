const { ChannelType, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, REST, Routes } = require('discord.js');
const config = require('../../config');

// Roles et labels lus depuis config.ticket.reasons
const getReasonConfig = (reason) => config.ticket.reasons?.[reason] || {};
const getReasonLabel = (reason) => getReasonConfig(reason).label || reason;
const getReasonRoleId = (reason) => getReasonConfig(reason).roleId || "";

async function handleTicketSelect(interaction) {
  if (interaction.customId !== 'ticket_select') return false;
  const reason = interaction.values[0];
  const modal = new ModalBuilder().setCustomId(`ticket_modal_${reason}`).setTitle('Création de Ticket');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('ticket_subject').setLabel("Sujet de votre demande")
        .setPlaceholder("Ex: Problème de connexion").setStyle(TextInputStyle.Short).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('ticket_desc').setLabel("Description détaillée")
        .setPlaceholder("Décrivez votre problème...").setStyle(TextInputStyle.Paragraph).setRequired(true)
    )
  );
  await interaction.showModal(modal);
  return true;
}

async function handleTicketModal(interaction) {
  if (!interaction.customId.startsWith('ticket_modal_')) return false;
  try { await interaction.deferReply({ flags: 1 << 6 }); } catch (e) { console.error("Error deferring:", e); return true; }

  const rest = new REST({ version: '10' }).setToken(config.token);
  const reason = interaction.customId.replace('ticket_modal_', '');
  const subject = interaction.fields.getTextInputValue('ticket_subject');
  const desc = interaction.fields.getTextInputValue('ticket_desc');

  try {
    const permissionOverwrites = [
      { id: interaction.guild.id, type: 0, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: interaction.user.id, type: 1, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] },
    ];
    if (config.ticket.staffRoleId) {
      permissionOverwrites.push({ id: config.ticket.staffRoleId, type: 0, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] });
    }
    const reasonRoleId = getReasonRoleId(reason);
    if (reasonRoleId) {
      permissionOverwrites.push({ id: reasonRoleId, type: 0, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] });
    }

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`, type: ChannelType.GuildText,
      parent: config.ticket.ticketCategoryId || null, permissionOverwrites,
    });

    const ticketComponents = [{
      type: 17, components: [
        { type: 10, content: `# Ticket — ${subject}` },
        { type: 14, divider: true, spacing: 2 },
        { type: 9, components: [
          { type: 10, content: `**Catégorie ·** ${getReasonLabel(reason)}` },
          { type: 10, content: `**Ouvert par ·** <@${interaction.user.id}>` },
          { type: 10, content: `**Date ·** <t:${Math.floor(Date.now() / 1000)}:F>` }
        ], accessory: { type: 11, media: { url: interaction.user.displayAvatarURL({ extension: 'png', size: 256 }) } } },
        { type: 14, divider: true, spacing: 2 },
        { type: 10, content: `>>> ${desc}` },
        { type: 14, divider: true, spacing: 2 },
        { type: 10, content: "-# Un membre du staff va prendre en charge votre demande sous peu." },
        { type: 1, components: [
          { type: 2, custom_id: "close_ticket", label: "Fermer le ticket", style: 4 },
          { type: 2, custom_id: "claim_ticket", label: "Prendre en charge", style: 3 }
        ] }
      ]
    }];

    const roleToPing = reasonRoleId ? `<@&${reasonRoleId}>` : '';
    await channel.send({ content: `<@${interaction.user.id}> ${roleToPing}`.trim(), allowedMentions: { parse: ['users', 'roles'] } }).catch(() => {});
    await rest.post(Routes.channelMessages(channel.id), { body: { flags: 1 << 15, components: ticketComponents } });
    await interaction.editReply(`Votre ticket a été créé → <#${channel.id}>`);
  } catch (error) {
    console.error("Error creating ticket:", error);
    await interaction.editReply("Erreur lors de la création du ticket.").catch(() => {});
  }
  return true;
}

async function handleTicketClose(interaction) {
  if (interaction.customId !== 'close_ticket') return false;
  const rest = new REST({ version: '10' }).setToken(config.token);
  const closingComponents = [{ type: 17, components: [
    { type: 10, content: `## Ticket fermé` },
    { type: 14, divider: true, spacing: 1 },
    { type: 10, content: `Fermé par <@${interaction.user.id}>\nSuppression dans **5 secondes**...` }
  ] }];
  await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
    body: { type: 4, data: { flags: 1 << 15, components: closingComponents } }
  });
  setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
  return true;
}

async function handleTicketClaim(interaction) {
  if (interaction.customId !== 'claim_ticket') return false;
  const rest = new REST({ version: '10' }).setToken(config.token);
  const staffRoleId = config.ticket.staffRoleId;
  if (staffRoleId && !interaction.member.roles.cache.has(staffRoleId) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: "Vous n'avez pas la permission.", flags: 1 << 6 });
  }
  try {
    const msg = await rest.get(Routes.channelMessage(interaction.channelId, interaction.message.id));
    const updated = JSON.parse(JSON.stringify(msg.components));
    for (const c of updated) {
      if (c.type === 17) for (const child of c.components) if (child.type === 1) for (const btn of child.components) if (btn.custom_id === 'claim_ticket') btn.disabled = true;
    }
    await rest.patch(Routes.channelMessage(interaction.channelId, interaction.message.id), { body: { flags: 1 << 15, components: updated } });
  } catch (e) { console.error(e); }
  const claimComponents = [{ type: 17, components: [
    { type: 10, content: `## Ticket pris en charge` },
    { type: 14, divider: true, spacing: 1 },
    { type: 10, content: `<@${interaction.user.id}> s'occupe de votre demande.` }
  ] }];
  await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
    body: { type: 4, data: { flags: 1 << 15, components: claimComponents } }
  });
  return true;
}

module.exports = { handleTicketSelect, handleTicketModal, handleTicketClose, handleTicketClaim };
