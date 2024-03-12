require('dotenv').config();
const { EmbedBuilder, Embed } = require('discord.js');

const Handler = require('./handler.js')
const Database = require('../database.js');
const embedder = require('../embedder.js');

class UserHandler extends Handler {

	db;

	constructor() {
		super();
		this.db = new Database();
	}

	async findGuild(id) {
		if (!id) return;
		return this.db.get('guilds', id)
			.then(guild => {
				return guild;
			});
	}

	startSetup(interaction) {

		const embed = this.getTerms();
		this.findGuild(interaction.guildId).then((data) => {
			if (!data) this.db.set('guilds', { id: interaction.guildId, name: interaction.guild.name, hasAccepted: 0, isBanned: 0 }).then(() => {
				interaction.reply({ embeds: [embed] });
			})
			else {
				if (!data.hasAccepted) interaction.reply('Setup has already been started. Please use /accept-terms to continue.');
				else interaction.reply('You have already accepted my terms');
			}
		})

	}

	async acceptSetup(interaction) {

		this.findGuild(interaction.guildId).then((data) => {
			if (!data) {
				interaction.channel.send({ content: "You must first use /setup and read the Terms of Use", ephemeral: true });
				return;
			}

			if (data.hasAccepted) {
				interaction.channel.send({ content: 'You have already accepted my terms', ephemeral: true });
				return;
			}

			let g = data;
			g.id = interaction.guildId;
			g.hasAccepted = 1;
			this.db.set('guilds', g);
			interaction.reply({ ephemeral: true, embeds: [embedder.accepted()] });
		})
	}

	getTerms() {
		return embedder.terms();
	}

}

module.exports = UserHandler