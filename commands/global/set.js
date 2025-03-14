const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandNumberOption, SlashCommandStringOption, SlashCommandChannelOption, TextChannel, SlashCommandRoleOption, Guild, Interaction, GuildMemberManager, GuildMember } = require("discord.js");
const Server = require("objects/server");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('Change the bot\'s settings')
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName('channel')
            .setDescription('Choose which channels notifications are sent to')
            .addStringOption(new SlashCommandStringOption()
                .setName('event')
                .setRequired(true)
                .setDescription('The notification you want to set')
                .addChoices(
                    { name: "Updates and announcements", value: 'announcements' },
                    { name: "User Level Up", value: 'levelup' },
                )
            )
            .addChannelOption(new SlashCommandChannelOption()
                .setName('channel')
                .setRequired(true)
                .setDescription("The channel where you want this notification")
            )
        )
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName('xp')
            .setDescription('Set the amount of XP users can gain or lose')
            .addStringOption(new SlashCommandStringOption()
                .setName('type')
                .setRequired(true)
                .setDescription('The type of XP offered')
                .addChoices(
                    { name: "Dare Complete", value: 'dare_success' },
                    { name: "Dare Failed", value: 'dare_fail' },
                    { name: "Truth Complete", value: 'truth_success' },
                    { name: "Truth Failed", value: 'truth_fail' },
                    { name: "Message Sent", value: 'message_sent' },
                )
            )
            .addNumberOption(new SlashCommandNumberOption()
                .setName('amount')
                .setRequired(true)
                .setDescription('The amount of xp gained or lost')
                .setMinValue(0)
            )
        )
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName('level-for-role')
            .setDescription('Set the level required for a role')
            .addRoleOption(new SlashCommandRoleOption()
                .setName('role')
                .setDescription('The role to set the level for')
                .setRequired(true)
            )
            .addNumberOption(new SlashCommandNumberOption()
                .setName('level')
                .setRequired(true)
                .setDescription('The level required for the role')
                .setMinValue(0)
            )
        ),
    nsfw: false,
    administrator: true,
    /**
     * 
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        if(!interaction.deferred) await interaction.deferReply({ ephemeral: true });


        const command = interaction.options.getSubcommand();

        switch (command) {
            case 'channel':
                await setChannel(interaction);
                break;
            case 'xp':
                await setXP(interaction);
                break;
            case 'level-for-role':
                await setLevelForRole(interaction);
                break;
            default:
                interaction.editReply('Invalid subcommand');
                break;
        }
    },
    hasPermission: hasPermission
}

async function setChannel(interaction) {
    const event = interaction.options.getString('event');
    /** @type {TextChannel} */
    const channel = interaction.options.getChannel('channel');

    //Log the parameters that have reached this point
    switch (event) {
        case 'announcements':
            await setAnnouncementChannel(channel, interaction);
            break;
        case 'levelup':
            await setLevelUpChannel(channel, interaction);
            break;
        default:
            console.log(`Invalid event ${event}`);
            break;
    }
}

async function setXP(interaction) {
    const type = interaction.options.getString('type');
    const amount = interaction.options.getNumber('amount');

    if (amount < 0) {
        interaction.editReply('You cannot set negative XP');
        return;
    }

    const server = new Server(interaction.guildId);
    await server.load();

    server.setXpRate(type, amount);
    await server.save();

    interaction.editReply(`Set ${type} XP to ${amount}`);
}


async function setAnnouncementChannel(channel, interaction) {

    if (!hasPermission(channel)) {
        interaction.editReply('I need permission to view, send messages, and attach files in that channel');
        return;
    }

    const server = new Server(channel.guildId);
    await server.load();
    server.announcement_channel = channel.id;
    await server.save();

    channel.send('Announcements will be sent here');
    interaction.editReply(`Announcements will be sent to <#${channel.id}>`);
}

/**
 * 
 * @param {TextChannel} channel 
 * @param {Interaction} interaction
 */
async function setLevelUpChannel(channel, interaction) {

    if (!hasPermission(channel)) {
        interaction.editReply('I need permission to view, send messages, and attach files in that channel');
        return;
    }

    const server = new Server(channel.guildId);
    await server.load();

    if (!await server.hasPremium()) {
        interaction.editReply("This is a premium command. Premium is not quite ready yet, But I'm working hard to make these commands available for everyone :)")

        //interaction.sendPremiumRequired();
        return;
    }

    server.level_up_channel = channel.id;
    await server.save();

    channel.send('Level up notifications will be sent here');
    interaction.editReply(`Level up notifications will be sent to <#${channel.id}>`);
}

/**
 * 
 * @param {Interaction} interaction 
 * @returns 
 */
async function setLevelForRole(interaction) {

    const server = new Server(interaction.guildId)
    await server.load();

    if (!await server.hasPremium()) {
        interaction.editReply("This is a premium command. Premium is not quite ready yet, But I'm working hard to make these commands available for everyone :)")

        //interaction.sendPremiumRequired();
        return;
    }
    /**
     * @type {Guild}
     */
    const guild = interaction.guild;
    /**
     * @type {GuildMemberManager}
     */
    const member = guild.members
    /**
     * @type {GuildMember}
     */
    const me = member.me

    const hasPermission = interaction.guild.members.me.permissions.has('ManageRoles');

    if (!hasPermission) {
        interaction.editReply("Unable to set the role to the level. I require the Manage Roles permission to give and take roles when players level up")
    }

    const role = interaction.options.getRole('role');
    const level = interaction.options.getNumber('level');

    await server.setLevelRole(role.id, level);
    await server.save();

    interaction.editReply(`Set <@&${role.id}> to level ${level}`);
}

function hasPermission(channel) {

    const botPermissions = channel.guild.members.me.permissionsIn(channel);

    if (!botPermissions.has('ViewChannel') || !botPermissions.has('SendMessages') || !botPermissions.has('AttachFiles')) {
        return false;
    }

    return true;
}