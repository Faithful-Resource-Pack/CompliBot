const prefix = process.env.PREFIX

const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'love',
  description: strings.command.description.love,
  category: 'Fun',
  guildOnly: true,
  uses: strings.command.use.anyone,
  syntax: `${prefix}love <@user1> <@user2>`,
  example: `${prefix}love @Juknum @TheRolf\n${prefix}love Juknum TheRolf`,
  /** @param {Discord.Message} message */
  async execute(client, message, args) {
		const embed = new MessageEmbed()
			.setTitle("This command has been deprecated!")
			.setDescription("Please use the new slash command of <@929066601930706954> instead.")
			.setColor(settings.colors.blue)
			.setThumbnail("https://cdn.discordapp.com/avatars/929066601930706954/86f92a2870e5924a04b75cc917cb4ecd.png?size=4096")
		return await message.reply({ embeds: [embed] })
	}
}
