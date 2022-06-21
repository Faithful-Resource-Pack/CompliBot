const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'palette',
	aliases: ['p', 'colors', 'colormap', 'colours'],
	description: strings.command.description.palette,
	category: 'Minecraft',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}palette (Default: up to 10 images above)\n${prefix}palette (attach an image)\n${prefix}palette (reply to a message)\n${prefix}palette <Discord message url>\n${prefix}palette <image URL>\n${prefix}palette <message ID>\n${prefix}palette [up/^/last]`,
	async execute(client, message, args) {
		const embed = new MessageEmbed()
			.setTitle("This command has been deprecated!")
			.setDescription("Please use the new slash command of <@929066601930706954> instead.")
			.setColor(settings.colors.blue)
			.setThumbnail("https://cdn.discordapp.com/avatars/929066601930706954/86f92a2870e5924a04b75cc917cb4ecd.png?size=4096")
		return await message.reply({ embeds: [embed] })
	}
}