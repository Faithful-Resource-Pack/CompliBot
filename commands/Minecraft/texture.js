const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'texture',
	aliases: ['textures'],
	description: strings.command.description.texture,
	category: 'Minecraft',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}texture <16/32/64> <texture_name>\n${prefix}texture <16/32/64> <_name>\n${prefix}texture <16/32/64> </folder/>`,
	example: `${prefix}texture 16 dirt`,

	/**
	 * @param {Discord.Client} client The Discord bot client
	 * @param {Discord.Message} message The incoming message to respond to
	 * @param {Array<string>} args All words following the command
	 */
	async execute(client, message, args) {
		const embed = new MessageEmbed()
			.setTitle("This command has been deprecated!")
			.setDescription("Please use the new slash command of <@929066601930706954> instead.")
			.setColor(settings.colors.blue)
			.setThumbnail("https://cdn.discordapp.com/avatars/929066601930706954/86f92a2870e5924a04b75cc917cb4ecd.png?size=4096")
		return await message.reply({ embeds: [embed] })
	}
}
