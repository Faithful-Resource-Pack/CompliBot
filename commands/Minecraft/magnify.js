const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'magnify',
	aliases: ['zoom', 'z', 'scale', 'mag', 'm'],
	description: strings.command.description.magnify,
	category: 'Minecraft',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}magnify (Default: up to 10 images above)\n${prefix}magnify (attach an image)\n${prefix}magnify (reply to a message)\n${prefix}magnify <Discord message url>\n${prefix}magnify <image URL>\n${prefix}magnify <message ID>\n${prefix}magnify [up/^/last]`,
	example: `${prefix}magnify`,
	async execute(client, message, args) {
		const embed = new MessageEmbed()
			.setTitle("This command has been deprecated!")
			.setDescription("Please use the new slash command of <@929066601930706954> instead.")
			.setColor(settings.colors.blue)
			.setThumbnail("https://cdn.discordapp.com/avatars/929066601930706954/86f92a2870e5924a04b75cc917cb4ecd.png?size=4096")
		return await message.reply({ embeds: [embed] })
	}
}
