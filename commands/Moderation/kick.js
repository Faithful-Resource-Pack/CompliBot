const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'kick',
	description: strings.command.description.kick,
	category: 'Moderation',
	guildOnly: true,
	uses: strings.command.use.mods,
	syntax: `${prefix}kick <@user> <reason>`,
	example: `${prefix}kick @RobertR11#7841 breaking rule 2`,
	async execute(client, message, args) {
		const embed = new MessageEmbed()
			.setTitle("This command has been deprecated!")
			.setDescription("Please use the new slash command of <@929066601930706954> instead.")
			.setColor(settings.colors.blue)
			.setThumbnail("https://cdn.discordapp.com/avatars/929066601930706954/86f92a2870e5924a04b75cc917cb4ecd.png?size=4096")
		return await message.reply({ embeds: [embed] })
	}
}