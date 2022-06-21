const prefix = process.env.PREFIX;

const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json')

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'clear',
	description: strings.command.description.clear,
	category: 'Moderation',
	guildOnly: true,
	uses: strings.command.use.mods,
	syntax: `${prefix}clear <amount>`,
	example: `${prefix}clear 10`,
	async execute(client, message, args) {
		const embed = new MessageEmbed()
			.setTitle("This command has been deprecated!")
			.setDescription("Please use the new slash command of <@929066601930706954> instead.")
			.setColor(settings.colors.blue)
			.setThumbnail("https://cdn.discordapp.com/avatars/929066601930706954/86f92a2870e5924a04b75cc917cb4ecd.png?size=4096")
		return await message.reply({ embeds: [embed] })
	}
};
