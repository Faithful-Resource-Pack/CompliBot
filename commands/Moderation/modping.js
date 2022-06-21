const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'modping',
	aliases: ['moderators', 'pingmods'],
	description: strings.command.description.modping,
	category: 'Moderation',
	guildOnly: true,
	uses: strings.command.use.anyone,
	syntax: `${prefix}modping`,
	/**
	 * @param {Discord.Client} client 
	 * @param {Discord.Message} message 
	 * @param {Array<string>} args
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