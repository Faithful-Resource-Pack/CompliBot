const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'website',
	aliases: ['site', 'sites', 'websites'],
	description: strings.command.description.website,
	category: 'Server',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}website [keyword]`,
	example: `${prefix}website : only in DM\n${prefix}website compliance32|32x|32\n${prefix}website compliance64|64x|64\n${prefix}website dungeons\n${prefix}website mods\n${prefix}website tweaks\n${prefix}website addons`,
	async execute(client, message, args) {
		const embed = new MessageEmbed()
			.setTitle("This command has been deprecated!")
			.setDescription("Please use the new slash command of <@929066601930706954> instead.")
			.setColor(settings.colors.blue)
			.setThumbnail("https://cdn.discordapp.com/avatars/929066601930706954/86f92a2870e5924a04b75cc917cb4ecd.png?size=4096")
		return await message.reply({ embeds: [embed] })
	}
}