const { SlashCommandBuilder, PermissionsBitField, WebhookClient, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const UserHandler = require("../../handlers/userHandler");


module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('View the Bot Terms and Rules')
		.addSubcommand(subcommand =>
			subcommand
				.setName('terms')
				.setDescription('Show the bot terms of service')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('rules')
				.setDescription('Show the content creation rules')
		),

	async execute(interaction) {
		let isAdmin = false;
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			isAdmin = true;
		}

		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case 'terms':
				sendTerms(interaction, isAdmin);
				break;
			case 'rules':
				// Handle showing the content creation rules
				break;
			default:
				// Handle invalid subcommand
				break;
		}

		if (!isAdmin) {

		}
	}
}


async function sendTerms(interaction, isAdmin) {
	const termsEmbed = new UserHandler().getTerms();
	const components = [];

	if (isAdmin) {
		components.push(
			new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('showAcceptTerms')
					.setLabel('Accept Terms')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('showRejectTerms')
					.setLabel('Decline Terms')
					.setStyle(ButtonStyle.Danger)
			)
		);
	}

	await interaction.reply({ ephemeral: true, embeds: [termsEmbed], components });
}

async function handleAcceptTerms(interaction) {
	
}

async function handleRejectTerms(interaction) {
	await i.update({ content: 'Terms declined. Leaving server...', components: [] });
	const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_SERVER_URL });
	webhookClient.send(`${interaction.guild.name} has rejected Terms and the bot is leaving!`);
	i.guild.leave();
}
