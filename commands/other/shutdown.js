const prefix = process.env.PREFIX;

const strings = require("../../resources/strings.json");
const settings = require("../../resources/settings.json");

const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "shutdown",
	aliases: ["logout", "die"],
	description: strings.command.description.shutdown,
	category: "Developer",
	guildOnly: false,
	uses: strings.command.use.devs,
	syntax: `${prefix}shutdown`,
	async execute(client, message, args) {
		if (process.env.DEVELOPERS.includes(message.author.id)) {
			await message.reply({ content: "Shutting down..." });
			process.exit();
		} else {
			const embed = new MessageEmbed()
				.setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
				.setDescription(`Banned <@${message.author.id}> \nReason: trying to stop me lmao`)
				.setColor(settings.colors.blue)
				.setTimestamp();
			await message.reply({ embeds: [embed] });
		}
	},
};
