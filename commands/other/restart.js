const settings = require("../../resources/settings.json");
const { startBot } = require("../../index");
const fetchSettings = require("../../functions/fetchSettings");

const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "restart",
	guildOnly: false,
	async execute(client, message, args) {
		if (process.env.DEVELOPERS.includes(message.author.id)) {
			await message.reply({
				embeds: [new MessageEmbed().setTitle("Restarting...").setColor(settings.colors.blue)],
			});
			fetchSettings()
				.then(() => startBot())
				.catch(() =>
					message.channel.send({
						embeds: [
							new MessageEmbed()
								.setTitle("Something went wrong when restarting the bot!")
                                .setDescription("This error is likely related to fetching `settings.json`")
								.setColor(settings.colors.red)
								.setThumbnail(settings.images.error),
						],
					}),
				);
		} else await message.react(settings.emojis.downvote);
	},
};
