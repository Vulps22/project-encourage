const Server = require("objects/server");
const Handler = require("handlers/handler");
const embedder = require('embedder.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ComponentType, Interaction } = require("discord.js");
const logger = require("objects/logger.js");

class SetupHandler extends Handler {
    constructor() {
        super("setup");
    }

    /**
     * 
     * @param {Interaction} interaction 
     */
    async startSetup(interaction) {
        if(!interaction.deferred) await interaction.deferReply();
        let server = new Server(interaction.guildId);
        await server.load();
        if (!server.exists) {  // Assuming there is a property to check if the server is loaded
            await server.save();
        }

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('setup_1_accept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('setup_1_decline')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.editReply({ embeds: [embedder.terms()], components: [actionRow] });
    }
/**
 * 
 * @param {Interaction} interaction 
 */
    async action_1(interaction) {
        let server = new Server(interaction.guildId);
        await server.load();
        let choice = interaction.customId.split('_')[2];

        if (choice === 'accept') {
            server.hasAccepted = 1;
            await server.save();
            logger.updateServer(server);
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('setup_1_accept')
                        .setLabel('Accepted')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true)
                );

                

            const channelMenu = new ChannelSelectMenuBuilder()
                .setCustomId('setup_2_channel')
                .setPlaceholder('Select a channel')
                .setMinValues(1)
                .setMaxValues(1)
                .setChannelTypes(ChannelType.GuildText);

            const actionRow2 = new ActionRowBuilder()
                .addComponents(channelMenu);

            await interaction.message.edit({ components: [actionRow] });
            const step2 = await interaction.followUp({ content: "Accepted. Please provide the announcement channel.", components: [actionRow2] });

            const collector = step2.createMessageComponentCollector({
                componentType: ComponentType.ChannelSelect,
                filter: i => i.user.id === interaction.user.id,
                time: 60000,
            });

            collector.on('collect', async i => {

                if (i.customId === 'setup_2_channel') {
                    await this.action_2(i);
                    collector.stop();
                }
            });

            // Next steps for channel setup can be initiated here
        } else {
            await interaction.reply("You have declined the terms. I will now leave the server.");
            await interaction.guild.leave();
        }
    }
    /**
     * 
     * @param {Interaction} interaction 
     * @returns 
     */
    async action_2(interaction) {
        let server = new Server(interaction.guildId);
        await server.load();
        let channelId = interaction.values[0];
        if (!hasPermission(interaction.guildId, channelId)) {
            interaction.reply('I need permission to view, send messages, embed links, and attach files in that channel');
            return;
        }

        server.announcement_channel = channelId;
        await server.save();

        //SEND A MESSAGE TO THE CHANNEL
        const guild = global.client.guilds.cache.get(interaction.guildId);
        const channel = guild.channels.cache.get(channelId);
        //channel.send({ embeds: [embedder.v5()] })

        await interaction.reply(`Announcement channel set to ${channel}`);

        interaction.followUp('Setup complete');

    }

}

function hasPermission(guildId, channelId) {

    //get the channel without using the interaction object
    const guild = global.client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(channelId);



    const botPermissions = channel.guild.members.me.permissionsIn(channel);

    if (!botPermissions.has('ViewChannel') || !botPermissions.has('SendMessages') || !botPermissions.has('EmbedLinks')) {
        return false;
    }

    return true;
}

module.exports = SetupHandler;
