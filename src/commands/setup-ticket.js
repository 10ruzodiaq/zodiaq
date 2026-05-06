const { SlashCommandBuilder, PermissionFlagsBits, REST, Routes } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-ticket')
        .setDescription('Mettre en place le système de tickets')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const rest = new REST({ version: '10' }).setToken(config.token);
        const components = [
            {
                type: 17,
                components: [
                    { type: 10, content: "# Système de Support" },
                    { type: 14, divider: true, spacing: 2 },
                    { type: 10, content: "Besoin d'aide ? Notre équipe est là pour vous.\nSélectionnez une catégorie ci-dessous et décrivez votre problème — un membre du staff vous répondra rapidement." },
                    { type: 14, divider: false, spacing: 1 },
                    { type: 10, content: ">>> **Owner** — decal/fusion/plainte de grosse perm\n**Gestion Abus** — abus de perm\n**Gestion Staff** — rank up et mission\n**Gestion Casino** — probleme casino" },
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1,
                        components: [{
                            type: 3, custom_id: "ticket_select", placeholder: "Ouvrir un ticket...",
                            options: [
                                { label: "Owner", description: "decal/fusion/plainte de grosse perm", value: "owner" },
                                { label: "Gestion Abus", description: "abus de perm", value: "gestion_abus" },
                                { label: "Gestion Staff", description: "rank up et mission", value: "gestion_staff" },
                                { label: "Gestion Casino", description: "probleme casino", value: "gestion_casino" }
                            ]
                        }]
                    },
                    { type: 14, divider: false, spacing: 1 },
                    { type: 10, content: "-# Merci de ne pas ouvrir de tickets inutiles." }
                ]
            }
        ];
        try {
            await rest.post(Routes.channelMessages(interaction.channelId), { body: { flags: 1 << 15, components: components } });
            await interaction.reply({ content: 'Système de ticket mis en place avec succès !', flags: 1 << 6 });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Erreur lors de la mise en place du système.', flags: 1 << 6 });
        }
    },
};
