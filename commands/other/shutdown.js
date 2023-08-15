const settings = require("../../resources/settings.json");

const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "shutdown",
	aliases: ["logout", "die"],
	guildOnly: false,
	async execute(client, message, args) {
		if (process.env.DEVELOPERS.includes(message.author.id)) {
			await message.reply({
				embeds: [new MessageEmbed().setTitle("Shutting down...").setColor(settings.colors.blue)],
			});
			process.exit();
		} else {
			const embed = new MessageEmbed()
				.setDescription(`<@${message.author.id}> has been banned`)
				.addFields({ name: "Reason", value: "trying to stop me lmao" })
				.setColor(settings.colors.blue);
			await message.reply({ embeds: [embed] });
		}
	},
};
