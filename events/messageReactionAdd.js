const client = require("../index").Client;
const settings = require("../resources/settings.json");

const reactionMenu = require("../functions/submission/reactionMenu");

module.exports = {
	name: "messageReactionAdd",
	async execute(reaction, user) {
		if (user.bot) return;
		if (reaction.message.partial) await reaction.message.fetch(); // dark magic to fetch message that are sent before the start of the bot

		// TEXTURE SUBMISSIONS
		const channelArray = Object.values(settings.submission.packs)
			.map((i) => Object.values(i.channels))
			.flat();

		if (channelArray.includes(reaction.message.channel.id)) {
			reactionMenu(client, reaction, user);
		}
	},
};
