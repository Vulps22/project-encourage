const { WebhookClient } = require("discord.js");
const UserHandler = require("./userHandler");

async function showAcceptTerms(interaction) {

    const termsEmbed = new UserHandler().getTerms();
    await interaction.update({components: []});
    await interaction.channel.send({ ephemeral: false, embeds: [termsEmbed], content: "Terms Accepted!"})
    new UserHandler().acceptSetup(interaction).then(() => {
        const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_SERVER_URL });
        webhookClient.send(`${interaction.guild.name} has accepted Terms and is now using the Bot!`);
    });
}

async function showRejectTerms(interaction) {
	await interaction.update({ content: 'Terms declined. Leaving server...', components: [] });
	const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_SERVER_URL });
	webhookClient.send(`${interaction.guild.name} has rejected Terms and the bot is leaving!`);
	interaction.guild.leave();
}

module.exports = {
    showAcceptTerms,
    showRejectTerms,
}