const settings = require("@resources/settings.json");
const saveDB = require("@functions/saveDB");

module.exports = {
	name: "backup",
	aliases: ["bdb"],
	guildOnly: false,
	async execute(client, message, args) {
		if (process.env.DEVELOPERS.includes(message.author.id)) {
			await saveDB(client, `Manual backup executed by: ${message.author.username}`);
			await message.react(settings.emojis.upvote);
		}
	},
};
