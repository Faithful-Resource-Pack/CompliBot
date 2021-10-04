const prefix  = process.env.PREFIX
const Discord = require('discord.js')

const settings = require('../../resources/settings')
const colors   = require('../../resources/colors')
const strings  = require('../../resources/strings')
const { addDeleteReact } = require('../../helpers/addDeleteReact')

const quotes = [
	"Feeling cute, might delete later",
	"Probably alive",
	"Sentient",
	"https://youtu.be/dQw4w9WgXcQ",
	"Will become real in 2023",
	"I know what you did on January 23rd 2018 at 2:33 am"
]

module.exports = {
	name: 'ping',
	description: strings.HELP_DESC_PING,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}ping`,
	async execute(client, message, args) {
		const m = new Discord.MessageEmbed().setTitle('Ping?').setColor(colors.BLUE)

		message.reply({embeds: [m]}).then(async m => {
			const embed = new Discord.MessageEmbed()
				.setTitle('Pong!')
				.setColor(colors.BLUE)
				.setDescription(`_${quotes[Math.floor(Math.random() * quotes.length)]}_\n\nLatency: ${m.createdTimestamp - message.createdTimestamp}ms \nAPI Latency: ${Math.round(client.ws.ping)}ms`)
				.setFooter(message.client.user.username, settings.BOT_IMG)
				
			await m.edit({embeds: [embed]})
			addDeleteReact(m, message, true)
		})
	}
}
