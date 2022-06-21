const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'poll',
	description: strings.command.description.poll,
	category: 'Server',
	guildOnly: true,
	uses: strings.command.use.disabled,
	syntax: `${prefix}poll <time in seconds> | <title> | <option1> | <option2> | ...`,
	example: `${prefix}poll 3600 | Add more beans to the bot? | Yes | No`,
	async execute(client, message, args) {
		const embed = new MessageEmbed()
			.setTitle("This command has been deprecated!")
			.setDescription("Please use the new slash command of <@929066601930706954> instead.")
			.setColor(settings.colors.blue)
			.setThumbnail("https://cdn.discordapp.com/avatars/929066601930706954/86f92a2870e5924a04b75cc917cb4ecd.png?size=4096")
		return await message.reply({ embeds: [embed] })
	}
}
