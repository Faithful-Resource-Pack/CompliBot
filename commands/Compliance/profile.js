const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'profile',
	description: strings.command.description.profile,
	category: 'Compliance',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}profile username <Your Name>\n${prefix}profile uuid <Your MC uuid (full uuid)>\n${prefix}profile show -> Display what the bot knows about you\n\nModerators only:\n${prefix}profile [@someone/username/nickname/id]`,
	/**
	 * @param {Discord.Client} _client Discord client handling command
	 * @param {Discord.Message} message Discord origin message
	 * @param {String[]} args Command arguments
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
