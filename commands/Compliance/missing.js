const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'missing',
  description: strings.command.description.missing,
  category: 'Compliance',
  guildOnly: false,
  uses: strings.command.use.anyone,
  syntax: `${prefix}missing <all|<32|64> <java|bedrock> [-u]>`,
  example: `${prefix}missing 32 java\n${prefix}missing 64 bedrock -u\n${prefix}missing all`,
	async execute(client, message, args) {
		const embed = new MessageEmbed()
			.setTitle("This command has been deprecated!")
			.setDescription("Please use the new slash command of <@929066601930706954> instead.")
			.setColor(settings.colors.blue)
			.setThumbnail("https://cdn.discordapp.com/avatars/929066601930706954/86f92a2870e5924a04b75cc917cb4ecd.png?size=4096")
		return await message.reply({ embeds: [embed] })
	}
};
