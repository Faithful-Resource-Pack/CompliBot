const prefix  = process.env.PREFIX
const Discord = require('discord.js')

const settings = require('../../resources/settings')
const colors   = require('../../resources/colors')
const strings  = require('../../resources/strings')
const { addDeleteReact } = require('../../helpers/addDeleteReact')

module.exports = {
	name: 'ping',
	description: strings.HELP_DESC_PING,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}ping`,
	async execute(client, message, args) {
		const m = new Discord.MessageEmbed().setTitle('Ping?')

		message.inlineReply(m).then(async m => {
			const embed = new Discord.MessageEmbed()
				.setTitle('Pong!')
				.setColor(colors.BLUE)
				.setDescription(`Latency: ${m.createdTimestamp - message.createdTimestamp}ms \nAPI Latency: ${Math.round(client.ws.ping)}ms`)
				.setFooter(message.client.user.username, settings.BOT_IMG)
				
			await m.edit(embed)
			addDeleteReact(m, message, true)
		})
	}
}
